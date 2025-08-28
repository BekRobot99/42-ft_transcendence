import { FastifyInstance, FastifyReply } from 'fastify';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import databaseConnection from '../config/database';

const streamPipeline = promisify(pipeline);

export default async function avatarRoutes(app: FastifyInstance) {
    // Upload avatar (protected)
    app.post('/api/me/avatar', { preHandler: (app as any).authenticate }, async (request: any, reply: FastifyReply) => {
        const userId = request.user.id;
        const data = await request.file();

        if (!data) {
            return reply.status(400).send({ message: 'No file uploaded.' });
        }

        // Validate MIME type
        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        if (!allowedMimeTypes.includes(data.mimetype)) {
            return reply.status(400).send({ message: 'Invalid file type. Only JPEG and PNG are allowed.' });
        }

        try {
            // Get current avatar to delete it later
            const user = await new Promise<{ avatar_path: string | null }>((resolve, reject) => {
                databaseConnection.get('SELECT avatar_path FROM users WHERE id = ?', [userId], (err, row) => {
                    if (err) return reject(err);
                    resolve(row as { avatar_path: string | null });
                });
            });

            if (!user) {
                return reply.status(404).send({ message: 'User not found.' });
            }

            const oldAvatarPath = user.avatar_path;

            // Generate a unique filename
            const extension = path.extname(data.filename);
            const filename = `${userId}-${Date.now()}${extension}`;
            const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
            const filePath = path.join(uploadsDir, filename);
            const fileUrl = `/uploads/avatars/${filename}`;

            // Save the new file
            await streamPipeline(data.file, fs.createWriteStream(filePath));

            // Update database
            await new Promise<void>((resolve, reject) => {
                databaseConnection.run('UPDATE users SET avatar_path = ? WHERE id = ?', [fileUrl, userId], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            // Delete old avatar if it exists
            if (oldAvatarPath) {
                const oldFilePath = path.join(process.cwd(), oldAvatarPath.substring(1));
                if (fs.existsSync(oldFilePath)) {
                    fs.unlink(oldFilePath, (err) => {
                        if (err) {
                            app.log.error(`Failed to delete old avatar: ${oldFilePath}`, err);
                        }
                    });
                }
            }

            reply.send({ message: 'Avatar updated successfully.', avatarUrl: fileUrl });

        } catch (error: any) {
            app.log.error(error);
            if (error.code === 'FST_PARTS_LIMIT' || error.code === 'FST_FILES_LIMIT') {
                return reply.status(413).send({ message: 'File size limit exceeded.' });
            }
            reply.status(500).send({ message: 'Internal server error during file upload.' });
        }
    });

    // Delete avatar (protected)
    app.delete('/api/me/avatar', { preHandler: (app as any).authenticate }, async (request: any, reply: FastifyReply) => {
        const userId = request.user.id;

        try {
            // Get current avatar path from DB
            const user = await new Promise<{ avatar_path: string | null }>((resolve, reject) => {
                databaseConnection.get('SELECT avatar_path FROM users WHERE id = ?', [userId], (err, row) => {
                    if (err) return reject(err);
                    resolve(row as { avatar_path: string | null });
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
            const filePath = path.join(process.cwd(), currentAvatarPath.substring(1)); // remove leading '/'
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        // Log the error but don't block the DB update
                        app.log.error(`Failed to delete avatar file: ${filePath}`, err);
                    }
                });
            }

            // Update the database, setting avatar_path to NULL
            await new Promise<void>((resolve, reject) => {
                databaseConnection.run('UPDATE users SET avatar_path = NULL WHERE id = ?', [userId], (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });

            reply.send({ message: 'Avatar deleted successfully.' });

        } catch (error: any) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });
}