import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import databaseConnection from '../config/database';
import { verifyPassword, encryptPassword } from '../services/pass_service';
import { createMfaSecret, createMfaQrCode, validateMfaToken } from '../services/2fact';

interface AuthRequestBody {
    username?: string;
    password?: string;
    mfaCode?: string;
}

interface UserUpdateRequestBody {
    username?: string;
    displayName?: string;
}

// Username validation (alphanumeric, dot, underscore, hyphen)
const validateUsername = (username: string): boolean => {
    return /^[a-z0-9._-]{3,16}$/.test(username);
};


// Password validation (min 10 chars, upper, lower, number)
const validatePassword = (password: string): boolean => {
    return password.length >= 10 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password);
};

// Display name validation (example: 1-32 chars, no script tags)
const validateDisplayName = (name: string): boolean => {
    return typeof name === 'string' && name.length >= 1 && name.length <= 32 && !/<|>/.test(name);
};

export default async function registerAuthRoutes(app: FastifyInstance) {
    // Register
    app.post('/api/register', async (request: FastifyRequest<{ Body: AuthRequestBody }>, reply: FastifyReply) => {
        const { username, password } = request.body;

        if (!username || !password) {
            return reply.status(400).send({ message: 'Username and password are required.' });
        }

        if (!validateUsername(username)) {
            return reply.status(400).send({ message: 'Invalid username format. Use lowercase letters, numbers, ".", "_", or "-". Length 3-16.' });
        }
        if (!validatePassword(password)) {
            return reply.status(400).send({ message: 'Password does not meet complexity requirements (min 10 chars, 1 uppercase, 1 lowercase, 1 number).' });
        }

        try {
            const existingUser = await new Promise((resolve, reject) => {
                databaseConnection.get('SELECT * FROM users WHERE username = ?', [username.toLowerCase()], (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                });
            });

            if (existingUser) {
                return reply.status(409).send({ message: 'Username already exists.' });
            }

            const hashedPassword = await encryptPassword(password);

            await new Promise<void>((resolve, reject) => {
                databaseConnection.run(
                    'INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)',
                    [username.toLowerCase(), hashedPassword, username],
                    function (err) {
                        if (err) return reject(err);
                        resolve();
                    }
                );
            });

            // Fetch the new user's id
            const newUser = await new Promise<{ id: number, username: string }>((resolve, reject) => {
                databaseConnection.get('SELECT id, username FROM users WHERE username = ?', [username.toLowerCase()], (err, row) => {
                    if (err) return reject(err);
                    resolve(row as { id: number, username: string });
                });
            });

            // Issue JWT token in HTTP-only, Secure cookie
            const token = app.jwt.sign({ id: newUser.id, username: newUser.username });
            reply
                .setCookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7 // 7 days
                })
                .status(201)
                .send({ message: 'User registered successfully.' });
        } catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    // Sign-in
    app.post('/api/signin', async (request: FastifyRequest<{ Body: AuthRequestBody }>, reply: FastifyReply) => {
        const { username, password, mfaCode } = request.body;

        if (!username || !password) {
            return reply.status(400).send({ message: 'Username and password are required.' });
        }
        if (!validateUsername(username)) { // Also validate username format on sign-in
            return reply.status(400).send({ message: 'Invalid username format.' });
        }

        try {
            const user: { id: number, username: string, password_hash: string, mfa_enabled: number, twofa_secret: string | null } | undefined = await new Promise((resolve, reject) => {
                databaseConnection.get('SELECT id, username, password_hash, mfa_enabled, twofa_secret FROM users WHERE username = ?', [username.toLowerCase()], (err, row) => {
                    if (err) return reject(err);
                    resolve(row as any);
                });
            });

            if (!user) {
                return reply.status(401).send({ message: 'Invalid username or password.' });
            }

            const passwordMatch = await verifyPassword(password, user.password_hash);

            if (!passwordMatch) {
                return reply.status(401).send({ message: 'Invalid username or password.' });
            }

            // --- MFA Logic ---
            if (user.mfa_enabled) {
                if (!mfaCode) {
                    // Password is correct, but MFA is enabled and no code was provided.
                    // Issue a temporary, "pending" token that is only valid for the next MFA step.
                    const pendingToken = app.jwt.sign(
                        { id: user.id, username: user.username, tfa: 'pending' },
                        { expiresIn: '5m' } // This token is short-lived
                    );

                    // Set the temporary token in the cookie.
                    reply.setCookie('token', pendingToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict',
                        path: '/',
                        maxAge: 5 * 60, // 5 minutes
                    });
                    
                    // Inform the frontend that the 2FA step is required.
                    // We use a 200 OK status because the password was correct.
                    return reply.status(200).send({ message: '2FA code required.', twofaRequired: true });
                }

                // A 2FA code was provided. We need to verify it.
                // We also need to ensure this request is coming from a user who just passed the password step
                // by verifying the "pending" token that should be in the cookie.
                try {
                    const decodedToken = request.server.jwt.verify(request.cookies.token || '') as { id: number, username: string, tfa: string };
                    if (decodedToken.id !== user.id || decodedToken.tfa !== 'pending') {
                        return reply.status(401).send({ message: 'Invalid session. Please sign in again.' });
                    }
                } catch (err) {
                    return reply.status(401).send({ message: 'Invalid or expired 2FA session. Please sign in again.' });
                }

                if (!user.twofa_secret || !validateMfaToken(user.twofa_secret, mfaCode)) {
                    // The code was provided but it's wrong.
                    return reply.status(401).send({ message: 'Invalid 2FA code.', twofaRequired: true });
                }
            }

            // --- Token Issuance ---
            // This block is reached if:
            // 1. 2FA is disabled.
            // 2. 2FA is enabled and the correct code was provided.
            const token = app.jwt.sign({ id: user.id, username: user.username, tfa: 'complete' });
            reply
                .setCookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7 // 7 days
                })
                .status(200)
                .send({ message: 'Sign-in successful.', user: { username: user.username }, twofaEnabled: !!user.mfa_enabled });
        } catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    // Sign-out
    app.post('/api/signout', async (request, reply) => {
        reply.clearCookie('token', { path: '/' });
        reply.status(200).send({ message: 'Signed out.' });
    });

    // Get current user info (protected)
    app.get('/api/me', { preHandler: app.authenticate }, async (request: any, reply: FastifyReply) => {
        const userId = request.user.id;
        try {
            const user = await new Promise((resolve, reject) => {
                databaseConnection.get(
                    'SELECT id, username, display_name, created_at, twofa_enabled FROM users WHERE id = ?',
                    [userId],
                    (err, row) => {
                        if (err) return reject(err);
                        resolve(row);
                    }
                );
            });
            if (!user) {
                return reply.status(404).send({ message: 'User not found.' });
            }
            reply.send({ user });
        } catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    // Update user info (protected)
    app.put(
        '/api/me',
        { preHandler: (app as any).requireAuth },
        async (
            request: FastifyRequest<{ Body: UserUpdateRequestBody }>,
            reply: FastifyReply
        ) => {
        const userId = (request as any).user.id;
        const { username, displayName } = request.body;

        // Validate display name if provided
        if (displayName && !validateDisplayName(displayName)) {
            return reply.status(400).send({ message: 'Invalid display name.' });
        }

        // Validate username if provided
        if (username && !validateUsername(username)) {
            return reply.status(400).send({ message: 'Invalid username format.' });
        }

        try {
            // Fetch current user info
            const currentUser = await new Promise<any>((resolve, reject) => {
                databaseConnection.get('SELECT username, display_name FROM users WHERE id = ?', [userId], (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                });
            });

            // If username is being changed, check for uniqueness
            if (username && username.toLowerCase() !== currentUser.username) {
                const existingUser = await new Promise((resolve, reject) => {
                    databaseConnection.get('SELECT id FROM users WHERE username = ? AND id != ?', [username.toLowerCase(), userId], (err, row) => {
                        if (err) return reject(err);
                        resolve(row);
                    });
                });
                if (existingUser) {
                    return reply.status(409).send({ message: 'Username already exists.' });
                }
            }

            // Build update query dynamically
            const updates: string[] = [];
            const params: any[] = [];

            if (username && username.toLowerCase() !== currentUser.username) {
                updates.push('username = ?');
                params.push(username.toLowerCase());
            }
            if (displayName !== undefined && displayName !== currentUser.display_name) {
                updates.push('display_name = ?');
                params.push(displayName);
            }
            if (updates.length === 0) {
                return reply.status(400).send({ message: 'No changes to update.' });
            }
            params.push(userId);

            await new Promise<void>((resolve, reject) => {
                databaseConnection.run(
                    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
                    params,
                    function (err) {
                        if (err) return reject(err);
                        resolve();
                    }
                );
            });

            reply.send({ message: 'Profile updated.' });
        } catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    // 2FA: Step 1 - Generate secret and QR code for user to scan
    app.post('/api/2fa/setup', { preHandler: app.authenticate }, async (request: any, reply: FastifyReply) => {
        const userId = request.user.id;
        try {
            // Generate new secret
            const user = await new Promise<any>((resolve, reject) => {
                databaseConnection.get('SELECT username FROM users WHERE id = ?', [userId], (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                });
            });
            if (!user) return reply.status(404).send({ message: 'User not found.' });

            const { secret, otpauth } = createMfaSecret(user.username);

            // Save secret temporarily (not enabled yet)
            await new Promise<void>((resolve, reject) => {
                databaseConnection.run('UPDATE users SET twofa_secret = ? WHERE id = ?', [secret, userId], function (err) {
                    if (err) return reject(err);
                    resolve();
                });
            });

            const qr = await createMfaQrCode(otpauth);

            reply.send({ qr, secret }); // Send QR code (data URL) and secret (for manual entry)
        } catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    // 2FA: Step 2 - Enable 2FA after verifying code
    app.post('/api/2fa/enable', { preHandler: app.authenticate }, async (request: any, reply: FastifyReply) => {
        const userId = request.user.id;
        const { code } = request.body as { code: string };
        if (!code) return reply.status(400).send({ message: '2FA code required.' });

        try {
            const user = await new Promise<any>((resolve, reject) => {
                databaseConnection.get('SELECT twofa_secret FROM users WHERE id = ?', [userId], (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                });
            });
            if (!user || !user.twofa_secret) return reply.status(400).send({ message: '2FA setup not started.' });

            if (!validateMfaToken(user.twofa_secret, code)) {
                return reply.status(400).send({ message: 'Invalid 2FA code.' });
            }

            await new Promise<void>((resolve, reject) => {
                databaseConnection.run('UPDATE users SET twofa_enabled = 1 WHERE id = ?', [userId], function (err) {
                    if (err) return reject(err);
                    resolve();
                });
            });

            reply.send({ message: '2FA enabled.' });
        } catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    // MFA: Disable (requires valid code)
    app.post('/api/2fa/disable', { preHandler: app.authenticate }, async (request: any, reply: FastifyReply) => {
        const userId = request.user.id;
        const { code } = request.body as { code: string };
        if (!code) return reply.status(400).send({ message: '2FA code required.' });

        try {
            const user = await new Promise<any>((resolve, reject) => {
                databaseConnection.get('SELECT twofa_secret, twofa_enabled FROM users WHERE id = ?', [userId], (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                });
            });
            if (!user || !user.twofa_secret || !user.twofa_enabled) return reply.status(400).send({ message: '2FA not enabled.' });

            if (!validateMfaToken(user.twofa_secret, code)) {
                return reply.status(400).send({ message: 'Invalid 2FA code.' });
            }

            await new Promise<void>((resolve, reject) => {
                databaseConnection.run('UPDATE users SET twofa_enabled = 0, twofa_secret = NULL WHERE id = ?', [userId], function (err) {
                    if (err) return reject(err);
                    resolve();
                });
            });

            reply.send({ message: '2FA disabled.' });
        } catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });
}