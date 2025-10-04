"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = friendsRoutes;
const database_1 = __importDefault(require("../config/database"));
const websocket_1 = require("../websocket");
async function friendsRoutes(app) {
    const authOpts = {
        preHandler: [app.authenticate]
    };
    // Send a friend request
    app.post('/api/friends/request', authOpts, async (request, reply) => {
        const requesterId = request.user.id;
        const { username: addresseeUsername } = request.body;
        if (!addresseeUsername) {
            return reply.status(400).send({ message: 'Username is required.' });
        }
        try {
            // Find addressee user
            const addressee = await new Promise((resolve, reject) => {
                database_1.default.get('SELECT id FROM users WHERE username = ?', [addresseeUsername.toLowerCase()], (err, row) => {
                    if (err)
                        return reject(err);
                    resolve(row);
                });
            });
            if (!addressee) {
                return reply.status(404).send({ message: 'User not found.' });
            }
            const addresseeId = addressee.id;
            if (requesterId === addresseeId) {
                return reply.status(400).send({ message: 'You cannot add yourself as a friend.' });
            }
            // Check if a request already exists between the two users (in either direction)
            const existingRequest = await new Promise((resolve, reject) => {
                database_1.default.get('SELECT * FROM friend_requests WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)', [requesterId, addresseeId, addresseeId, requesterId], (err, row) => {
                    if (err)
                        return reject(err);
                    resolve(row);
                });
            });
            if (existingRequest) {
                if (existingRequest.status === 'accepted') {
                    return reply.status(409).send({ message: 'You are already friends with this user.' });
                }
                return reply.status(409).send({ message: 'A friend request already exists with this user.' });
            }
            // Create new friend request
            await new Promise((resolve, reject) => {
                database_1.default.run('INSERT INTO friend_requests (requester_id, addressee_id, status) VALUES (?, ?, ?)', [requesterId, addresseeId, 'pending'], function (err) {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
            reply.status(201).send({ message: 'Friend request sent.' });
        }
        catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });
    // Get all friends (status = 'accepted')
    app.get('/api/friends', authOpts, async (request, reply) => {
        const userId = request.user.id;
        try {
            const friends = await new Promise((resolve, reject) => {
                const query = `
                    SELECT u.id, u.username, u.display_name, u.avatar_path
                    FROM users u
                    JOIN friend_requests fr ON (u.id = fr.requester_id OR u.id = fr.addressee_id)
                    WHERE fr.status = 'accepted'
                      AND (fr.requester_id = ? OR fr.addressee_id = ?)
                      AND u.id != ?
                `;
                database_1.default.all(query, [userId, userId, userId], (err, rows) => {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
            const friendsWithStatus = friends.map(friend => ({
                ...friend,
                isOnline: websocket_1.activeUsers.has(friend.id)
            }));
            reply.send(friendsWithStatus);
        }
        catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });
    // Get pending friend requests (incoming and outgoing)
    app.get('/api/friends/requests', authOpts, async (request, reply) => {
        const userId = request.user.id;
        try {
            // Incoming requests
            const incoming = await new Promise((resolve, reject) => {
                const query = `
                    SELECT fr.id, u.username, u.display_name, u.avatar_path
                    FROM friend_requests fr
                    JOIN users u ON fr.requester_id = u.id
                    WHERE fr.addressee_id = ? AND fr.status = 'pending'
                `;
                database_1.default.all(query, [userId], (err, rows) => {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
            // Outgoing requests
            const outgoing = await new Promise((resolve, reject) => {
                const query = `
                    SELECT fr.id, u.username, u.display_name, u.avatar_path
                    FROM friend_requests fr
                    JOIN users u ON fr.addressee_id = u.id
                    WHERE fr.requester_id = ? AND fr.status = 'pending'
                `;
                database_1.default.all(query, [userId], (err, rows) => {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
            reply.send({ incoming, outgoing });
        }
        catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });
    // Respond to a friend request (accept/decline)
    app.put('/api/friends/request/:requestId', authOpts, async (request, reply) => {
        const userId = request.user.id;
        const { requestId } = request.params;
        const { action } = request.body;
        if (!['accept', 'decline'].includes(action)) {
            return reply.status(400).send({ message: 'Invalid action.' });
        }
        try {
            // Find the pending request by its ID first
            const requestDetails = await new Promise((resolve, reject) => {
                database_1.default.get('SELECT * FROM friend_requests WHERE id = ? AND status = \'pending\'', [requestId], (err, row) => {
                    if (err)
                        return reject(err);
                    resolve(row);
                });
            });
            if (!requestDetails) {
                return reply.status(404).send({ message: 'Friend request not found.' });
            }
            const isRequester = requestDetails.requester_id === userId;
            const isAddressee = requestDetails.addressee_id === userId;
            // The current user must be either the sender or the receiver of the request
            if (!isRequester && !isAddressee) {
                return reply.status(403).send({ message: 'You are not authorized to modify this request.' });
            }
            if (action === 'accept') {
                // Only the addressee can accept the request
                if (!isAddressee) {
                    return reply.status(403).send({ message: 'Only the recipient can accept a friend request.' });
                }
                await new Promise((resolve, reject) => {
                    database_1.default.run('UPDATE friend_requests SET status = \'accepted\' WHERE id = ?', [requestId], (err) => {
                        if (err)
                            return reject(err);
                        resolve();
                    });
                });
                reply.send({ message: 'Friend request accepted.' });
            }
            else { // This handles both 'decline' for the addressee and 'cancel' for the requester
                await new Promise((resolve, reject) => {
                    database_1.default.run('DELETE FROM friend_requests WHERE id = ?', [requestId], (err) => {
                        if (err)
                            return reject(err);
                        resolve();
                    });
                });
                const message = isRequester ? 'Friend request cancelled.' : 'Friend request declined.';
                reply.send({ message });
            }
        }
        catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });
    // Remove a friend
    app.delete('/api/friends/:friendId', authOpts, async (request, reply) => {
        const userId = request.user.id;
        const { friendId } = request.params;
        try {
            // Find the friendship record and delete it
            const result = await new Promise((resolve, reject) => {
                database_1.default.run(`DELETE FROM friend_requests 
                     WHERE status = 'accepted' 
                       AND ((requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?))`, [userId, friendId, friendId, userId], function (err) {
                    if (err)
                        return reject(err);
                    resolve({ changes: this.changes });
                });
            });
            if (result.changes === 0) {
                return reply.status(404).send({ message: 'Friendship not found.' });
            }
            reply.send({ message: 'Friend removed.' });
        }
        catch (error) {
            app.log.error(error);
            reply.status(500).send({ message: 'Internal server error.' });
        }
    });
}
