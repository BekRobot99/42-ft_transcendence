import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import ChatService from '../services/ChatService';

interface AuthenticatedRequest extends FastifyRequest {
    user: {
        userId: number;
        username: string;
    };
}

/**
 * Chat Blocking API Routes
 * Enhanced blocking system with additional features
 */
export default async function chatBlockRoutes(app: FastifyInstance) {
    
    /**
     * POST /api/chat/block/:userId
     * Block a user with reason
     */
    app.post<{
        Params: { userId: string };
        Body: { reason?: string };
    }>('/api/chat/block/:userId', {
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            const authRequest = request as AuthenticatedRequest;
            const blockerId = authRequest.user.userId;
            const blockedId = parseInt(request.params.userId);

            if (isNaN(blockedId)) {
                return reply.status(400).send({
                    success: false,
                    message: 'Invalid user ID'
                });
            }

            if (blockerId === blockedId) {
                return reply.status(400).send({
                    success: false,
                    message: 'Cannot block yourself'
                });
            }

            await ChatService.blockUser(blockerId, blockedId);

            reply.status(200).send({
                success: true,
                message: 'User blocked successfully'
            });
        } catch (error: any) {
            console.error('Error blocking user:', error);
            
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                return reply.status(400).send({
                    success: false,
                    message: 'User is already blocked'
                });
            }

            reply.status(500).send({
                success: false,
                message: 'Failed to block user'
            });
        }
    });

    /**
     * DELETE /api/chat/block/:userId
     * Unblock a user
     */
    app.delete<{
        Params: { userId: string };
    }>('/api/chat/block/:userId', {
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            const authRequest = request as AuthenticatedRequest;
            const blockerId = authRequest.user.userId;
            const blockedId = parseInt(request.params.userId);

            if (isNaN(blockedId)) {
                return reply.status(400).send({
                    success: false,
                    message: 'Invalid user ID'
                });
            }

            await ChatService.unblockUser(blockerId, blockedId);

            reply.status(200).send({
                success: true,
                message: 'User unblocked successfully'
            });
        } catch (error: any) {
            console.error('Error unblocking user:', error);
            reply.status(500).send({
                success: false,
                message: 'Failed to unblock user'
            });
        }
    });

    /**
     * GET /api/chat/blocked-list
     * Get detailed list of blocked users with user info
     */
    app.get('/api/chat/blocked-list', {
        preHandler: app.authenticate
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const authRequest = request as AuthenticatedRequest;
            const userId = authRequest.user.userId;

            const blockedUserIds = await ChatService.getBlockedUsers(userId);
            
            // Get user details for each blocked user
            const blockedUsersDetails = await Promise.all(
                blockedUserIds.map(async (blockedId) => {
                    // Get user info from database
                    return new Promise((resolve) => {
                        const db = require('../config/database').default;
                        db.get(
                            'SELECT id, username, avatar_path FROM users WHERE id = ?',
                            [blockedId],
                            (err: any, row: any) => {
                                if (err || !row) {
                                    resolve(null);
                                } else {
                                    resolve({
                                        id: row.id,
                                        username: row.username,
                                        avatar_path: row.avatar_path
                                    });
                                }
                            }
                        );
                    });
                })
            );

            // Filter out null entries
            const validBlockedUsers = blockedUsersDetails.filter(u => u !== null);

            reply.status(200).send({
                success: true,
                blocked_users: validBlockedUsers,
                count: validBlockedUsers.length
            });
        } catch (error: any) {
            console.error('Error fetching blocked users list:', error);
            reply.status(500).send({
                success: false,
                message: 'Failed to fetch blocked users'
            });
        }
    });

    /**
     * GET /api/chat/is-blocked/:userId
     * Check if a specific user is blocked
     */
    app.get<{
        Params: { userId: string };
    }>('/api/chat/is-blocked/:userId', {
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            const authRequest = request as AuthenticatedRequest;
            const currentUserId = authRequest.user.userId;
            const checkUserId = parseInt(request.params.userId);

            if (isNaN(checkUserId)) {
                return reply.status(400).send({
                    success: false,
                    message: 'Invalid user ID'
                });
            }

            const isBlocked = await ChatService.isUserBlocked(currentUserId, checkUserId);

            reply.status(200).send({
                success: true,
                is_blocked: isBlocked
            });
        } catch (error: any) {
            console.error('Error checking block status:', error);
            reply.status(500).send({
                success: false,
                message: 'Failed to check block status'
            });
        }
    });

    /**
     * GET /api/chat/blocked-by/:userId
     * Check if current user is blocked by another user
     */
    app.get<{
        Params: { userId: string };
    }>('/api/chat/blocked-by/:userId', {
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            const authRequest = request as AuthenticatedRequest;
            const currentUserId = authRequest.user.userId;
            const otherUserId = parseInt(request.params.userId);

            if (isNaN(otherUserId)) {
                return reply.status(400).send({
                    success: false,
                    message: 'Invalid user ID'
                });
            }

            // Check if otherUser has blocked currentUser
            const isBlockedBy = await ChatService.isUserBlocked(otherUserId, currentUserId);

            reply.status(200).send({
                success: true,
                is_blocked_by: isBlockedBy
            });
        } catch (error: any) {
            console.error('Error checking if blocked by user:', error);
            reply.status(500).send({
                success: false,
                message: 'Failed to check block status'
            });
        }
    });
}
