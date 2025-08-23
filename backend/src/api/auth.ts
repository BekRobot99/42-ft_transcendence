import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import databaseConnection from '../config/database';
import { verifyPassword, encryptPassword } from '../services/pass_service';

interface AuthRequestBody {
    username?: string;
    password?: string;
}

const validateUsername = (username: string): boolean => {
    return /^[a-z0-9._-]{3,16}$/.test(username);
};

const validatePassword = (password: string): boolean => {
    return password.length >= 10 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password);
};

export default async function registerAuthRoutes(app: FastifyInstance) {
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
                databaseConnection.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username.toLowerCase(), hashedPassword], function (err) {
                    if (err) return reject(err);
                    resolve();
                });
            });

            reply.status(201).send({ message: 'User registered successfully.' });
        } catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });

    app.post('/api/signin', async (request: FastifyRequest<{ Body: AuthRequestBody }>, reply: FastifyReply) => {
        const { username, password } = request.body;

        if (!username || !password) {
            return reply.status(400).send({ message: 'Username and password are required.' });
        }
        if (!validateUsername(username)) {
            return reply.status(400).send({ message: 'Invalid username format.' });
        }

        try {
            const user: { username: string, password_hash: string } | undefined = await new Promise((resolve, reject) => {
                databaseConnection.get('SELECT username, password_hash FROM users WHERE username = ?', [username.toLowerCase()], (err, row) => {
                    if (err) return reject(err);
                    resolve(row as { username: string, password_hash: string } | undefined);
                });
            });

            if (!user) {
                return reply.status(401).send({ message: 'Invalid username or password.' });
            }

            const passwordIsCorrect = await verifyPassword(password, user.password_hash);

            if (!passwordIsCorrect) {
                return reply.status(401).send({ message: 'Invalid username or password.' });
            }

            reply.status(200).send({ message: 'Sign-in successful.', user: { username: user.username } });
        } catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });
}
