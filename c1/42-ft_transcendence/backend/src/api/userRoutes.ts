import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import databaseConnection from '../config/database';
import { UserUpdateRequestBody } from '../interfaces/auth';
import { validateDisplayName, validateUsername } from '../services/validators';

export default async function userRoutes(app: FastifyInstance) {
    // Get current user info (protected)
   app.get('/api/me', { preHandler: (app as any).authenticate }, async (request: any, reply: FastifyReply) => {
        const userId = request.user.id;
        try {
            const user = await new Promise((resolve, reject) => {
                databaseConnection.get(
                    'SELECT id, username, display_name, created_at, twofa_enabled, avatar_path FROM users WHERE id = ?',
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
}