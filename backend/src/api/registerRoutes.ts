import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import databaseConnection from '../config/database';
import { encryptPassword } from '../services/pass_service';
import { AuthRequestBody } from '../interfaces/auth';
import { validateUsername, validatePassword } from '../services/validators';

export default async function registerRoutes(app: FastifyInstance) {
   app.post('/api/register', {
        config: {
            rateLimit: {
                max: 5,                     // max 5 requests per IP
                timeWindow: '1 minute',
                ban: 5 * 60 * 1000          // ban for 5 minutes
            }
        }
    }, async (request: FastifyRequest<{ Body: AuthRequestBody }>, reply: FastifyReply) => {
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
            const token = app.jwt.sign({ id: newUser.id, username: newUser.username, tfa: 'complete' });
            reply
                .setCookie('authToken', token, {
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
}