"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = userRoutes;
const database_1 = __importDefault(require("../config/database"));
const validators_1 = require("../services/validators");
async function userRoutes(app) {
    // Get current user info (protected)
    app.get('/api/me', { preHandler: app.authenticate }, async (request, reply) => {
        const userId = request.user.id;
        try {
            const user = await new Promise((resolve, reject) => {
                database_1.default.get('SELECT id, username, display_name, created_at, twofa_enabled, avatar_path FROM users WHERE id = ?', [userId], (err, row) => {
                    if (err)
                        return reject(err);
                    resolve(row);
                });
            });
            if (!user) {
                return reply.status(404).send({ message: 'User not found.' });
            }
            reply.send({ user });
        }
        catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });
    // Update user info (protected)
    app.put('/api/me', { preHandler: app.requireAuth }, async (request, reply) => {
        const userId = request.user.id;
        const { username, displayName } = request.body;
        // Validate display name if provided
        if (displayName && !(0, validators_1.validateDisplayName)(displayName)) {
            return reply.status(400).send({ message: 'Invalid display name.' });
        }
        // Validate username if provided
        if (username && !(0, validators_1.validateUsername)(username)) {
            return reply.status(400).send({ message: 'Invalid username format.' });
        }
        try {
            // Fetch current user info
            const currentUser = await new Promise((resolve, reject) => {
                database_1.default.get('SELECT username, display_name FROM users WHERE id = ?', [userId], (err, row) => {
                    if (err)
                        return reject(err);
                    resolve(row);
                });
            });
            // If username is being changed, check for uniqueness
            if (username && username.toLowerCase() !== currentUser.username) {
                const existingUser = await new Promise((resolve, reject) => {
                    database_1.default.get('SELECT id FROM users WHERE username = ? AND id != ?', [username.toLowerCase(), userId], (err, row) => {
                        if (err)
                            return reject(err);
                        resolve(row);
                    });
                });
                if (existingUser) {
                    return reply.status(409).send({ message: 'Username already exists.' });
                }
            }
            // Build update query dynamically
            const updates = [];
            const params = [];
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
            await new Promise((resolve, reject) => {
                database_1.default.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params, function (err) {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
            reply.send({ message: 'Profile updated.' });
        }
        catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });
}
