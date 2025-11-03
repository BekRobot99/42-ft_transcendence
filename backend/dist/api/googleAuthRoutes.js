"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerGoogleAuthRoutes;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const google_auth_library_1 = require("google-auth-library");
const path_1 = __importDefault(require("path"));
const stream_1 = require("stream");
const util_1 = require("util");
const database_1 = __importDefault(require("../config/database"));
const _2fact_1 = require("../services/2fact");
const pump = (0, util_1.promisify)(stream_1.pipeline);
async function registerGoogleAuthRoutes(fastify) {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
        fastify.log.warn('Google OAuth environment variables are not set. Google Sign-In will be disabled.');
        return;
    }
    const oauth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
    // Endpoint for the frontend to get the Google Auth URL
    fastify.get('/api/auth/google/url', async (request, reply) => {
        const scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ];
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
        });
        reply.send({ url });
    });
    // Endpoint to handle the callback from Google
    fastify.post('/api/auth/google/callback', async (request, reply) => {
        const { code } = request.body;
        if (!code) {
            return reply.status(400).send({ message: 'Authorization code is missing.' });
        }
        try {
            // Exchange code for tokens
            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);
            // Verify the ID token and get user info
            const ticket = await oauth2Client.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.sub || !payload.email) {
                return reply
                    .status(400)
                    .send({ message: 'Failed to retrieve user information from Google.' });
            }
            const googleId = payload.sub;
            const email = payload.email;
            const displayName = payload.name || email.split('@')[0];
            const avatarUrl = payload.picture;
            // Check if user already exists
            let user = await new Promise((resolve, reject) => {
                database_1.default.get('SELECT * FROM users WHERE google_id = ?', [googleId], (err, row) => {
                    if (err)
                        return reject(err);
                    resolve(row);
                });
            });
            if (!user) {
                // User does not exist, create a new one
                let username = email
                    .split('@')[0]
                    .replace(/[^a-z0-9._-]/gi, '')
                    .toLowerCase();
                if (!/^[a-z0-9._-]{3,16}$/.test(username)) {
                    username = `user${Date.now()}`;
                }
                // Ensure username is unique
                let isUsernameTaken = true;
                let usernameSuffix = 0;
                while (isUsernameTaken) {
                    const tempUsername = username + (usernameSuffix > 0 ? usernameSuffix : '');
                    const existingUser = await new Promise((resolve, reject) => {
                        database_1.default.get('SELECT id FROM users WHERE username = ?', [tempUsername], (err, row) => {
                            if (err)
                                return reject(err);
                            resolve(row);
                        });
                    });
                    if (!existingUser) {
                        username = tempUsername;
                        isUsernameTaken = false;
                    }
                    else {
                        usernameSuffix++;
                    }
                }
                // Download avatar
                let localAvatarPath = null;
                if (avatarUrl) {
                    try {
                        const response = await axios_1.default.get(avatarUrl, { responseType: 'stream' });
                        const extension = '.jpg'; // Assume jpg, Google picture URLs don't have extensions
                        const filename = `${googleId}-${Date.now()}${extension}`;
                        const uploadsDir = path_1.default.join(process.cwd(), 'uploads', 'avatars');
                        const filePath = path_1.default.join(uploadsDir, filename);
                        await pump(response.data, fs_1.default.createWriteStream(filePath));
                        localAvatarPath = `/uploads/avatars/${filename}`;
                    }
                    catch (avatarError) {
                        fastify.log.error('Failed to download Google avatar:', avatarError);
                    }
                }
                // Insert new user into DB
                const result = await new Promise((resolve, reject) => {
                    database_1.default.run('INSERT INTO users (google_id, username, display_name, avatar_path, twofa_enabled) VALUES (?, ?, ?, ?, 0)', [googleId, username, displayName, localAvatarPath], function (err) {
                        if (err)
                            return reject(err);
                        resolve({ lastID: this.lastID });
                    });
                });
                user = { id: result.lastID, username: username };
            }
            if (user.twofa_enabled) {
                // 2FA is enabled. Issue a pending token and prompt for code.
                const pendingToken = fastify.jwt.sign({ id: user.id, username: user.username, tfa: 'pending' }, { expiresIn: '5m' });
                reply.setCookie('authToken', pendingToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 5 * 60, // 5 minutes
                });
                return reply.status(200).send({ twofaRequired: true });
            }
            // Issue JWT token
            const token = fastify.jwt.sign({ id: user.id, username: user.username, tfa: 'complete' });
            reply
                .setCookie('authToken', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            })
                .status(200)
                .send({ message: 'Sign-in successful.' });
        }
        catch (error) {
            fastify.log.error(error, 'Google OAuth callback error');
            reply
                .status(500)
                .send({ message: 'An error occurred during Google authentication.' });
        }
    });
    // Endpoint to verify 2FA code after Google Sign-In
    fastify.post('/api/auth/google/verify-2fa', async (request, reply) => {
        const { mfaCode } = request.body;
        if (!mfaCode) {
            return reply.status(400).send({ message: 'MFA code is required.' });
        }
        let decodedToken;
        try {
            // Verify the pending token from the cookie
            decodedToken = await request.jwtVerify({ onlyCookie: true });
            if (decodedToken.tfa !== 'pending') {
                throw new Error('Not a pending 2FA token.');
            }
        }
        catch (err) {
            return reply.status(401).send({ message: 'Invalid or expired session. Please sign in again.' });
        }
        const userId = decodedToken.id;
        const user = await new Promise((resolve, reject) => {
            database_1.default.get('SELECT twofa_secret FROM users WHERE id = ?', [userId], (err, row) => {
                if (err)
                    return reject(err);
                resolve(row);
            });
        });
        if (!user || !user.twofa_secret || !(0, _2fact_1.validateMfaToken)(user.twofa_secret, mfaCode)) {
            return reply.status(401).send({ message: 'Invalid 2FA code.', twofaRequired: true });
        }
        // 2FA code is correct. Issue a complete token.
        const token = fastify.jwt.sign({ id: decodedToken.id, username: decodedToken.username, tfa: 'complete' });
        reply
            .setCookie('authToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        })
            .status(200)
            .send({ message: 'Sign-in successful.' });
    });
}
