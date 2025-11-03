import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import ChatService from '../services/ChatService';

interface AuthenticatedRequest extends FastifyRequest {
    user: {
        id: number;
        username: string;
    };
}

/**
 * Chat API Routes
 * Handles REST endpoints for chat functionality
 */

// Rate limiting map for message sending
const messageSendLimits = new Map<number, { count: number; resetTime: number }>();

function checkRateLimit(userId: number, maxMessages: number = 20, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userLimit = messageSendLimits.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
        messageSendLimits.set(userId, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (userLimit.count >= maxMessages) {
        return false;
    }

    userLimit.count++;
    return true;
}

export default async function chatRoutes(app: FastifyInstance) {
    
    /**
     * GET /api/chat/conversations
     * Get all conversations for the authenticated user
     */
    app.get('/api/chat/conversations', {
        preHandler: app.authenticate
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const authRequest = request as AuthenticatedRequest;
            const userId = authRequest.user.id;

            const conversations = await ChatService.getUserConversations(userId);
            
            reply.status(200).send({
                success: true,
                conversations
            });
        } catch (error: any) {
            console.error('Error fetching conversations:', error);
            reply.status(500).send({
                success: false,
                message: 'Failed to fetch conversations'
            });
        }
    });

    /**
     * GET /api/chat/messages/:userId
     * Get conversation history with a specific user
     */
    app.get<{
        Params: { userId: string };
        Querystring: { limit?: string; offset?: string };
    }>('/api/chat/messages/:userId', {
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            const authRequest = request as AuthenticatedRequest;
            const currentUserId = authRequest.user.id;
            const otherUserId = parseInt(request.params.userId);
            const limit = request.query.limit ? parseInt(request.query.limit) : 50;
            const offset = request.query.offset ? parseInt(request.query.offset) : 0;

            if (isNaN(otherUserId)) {
                return reply.status(400).send({
                    success: false,
                    message: 'Invalid user ID'
                });
            }

            // Check if the other user has blocked the current user
            const isBlocked = await ChatService.isUserBlocked(otherUserId, currentUserId);
            if (isBlocked) {
                return reply.status(403).send({
                    success: false,
                    message: 'You are blocked by this user'
                });
            }

            const messages = await ChatService.getConversation(currentUserId, otherUserId, limit, offset);
            
            // Mark messages as read
            await ChatService.markMessagesAsRead(currentUserId, otherUserId);

            reply.status(200).send({
                success: true,
                messages: messages.reverse() // Return in chronological order
            });
        } catch (error: any) {
            console.error('Error fetching messages:', error);
            reply.status(500).send({
                success: false,
                message: 'Failed to fetch messages'
            });
        }
    });

    /**
     * POST /api/chat/send
     * Send a message to another user
     */
    app.post<{
        Body: {
            receiver_id: number;
            message: string;
            message_type?: 'text' | 'system' | 'game_invite';
        };
    }>('/api/chat/send', {
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            const authRequest = request as AuthenticatedRequest;
            const senderId = authRequest.user.id;
            const { receiver_id, message, message_type = 'text' } = request.body;

            // Check rate limit
            if (!checkRateLimit(senderId)) {
                return reply.status(429).send({
                    success: false,
                    message: 'Too many messages. Please wait a moment.'
                });
            }

            if (!receiver_id || !message) {
                return reply.status(400).send({
                    success: false,
                    message: 'Receiver ID and message are required'
                });
            }

            if (message.length > 1000) {
                return reply.status(400).send({
                    success: false,
                    message: 'Message is too long (max 1000 characters)'
                });
            }

            const newMessage = await ChatService.sendMessage(senderId, receiver_id, message, message_type);

            reply.status(201).send({
                success: true,
                message: newMessage
            });
        } catch (error: any) {
            console.error('Error sending message:', error);
            reply.status(500).send({
                success: false,
                message: error.message || 'Failed to send message'
            });
        }
    });

    /**
     * POST /api/chat/block
     * Block a user
     */
    app.post<{
        Body: { user_id: number };
    }>('/api/chat/block', {
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            const authRequest = request as AuthenticatedRequest;
            const blockerId = authRequest.user.id;
            const { user_id } = request.body;

            if (!user_id) {
                return reply.status(400).send({
                    success: false,
                    message: 'User ID is required'
                });
            }

            if (blockerId === user_id) {
                return reply.status(400).send({
                    success: false,
                    message: 'Cannot block yourself'
                });
            }

            await ChatService.blockUser(blockerId, user_id);

            reply.status(200).send({
                success: true,
                message: 'User blocked successfully'
            });
        } catch (error: any) {
            console.error('Error blocking user:', error);
            reply.status(500).send({
                success: false,
                message: 'Failed to block user'
            });
        }
    });

    /**
     * POST /api/chat/unblock
     * Unblock a user
     */
    app.post<{
        Body: { user_id: number };
    }>('/api/chat/unblock', {
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            const authRequest = request as AuthenticatedRequest;
            const blockerId = authRequest.user.id;
            const { user_id } = request.body;

            if (!user_id) {
                return reply.status(400).send({
                    success: false,
                    message: 'User ID is required'
                });
            }

            await ChatService.unblockUser(blockerId, user_id);

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
     * GET /api/chat/blocked
     * Get list of blocked users
     */
    app.get('/api/chat/blocked', {
        preHandler: app.authenticate
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const authRequest = request as AuthenticatedRequest;
            const userId = authRequest.user.id;

            const blockedUsers = await ChatService.getBlockedUsers(userId);

            reply.status(200).send({
                success: true,
                blocked_users: blockedUsers
            });
        } catch (error: any) {
            console.error('Error fetching blocked users:', error);
            reply.status(500).send({
                success: false,
                message: 'Failed to fetch blocked users'
            });
        }
    });

    /**
     * GET /api/chat/status/:userId
     * Get online status of a user
     */
    app.get<{
        Params: { userId: string };
    }>('/api/chat/status/:userId', {
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            const userId = parseInt(request.params.userId);

            if (isNaN(userId)) {
                return reply.status(400).send({
                    success: false,
                    message: 'Invalid user ID'
                });
            }

            const status = await ChatService.getUserOnlineStatus(userId);

            reply.status(200).send({
                success: true,
                status: status || { is_online: false, last_seen: null }
            });
        } catch (error: any) {
            console.error('Error fetching user status:', error);
            reply.status(500).send({
                success: false,
                message: 'Failed to fetch user status'
            });
        }
    });

    /**
     * GET /api/chat/unread
     * Get total unread message count
     */
    app.get('/api/chat/unread', {
        preHandler: app.authenticate
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const authRequest = request as AuthenticatedRequest;
            const userId = authRequest.user.id;

            const unreadCount = await ChatService.getUnreadCount(userId);

            reply.status(200).send({
                success: true,
                unread_count: unreadCount
            });
        } catch (error: any) {
            console.error('Error fetching unread count:', error);
            reply.status(500).send({
                success: false,
                message: 'Failed to fetch unread count'
            });
        }
    });

    /**
     * DELETE /api/chat/conversation/:userId
     * Delete conversation with a user
     */
    app.delete<{
        Params: { userId: string };
    }>('/api/chat/conversation/:userId', {
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            const authRequest = request as AuthenticatedRequest;
            const currentUserId = authRequest.user.id;
            const otherUserId = parseInt(request.params.userId);

            if (isNaN(otherUserId)) {
                return reply.status(400).send({
                    success: false,
                    message: 'Invalid user ID'
                });
            }

            await ChatService.deleteConversation(currentUserId, otherUserId);

            reply.status(200).send({
                success: true,
                message: 'Conversation deleted successfully'
            });
        } catch (error: any) {
            console.error('Error deleting conversation:', error);
            reply.status(500).send({
                success: false,
                message: 'Failed to delete conversation'
            });
        }
    });

    /**
     * GET /api/chat/search
     * Search for users to chat with
     */
    app.get<{
        Querystring: { q: string; limit?: string };
    }>('/api/chat/search', {
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            const authRequest = request as AuthenticatedRequest;
            const userId = authRequest.user.id;
            const searchTerm = request.query.q || '';
            const limit = request.query.limit ? parseInt(request.query.limit) : 10;

            if (!searchTerm || searchTerm.length < 2) {
                return reply.status(400).send({
                    success: false,
                    message: 'Search term must be at least 2 characters'
                });
            }

            const users = await ChatService.searchUsers(searchTerm, userId, limit);

            console.log(`🔍 Search results for "${searchTerm}" by user ${userId}:`, users);

            reply.status(200).send({
                success: true,
                users
            });
        } catch (error: any) {
            console.error('Error searching users:', error);
            reply.status(500).send({
                success: false,
                message: 'Failed to search users'
            });
        }
    });
}
