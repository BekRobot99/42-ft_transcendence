"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = avatarRoutes;
const file_type_1 = require("file-type");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const database_1 = __importDefault(require("../config/database"));
async function avatarRoutes(app) {
    // Upload avatar (protected)
    app.post('/api/me/avatar', { preHandler: app.authenticate }, async (request, reply) => {
        const userId = request.user.id;
        const data = await request.file();
        if (!data) {
            return reply.status(400).send({ message: 'No file uploaded.' });
        }
        // Read file into a buffer to validate its content
        const buffer = await data.toBuffer();
        // 1. Validate file type based on its actual content (magic numbers)
        const type = await (0, file_type_1.fileTypeFromBuffer)(buffer);
        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        if (!type || !allowedMimeTypes.includes(type.mime)) {
            return reply.status(400).send({ message: 'Invalid file type. Only JPEG and PNG are allowed.' });
        }
        try {
            // Get current avatar to delete it later
            const user = await new Promise((resolve, reject) => {
                database_1.default.get('SELECT avatar_path FROM users WHERE id = ?', [userId], (err, row) => {
                    if (err)
                        return reject(err);
                    resolve(row);
                });
            });
            if (!user) {
                return reply.status(404).send({ message: 'User not found.' });
            }
            const oldAvatarPath = user.avatar_path;
            // Generate a unique filename
            const extension = `.${type.ext}`; // Use the validated extension
            const filename = `${userId}-${Date.now()}${extension}`;
            const uploadsDir = path_1.default.join(process.cwd(), 'uploads', 'avatars');
            const filePath = path_1.default.join(uploadsDir, filename);
            const fileUrl = `/uploads/avatars/${filename}`;
            // 2. Sanitize and save the new file using sharp
            await (0, sharp_1.default)(buffer)
                .resize(200, 200)
                .toFile(filePath);
            // Update database
            await new Promise((resolve, reject) => {
                database_1.default.run('UPDATE users SET avatar_path = ? WHERE id = ?', [fileUrl, userId], (err) => {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
            // Delete old avatar if it exists
            if (oldAvatarPath) {
                const oldFilePath = path_1.default.join(process.cwd(), oldAvatarPath.substring(1));
                if (fs_1.default.existsSync(oldFilePath)) {
                    fs_1.default.unlink(oldFilePath, (err) => {
                        if (err) {
                            app.log.error(`Failed to delete old avatar: ${oldFilePath}`, err);
                        }
                    });
                }
            }
            reply.send({ message: 'Avatar updated successfully.', avatarUrl: fileUrl });
        }
        catch (error) {
            app.log.error(error);
            if (error.code === 'FST_PARTS_LIMIT' || error.code === 'FST_FILES_LIMIT') {
                return reply.status(413).send({ message: 'File size limit exceeded.' });
            }
            reply.status(500).send({ message: 'Internal server error during file upload.' });
        }
    });
    // Delete avatar (protected)
    app.delete('/api/me/avatar', { preHandler: app.authenticate }, async (request, reply) => {
        const userId = request.user.id;
        try {
            // Get current avatar path from DB
            const user = await new Promise((resolve, reject) => {
                database_1.default.get('SELECT avatar_path FROM users WHERE id = ?', [userId], (err, row) => {
                    if (err)
                        return reject(err);
                    resolve(row);
                });
            });
            if (!user) {
                return reply.status(404).send({ message: 'User not found.' });
            }
            const currentAvatarPath = user.avatar_path;
            if (!currentAvatarPath) {
                return reply.status(400).send({ message: 'No avatar to delete.' });
            }
            // Delete the file from the filesystem
            const filePath = path_1.default.join(process.cwd(), currentAvatarPath.substring(1)); // remove leading '/'
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlink(filePath, (err) => {
                    if (err) {
                        // Log the error but don't block the DB update
                        app.log.error(`Failed to delete avatar file: ${filePath}`, err);
                    }
                });
            }
            // Update the database, setting avatar_path to NULL
            await new Promise((resolve, reject) => {
                database_1.default.run('UPDATE users SET avatar_path = NULL WHERE id = ?', [userId], (err) => {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
            reply.send({ message: 'Avatar deleted successfully.' });
        }
        catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });
}
