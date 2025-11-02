import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import ChatService from '../services/ChatService';

interface AuthenticatedRequest extends FastifyRequest {
    user: {
        userId: number;
        username: string;
    };
}

/**
 * Chat Notification Routes
 * Handle system messages and tournament notifications
 */
export default async function chatNotificationRoutes(app: FastifyInstance) {
    
    /**
     * POST /api/chat/notify/tournament
     * Send tournament notification to participants
     */
    app.post<{
        Body: {
            user_ids: number[];
            message: string;
            tournament_id?: number;
        };
    }>('/api/chat/notify/tournament', {
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            const { user_ids, message } = request.body;

            if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
                return reply.status(400).send({
                    success: false,
                    message: 'User IDs array is required'
                });
            }

            if (!message) {
                return reply.status(400).send({
                    success: false,
                    message: 'Message is required'
                });
            }

            await ChatService.sendTournamentNotification(user_ids, message);

            reply.status(200).send({
                success: true,
                message: 'Tournament notification sent successfully'
            });
        } catch (error: any) {
            console.error('Error sending tournament notification:', error);
            reply.status(500).send({
                success: false,
                message: 'Failed to send tournament notification'
            });
        }
    });

    /**
     * POST /api/chat/notify/match
     * Notify players about upcoming match
     */
    app.post<{
        Body: {
            player1_id: number;
            player2_id: number;
            match_info: string;
        };
    }>('/api/chat/notify/match', {
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            const { player1_id, player2_id, match_info } = request.body;

            if (!player1_id || !player2_id || !match_info) {
                return reply.status(400).send({
                    success: false,
                    message: 'Player IDs and match info are required'
                });
            }

            const message = `🏓 ${match_info}`;

            await Promise.all([
                ChatService.sendSystemMessage(player1_id, message),
                ChatService.sendSystemMessage(player2_id, message)
            ]);

            reply.status(200).send({
                success: true,
                message: 'Match notification sent successfully'
            });
        } catch (error: any) {
            console.error('Error sending match notification:', error);
            reply.status(500).send({
                success: false,
                message: 'Failed to send match notification'
            });
        }
    });

    /**
     * POST /api/chat/notify/system
     * Send a system message to a user
     */
    app.post<{
        Body: {
            user_id: number;
            message: string;
        };
    }>('/api/chat/notify/system', {
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            const { user_id, message } = request.body;

            if (!user_id || !message) {
                return reply.status(400).send({
                    success: false,
                    message: 'User ID and message are required'
                });
            }

            await ChatService.sendSystemMessage(user_id, message);

            reply.status(200).send({
                success: true,
                message: 'System message sent successfully'
            });
        } catch (error: any) {
            console.error('Error sending system message:', error);
            reply.status(500).send({
                success: false,
                message: 'Failed to send system message'
            });
        }
    });
}
