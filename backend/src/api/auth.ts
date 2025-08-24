import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import databaseConnection from '../config/database';
import { verifyPassword, encryptPassword } from '../services/pass_service';

interface AuthRequestBody {
    username?: string;
    password?: string;
}

interface UserUpdateRequestBody {
    displayName?: string;
}

// Username validation (alphanumeric, dot, underscore, hyphen)
const validateUsername = (username: string): boolean => {
    return /^[a-z0-9._-]{3,16}$/.test(username);
};

// Password validation (min 10 chars, upper, lower, number)
const validatePassword = (password: string): boolean => {
    return (
        password.length >= 10 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password)
    );
};

// Display name validation (1–32 chars, no < > allowed)
const validateDisplayName = (name: string): boolean => {
    return (
        typeof name === 'string' &&
        name.length >= 1 &&
        name.length <= 32 &&
        !/<|>/.test(name)
    );
};

// Extend FastifyRequest to include
export default async function registerAuthRoutes(app: FastifyInstance) {
    // Register
    app.post(
        '/api/register',
        async (
            request: FastifyRequest<{ Body: AuthRequestBody }>,
            reply: FastifyReply
        ) => {
            const { username, password } = request.body;

            if (!username || !password) {
                return reply
                    .status(400)
                    .send({ message: 'Username and password are required.' });
            }

            if (!validateUsername(username)) {
                return reply.status(400).send({
                    message:
                        'Invalid username format. Use lowercase letters, numbers, ".", "_", or "-". Length 3-16.',
                });
            }
            if (!validatePassword(password)) {
                return reply.status(400).send({
                    message:
                        'Password does not meet complexity requirements (min 10 chars, 1 uppercase, 1 lowercase, 1 number).',
                });
            }

            try {
                const existingUser = await new Promise((resolve, reject) => {
                    databaseConnection.get(
                        'SELECT * FROM users WHERE username = ?',
                        [username.toLowerCase()],
                        (err, row) => {
                            if (err) return reject(err);
                            resolve(row);
                        }
                    );
                });

                if (existingUser) {
                    return reply
                        .status(409)
                        .send({ message: 'Username already exists.' });
                }

                const hashedPassword = await encryptPassword(password);

                await new Promise<void>((resolve, reject) => {
                    databaseConnection.run(
                        'INSERT INTO users (username, password_hash) VALUES (?, ?)',
                        [username.toLowerCase(), hashedPassword],
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
        }
    );

    // Sign-in
    app.post(
        '/api/signin',
        async (
            request: FastifyRequest<{ Body: AuthRequestBody }>,
            reply: FastifyReply
        ) => {
            const { username, password } = request.body;

            if (!username || !password) {
                return reply
                    .status(400)
                    .send({ message: 'Username and password are required.' });
            }
            if (!validateUsername(username)) {
                return reply
                    .status(400)
                    .send({ message: 'Invalid username format.' });
            }

            try {
                const user:
                    | { id: number; username: string; password_hash: string }
                    | undefined = await new Promise((resolve, reject) => {
                    databaseConnection.get(
                        'SELECT id, username, password_hash FROM users WHERE username = ?',
                        [username.toLowerCase()],
                        (err, row) => {
                            if (err) return reject(err);
                            resolve(
                                row as
                                    | {
                                          id: number;
                                          username: string;
                                          password_hash: string;
                                      }
                                    | undefined
                            );
                        }
                    );
                });

                if (!user) {
                    return reply
                        .status(401)
                        .send({ message: 'Invalid username or password.' });
                }

                const passwordIsCorrect = await verifyPassword(
                    password,
                    user.password_hash
                );

                if (!passwordIsCorrect) {
                    return reply
                        .status(401)
                        .send({ message: 'Invalid username or password.' });
                }

                // Issue JWT token in HTTP-only, Secure cookie
                const token = app.jwt.sign({
                    id: user.id,
                    user: user.username,
                });
                reply
                    .setCookie('authToken', token, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict',
                        path: '/',
                        maxAge: 60 * 60 * 24 * 7, // 7 days
                    })
                    .status(200)
                    .send({
                        message: 'Sign-in successful.',
                        user: { username: user.username },
                    });
            } catch (error) {
                app.log.error(error);
                reply.status(500).send({ message: 'Internal server error.' });
            }
        }
    );

    // Sign-out
    app.post('/api/signout', async (request, reply) => {
        reply.clearCookie('authToken', { path: '/' });
        reply.status(200).send({ message: 'Signed out.' });
    });

    // Get current user info (protected)
    app.get(
        '/api/me',
        { preHandler: (app as any).requireAuth },
        async (request: FastifyRequest & AuthenticatedRequest, reply: FastifyReply) => {
            const userId = request.user.id;
            try {
                const user = await new Promise((resolve, reject) => {
                    databaseConnection.get(
                        'SELECT id, username, display_name, created_at FROM users WHERE id = ?',
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
        }
    );

    // Update user info (protected) - FIXED VERSION
    app.put(
        '/api/me',
        { preHandler: (app as any).requireAuth },
        async (
            request: FastifyRequest<{ Body: UserUpdateRequestBody }> & AuthenticatedRequest,
            reply: FastifyReply
        ) => {
            const userId = request.user.id;
            const { displayName } = request.body;

            if (displayName && !validateDisplayName(displayName)) {
                return reply
                    .status(400)
                    .send({ message: 'Invalid display name.' });
            }

            try {
                await new Promise<void>((resolve, reject) => {
                    databaseConnection.run(
                        'UPDATE users SET display_name = ? WHERE id = ?',
                        [displayName, userId],
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
        }
    );
}
