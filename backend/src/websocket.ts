import { FastifyInstance } from 'fastify';
import db from './config/database';
import { AIPlayer } from './services/AIPlayer';
import { 
    GameSocketMessage, 
    GameRoom, 
    GameSessionState, 
    AIKeyboardEvent,
    GameEvent 
} from './interfaces/GameTypes';

// Store currently active users
export const activeUsers = new Set<number>();

// Map of sockets for each user (a user may have multiple sockets, e.g., tabs)
const userSockets = new Map<number, Set<any>>();

// Game rooms management
const gameRooms = new Map<string, GameRoom>();
const playerGameMap = new Map<number, string>(); // userId -> gameId
const aiPlayers = new Map<string, AIPlayer>(); // gameId -> AIPlayer instance

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

// Helper function to broadcast to all players in a game room
function broadcastToGame(gameId: string, message: string, excludePlayerId?: number) {
    const room = gameRooms.get(gameId);
    if (!room) return;

    room.players.forEach(player => {
        if (excludePlayerId && player.id === excludePlayerId.toString()) return;
        
        const playerId = parseInt(player.id);
        const sockets = userSockets.get(playerId);
        if (sockets) {
            sockets.forEach(socket => {
                if (socket.readyState === 1) {
                    socket.send(message);
                }
            });
        }
    });
}

