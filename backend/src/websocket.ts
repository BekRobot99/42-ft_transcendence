import { FastifyInstance } from 'fastify';
import db from './config/database';

// Store currently active users
export const activeUsers = new Set<number>();

// Map of sockets for each user (a user may have multiple sockets, e.g., tabs)
const userSockets = new Map<number, Set<any>>();

async function notifyStatusChange(userId: number, status: 'online' | 'offline', fastify: FastifyInstance) {
    try {
        // Find all friends of the user who just changed status
        const friends = await new Promise<any[]>((resolve, reject) => {
            const query = `
                SELECT u.id
                FROM users u
                JOIN friend_requests fr ON (u.id = fr.requester_id OR u.id = fr.addressee_id)
                WHERE fr.status = 'accepted'
                  AND (fr.requester_id = ? OR fr.addressee_id = ?)
                  AND u.id != ?
            `;
            db.all(query, [userId, userId, userId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });

        const message = JSON.stringify({
            type: 'status_update',
            userId: userId,
            status: status
        });

        // Notify each online friend
        friends.forEach(friend => {
            if (userSockets.has(friend.id)) {
                const sockets = userSockets.get(friend.id);
                sockets?.forEach(conn => {
                  if (conn.readyState === 1) { // 1 === WebSocket.OPEN
                        conn.send(message);
                    }
                });
            }
        });
    } catch (error) {
        fastify.log.error('Error notifying status change:', error);
    }
}
//realtimeRoutes = websocketRoutes
export default async function realtimeRoutes(fastify: FastifyInstance) {
    fastify.get('/api/ws/status', { websocket: true }, async (connection, request) => {
        let userId: number | null = null;

        try {
            // Authenticate the user via the JWT token in the cookie
            const decodedToken = await request.jwtVerify({ onlyCookie: true }) as { id: number; tfa?: string };
            if (decodedToken.tfa !== 'complete') {
                throw new Error('2FA not completed');
            }
            userId = decodedToken.id;

            // --- User connected ---
            // Add connection to our map
            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set());
            }
            userSockets.get(userId)?.add(connection);

            // If this is the user's first connection, mark them as active and notify friends
            if (!activeUsers.has(userId)) {
                activeUsers.add(userId);
                await notifyStatusChange(userId, 'online', fastify);
            }

        } catch (err) {
            // Authentication failed, close the connection
            fastify.log.warn('WebSocket authentication failed', { error: (err as Error).message });
            connection.close(1008, 'Authentication failed');
            return;
        }

        connection.on('close', async () => {
            if (userId === null) return;

            // --- User disconnected ---
            // Remove the specific connection
            const sockets = userSockets.get(userId);
            if (sockets) {
                sockets.delete(connection);
                // If it was the last socket for this user, mark them inactive
                if (sockets.size === 0) {
                    userSockets.delete(userId);
                    activeUsers.delete(userId);
                    await notifyStatusChange(userId, 'offline', fastify);
                }
            }
        });


        
        connection.on('error', (error: unknown) => {
            fastify.log.error('Realtime socket error:', error);
        });
    });
}

