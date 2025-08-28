import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import databaseConnection from '../config/database';
import { verifyPassword } from '../services/pass_service';
import { validateMfaToken } from '../services/2fact';
import { validateUsername } from '../services/validators';
import { AuthRequestBody } from '../interfaces/auth';

export default async function signinRoutes(app: FastifyInstance) {
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
}