// Create a new game room with AI opponent
function createAIGameRoom(humanPlayerId: number, difficulty: 'easy' | 'medium' | 'hard'): string {
    const gameId = `ai_game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const gameRoom: GameRoom = {
        id: gameId,
        players: [
            {
                id: humanPlayerId.toString(),
                username: `Player_${humanPlayerId}`,
                isAI: false,
                score: 0,
                paddleY: 250,
                ready: false
            },
            {
                id: 'ai_player',
                username: `AI_${difficulty}`,
                isAI: true,
                difficulty: difficulty,
                score: 0,
                paddleY: 250,
                ready: true
            }
        ],
        gameState: {
            ball: { x: 400, y: 300, velocityX: 3, velocityY: 2, speed: 5 },
            canvas: { width: 800, height: 600 },
            paddles: {
                player1: { y: 250, height: 100, width: 10, speed: 5 },
                player2: { y: 250, height: 100, width: 10, speed: 5 }
            },
            score: { player1: 0, player2: 0 },
            gameActive: false,
            isPaused: false,
            lastUpdate: Date.now()
        },
        createdAt: new Date(),
        lastActivity: new Date(),
        gameType: 'ai',
        status: 'waiting'
    };

    gameRooms.set(gameId, gameRoom);
    playerGameMap.set(humanPlayerId, gameId);

    // Create and configure AI player
    const aiPlayer = new AIPlayer(difficulty);
    
    // Set up AI event handlers
    aiPlayer.onAIKeyboardInput = (event: AIKeyboardEvent) => {
        const message = JSON.stringify({
            type: 'ai_move',
            gameId: gameId,
            move: event.action,
            timestamp: event.timestamp,
            difficulty: event.difficulty
        });
        broadcastToGame(gameId, message);
    };

    aiPlayer.onAIActivated = (data: { difficulty: string }) => {
        const message = JSON.stringify({
            type: 'ai_activated',
            gameId: gameId,
            difficulty: data.difficulty,
            timestamp: Date.now()
        });
        broadcastToGame(gameId, message);
    };

    aiPlayer.onDifficultyChanged = (data: { newDifficulty: string }) => {
        const message = JSON.stringify({
            type: 'difficulty_changed',
            gameId: gameId,
            newDifficulty: data.newDifficulty,
            timestamp: Date.now()
        });
        broadcastToGame(gameId, message);
    };

    aiPlayers.set(gameId, aiPlayer);
    
    return gameId;
}

// Handle incoming game messages
function handleGameMessage(connection: any, userId: number, message: GameSocketMessage) {
    const gameId = playerGameMap.get(userId);
    if (!gameId) {
        connection.send(JSON.stringify({ error: 'Not in a game' }));
        return;
    }

    const room = gameRooms.get(gameId);
    const aiPlayer = aiPlayers.get(gameId);
    
    if (!room) {
        connection.send(JSON.stringify({ error: 'Game room not found' }));
        return;
    }

    switch (message.event) {
        case 'paddle_move':
            // Handle human player paddle movement
            const player = room.players.find(p => p.id === userId.toString());
            if (player && !player.isAI) {
                player.paddleY = Math.max(0, Math.min(room.gameState.canvas.height - room.gameState.paddles.player1.height, message.data.y));
                
                // Update game state and notify AI
                room.gameState.paddles.player1.y = player.paddleY;
                room.gameState.lastUpdate = Date.now();
                
                if (aiPlayer && room.gameState.gameActive) {
                    aiPlayer.updateGameState({
                        ballX: room.gameState.ball.x,
                        ballY: room.gameState.ball.y,
                        ballVelX: room.gameState.ball.velocityX,
                        ballVelY: room.gameState.ball.velocityY,
                        paddleY: room.gameState.paddles.player2.y,
                        paddleHeight: room.gameState.paddles.player2.height,
                        canvasHeight: room.gameState.canvas.height,
                        canvasWidth: room.gameState.canvas.width,
                        opponentPaddleY: player.paddleY,
                        score: { 
                            ai: room.gameState.score.player2, 
                            human: room.gameState.score.player1 
                        },
                        gameActive: room.gameState.gameActive
                    });
                }
                
                // Broadcast updated game state
                broadcastToGame(gameId, JSON.stringify({
                    type: 'game_state_update',
                    gameState: room.gameState,
                    timestamp: Date.now()
                }), userId);
            }
            break;

        case 'player_ready':
            const readyPlayer = room.players.find(p => p.id === userId.toString());
            if (readyPlayer) {
                readyPlayer.ready = true;
                
                // Check if all players are ready (AI is always ready)
                const allReady = room.players.every(p => p.ready);
                if (allReady && room.status === 'waiting') {
                    room.status = 'starting';
                    room.gameState.gameActive = true;
                    
                    // Activate AI player
                    if (aiPlayer) {
                        aiPlayer.activate();
                    }
                    
                    broadcastToGame(gameId, JSON.stringify({
                        type: 'game_start',
                        gameId: gameId,
                        timestamp: Date.now()
                    }));
                }
            }
            break;

        case 'game_pause':
            if (room.gameState.gameActive) {
                room.gameState.isPaused = true;
                if (aiPlayer) {
                    aiPlayer.deactivate();
                }
                broadcastToGame(gameId, JSON.stringify({
                    type: 'game_paused',
                    timestamp: Date.now()
                }));
            }
            break;

        case 'game_resume':
            if (room.gameState.isPaused) {
                room.gameState.isPaused = false;
                if (aiPlayer) {
                    aiPlayer.activate();
                }
                broadcastToGame(gameId, JSON.stringify({
                    type: 'game_resumed',
                    timestamp: Date.now()
                }));
            }
            break;

        case 'ai_performance_stats':
            // Get AI performance statistics
            if (aiPlayer) {
                const stats = aiPlayer.getPerformanceStats();
                connection.send(JSON.stringify({
                    type: 'ai_performance_stats',
                    gameId: gameId,
                    stats: stats,
                    timestamp: Date.now()
                }));
            }
            break;

        case 'reset_ai_stats':
            // Reset AI performance counters
            if (aiPlayer) {
                aiPlayer.resetPerformanceStats();
                connection.send(JSON.stringify({
                    type: 'ai_stats_reset',
                    gameId: gameId,
                    timestamp: Date.now()
                }));
            }
            break;

        case 'leave_game':
            // Clean up game room and AI with final stats
            if (aiPlayer) {
                const finalStats = aiPlayer.getPerformanceStats();
                console.log(`Game ${gameId} ended - AI Performance:`, finalStats);
                
                aiPlayer.deactivate();
                aiPlayers.delete(gameId);
            }
            gameRooms.delete(gameId);
            playerGameMap.delete(userId);
            
            broadcastToGame(gameId, JSON.stringify({
                type: 'player_left',
                playerId: userId,
                timestamp: Date.now()
            }));
            break;
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

    // Game WebSocket endpoint for AI and multiplayer games
    fastify.get('/api/ws/game', { websocket: true }, async (connection, request) => {
        let userId: number | null = null;

        try {
            // Authenticate the user
            const decodedToken = await request.jwtVerify({ onlyCookie: true }) as { id: number; tfa?: string };
            if (decodedToken.tfa !== 'complete') {
                throw new Error('2FA not completed');
            }
            userId = decodedToken.id;

            // Add connection to user sockets
            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set());
            }
            userSockets.get(userId)?.add(connection);

        } catch (err) {
            fastify.log.warn('Game WebSocket authentication failed', { error: (err as Error).message });
            connection.close(1008, 'Authentication failed');
            return;
        }

        // Handle incoming messages
        connection.on('message', async (messageBuffer: Buffer | string) => {
            if (userId === null) return;

            try {
                const message: GameSocketMessage = JSON.parse(messageBuffer.toString());
                
                if (message.event === 'join_game') {
                    // Create new AI game or join existing game
                    if (message.data.gameType === 'ai') {
                        const gameId = createAIGameRoom(userId, message.data.difficulty || 'medium');
                        
                        connection.send(JSON.stringify({
                            type: 'game_joined',
                            gameId: gameId,
                            playerSide: 'left', // Human player is always left
                            aiDifficulty: message.data.difficulty || 'medium',
                            timestamp: Date.now()
                        }));
                    }
                } else {
                    // Handle other game events
                    handleGameMessage(connection, userId, message);
                }
                
            } catch (error) {
                fastify.log.error('Error processing game message:', error);
                connection.send(JSON.stringify({ error: 'Invalid message format' }));
            }
        });

        connection.on('close', async () => {
            if (userId === null) return;

            // Clean up user from active games
            const gameId = playerGameMap.get(userId);
            if (gameId) {
                const aiPlayer = aiPlayers.get(gameId);
                if (aiPlayer) {
                    aiPlayer.deactivate();
                    aiPlayers.delete(gameId);
                }
                gameRooms.delete(gameId);
                playerGameMap.delete(userId);
            }

            // Remove from user sockets
            const sockets = userSockets.get(userId);
            if (sockets) {
                sockets.delete(connection);
                if (sockets.size === 0) {
                    userSockets.delete(userId);
                }
            }
        });

        connection.on('error', (error: unknown) => {
            fastify.log.error('Game socket error:', error);
        });
    });
}
