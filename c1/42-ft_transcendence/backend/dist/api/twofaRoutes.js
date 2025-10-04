"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = twofaRoutes;
const database_1 = __importDefault(require("../config/database"));
const _2fact_1 = require("../services/2fact");
async function twofaRoutes(app) {
    // 2FA: Step 1 - Generate secret and QR code for user to scan
    app.post('/api/2fa/setup', { preHandler: app.authenticate }, async (request, reply) => {
        const userId = request.user.id;
        try {
            // Generate new secret
            const user = await new Promise((resolve, reject) => {
                database_1.default.get('SELECT username FROM users WHERE id = ?', [userId], (err, row) => {
                    if (err)
                        return reject(err);
                    resolve(row);
                });
            });
            if (!user)
                return reply.status(404).send({ message: 'User not found.' });
            const { secret, otpauth } = (0, _2fact_1.createMfaSecret)(user.username);
            // Save secret temporarily (not enabled yet)
            await new Promise((resolve, reject) => {
                database_1.default.run('UPDATE users SET twofa_secret = ? WHERE id = ?', [secret, userId], function (err) {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
            const qr = await (0, _2fact_1.createMfaQrCode)(otpauth);
            reply.send({ qr, secret }); // Send QR code (data URL) and secret (for manual entry)
        }
        catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });
    // 2FA: Step 2 - Enable 2FA after verifying code
    app.post('/api/2fa/enable', { preHandler: app.authenticate }, async (request, reply) => {
        const userId = request.user.id;
        const { code } = request.body;
        if (!code)
            return reply.status(400).send({ message: '2FA code required.' });
        try {
            const user = await new Promise((resolve, reject) => {
                database_1.default.get('SELECT twofa_secret FROM users WHERE id = ?', [userId], (err, row) => {
                    if (err)
                        return reject(err);
                    resolve(row);
                });
            });
            if (!user || !user.twofa_secret)
                return reply.status(400).send({ message: '2FA setup not started.' });
            if (!(0, _2fact_1.validateMfaToken)(user.twofa_secret, code)) {
                return reply.status(400).send({ message: 'Invalid 2FA code.' });
            }
            await new Promise((resolve, reject) => {
                database_1.default.run('UPDATE users SET twofa_enabled = 1 WHERE id = ?', [userId], function (err) {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
            reply.send({ message: '2FA enabled.' });
        }
        catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });
}
