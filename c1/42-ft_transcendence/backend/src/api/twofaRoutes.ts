import { FastifyInstance, FastifyReply } from 'fastify';
import databaseConnection from '../config/database';
import { createMfaSecret, createMfaQrCode, validateMfaToken } from '../services/2fact';

export default async function twofaRoutes(app: FastifyInstance) {
    // 2FA: Step 1 - Generate secret and QR code for user to scan
    app.post('/api/2fa/setup', { preHandler: (app as any).authenticate }, async (request: any, reply: FastifyReply) => {
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
    app.post('/api/2fa/enable', { preHandler: (app as any).authenticate }, async (request: any, reply: FastifyReply) => {
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
}