import { FastifyInstance } from 'fastify';
import db from './config/database';
import { AIPlayer } from './services/AIPlayer';
import { GameSynchronizer, PlayerInput } from './services/GameSynchronizer';
import { GameStateValidator, ValidationResult } from './services/GameStateValidator';
import { GameErrorHandler, GameError, GameErrorType } from './services/GameErrorHandler';
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
const gameSynchronizers = new Map<string, GameSynchronizer>(); // gameId -> GameSynchronizer instance
const gameStateValidator = new GameStateValidator(); // Global state validator
const gameErrorHandler = new GameErrorHandler(); // Global error handler

// Helper function to safely execute game operations with error handling
async function safeExecute<T>(
    operation: () => Promise<T> | T,
    errorType: GameErrorType,
    context: { gameId?: string; playerId?: string; operation: string }
): Promise<T | null> {
    try {
        return await operation();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await gameErrorHandler.logError(
            errorType,
            `${context.operation} failed: ${errorMessage}`,
            { 
                originalError: error,
                context 
            },
            context.gameId,
            context.playerId
        );
        return null;
    }
}

// Helper function to safely send WebSocket messages with error handling
async function safeSend(
    connection: any,
    message: any,
    gameId?: string,
    playerId?: string
): Promise<boolean> {
    try {
        if (!connection || connection.readyState !== connection.OPEN) {
            await gameErrorHandler.logError(
                'websocket_connection_lost',
                'Attempted to send message on closed connection',
                { messageType: message.type || 'unknown' },
                gameId,
                playerId
            );
            return false;
        }

        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
        connection.send(messageStr);
        return true;
    } catch (error) {
        await gameErrorHandler.logError(
            'websocket_send_failed',
            'Failed to send WebSocket message',
            { 
                error: error instanceof Error ? error.message : 'Unknown error',
                messageType: message.type || 'unknown'
            },
            gameId,
            playerId
        );
        return false;
    }
}

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
async function broadcastToGame(gameId: string, message: string, excludePlayerId?: number) {
    const room = gameRooms.get(gameId);
    if (!room) {
        await gameErrorHandler.logError(
            'unknown_error',
            'Attempted to broadcast to non-existent game room',
            { gameId },
            gameId
        );
        return;
    }

    const promises = room.players.map(async (player) => {
        if (excludePlayerId && player.id === excludePlayerId.toString()) return;
        
        const playerId = parseInt(player.id);
        const sockets = userSockets.get(playerId);
        if (sockets) {
            const socketPromises = Array.from(sockets).map(socket =>
                safeSend(socket, message, gameId, playerId.toString())
            );
            await Promise.all(socketPromises);
        }
    });

    await Promise.all(promises);
}

// Create a new game room with AI opponent
async function createAIGameRoom(humanPlayerId: number, difficulty: 'easy' | 'medium' | 'hard'): Promise<string | null> {
    return await safeExecute(async () => {
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
    
    // Set up AI event handlers with synchronization
    aiPlayer.onAIKeyboardInput = (event: AIKeyboardEvent) => {
        // Add AI input to synchronizer for smooth movement
        const synchronizer = gameSynchronizers.get(gameId);
        if (synchronizer) {
            const aiInput: PlayerInput = {
                action: event.action,
                timestamp: event.timestamp,
                source: 'ai',
                intensity: 1,
                duration: event.holdDuration || 16
            };
            
            synchronizer.addPlayerInput('player2', aiInput);
            
            // Update AI paddle position based on current game state
            const room = gameRooms.get(gameId);
            if (room && event.action !== 'none') {
                const currentY = room.gameState.paddles.player2.y;
                const moveAmount = 6; // AI movement speed
                let targetY = currentY;
                
                if (event.action === 'up') {
                    targetY = Math.max(0, currentY - moveAmount);
                } else if (event.action === 'down') {
                    targetY = Math.min(room.gameState.canvas.height - room.gameState.paddles.player2.height, currentY + moveAmount);
                }
                
                synchronizer.updatePaddlePosition('player2', targetY);
                
                // Update room state with synchronized position
                const syncState = synchronizer.getGameState();
                room.gameState.paddles.player2.y = syncState.players.player2.paddlePosition.y;
            }
        }
        
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

    // Add visual event listeners for AI activity indicators
    aiPlayer.on('thinking_started', (data: any) => {
        const message = JSON.stringify({
            type: 'ai_thinking_started',
            gameId: gameId,
            ballPosition: data.ballPosition,
            difficulty: data.difficulty,
            timestamp: data.timestamp
        });
        broadcastToGame(gameId, message);
    });

    aiPlayer.on('thinking_completed', (data: any) => {
        const message = JSON.stringify({
            type: 'ai_thinking_completed',
            gameId: gameId,
            decision: data.decision,
            targetPosition: data.targetPosition,
            confidence: data.confidence,
            processingTime: data.processingTime,
            timestamp: data.timestamp
        });
        broadcastToGame(gameId, message);
    });

    aiPlayer.on('ai_reaction', (data: any) => {
        const message = JSON.stringify({
            type: 'ai_reaction',
            gameId: gameId,
            reactionType: data.reactionType,
            intensity: data.intensity,
            reactionTime: data.reactionTime,
            difficulty: data.difficulty,
            timestamp: data.timestamp
        });
        broadcastToGame(gameId, message);
    });

    aiPlayers.set(gameId, aiPlayer);

    // Create and configure Game Synchronizer for smooth controls
    const synchronizer = new GameSynchronizer(
        gameRoom.gameState.canvas.width, 
        gameRoom.gameState.canvas.height
    );
    
    // Start synchronization with broadcast to all players
    synchronizer.startSync((syncState) => {
        const message = JSON.stringify({
            type: 'game_sync',
            gameId: gameId,
            players: {
                player1: {
                    y: syncState.players.player1.paddlePosition.y,
                    velocity: syncState.players.player1.velocity.y
                },
                player2: {
                    y: syncState.players.player2.paddlePosition.y,
                    velocity: syncState.players.player2.velocity.y
                }
            },
            timestamp: syncState.syncTimestamp
        });
        broadcastToGame(gameId, message);
    });
    
        gameSynchronizers.set(gameId, synchronizer);
        
        return gameId;
    }, 'ai_player_crashed', {
        operation: 'createAIGameRoom',
        playerId: humanPlayerId.toString()
    });
}

// Handle incoming game messages
async function handleGameMessage(connection: any, userId: number, message: GameSocketMessage) {
    return await safeExecute(async () => {
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
            // Handle human player paddle movement with synchronization
            const player = room.players.find(p => p.id === userId.toString());
            const synchronizer = gameSynchronizers.get(gameId);
            
            if (player && !player.isAI && synchronizer) {
                // Add input to synchronizer for smooth processing
                const playerInput: PlayerInput = {
                    action: message.data.direction || 'none',
                    timestamp: Date.now(),
                    source: 'keyboard',
                    intensity: message.data.intensity || 1,
                    duration: message.data.duration || 16
                };
                
                synchronizer.addPlayerInput('player1', playerInput);
                
                // Update paddle position through synchronizer
                const targetY = Math.max(0, Math.min(
                    room.gameState.canvas.height - room.gameState.paddles.player1.height, 
                    message.data.y
                ));
                
                synchronizer.updatePaddlePosition('player1', targetY);
                
                // Get synchronized state for AI
                const syncState = synchronizer.getGameState();
                player.paddleY = syncState.players.player1.paddlePosition.y;
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
                
                // Validate game state before broadcasting
                const validationResult = gameStateValidator.validateGameState(
                    gameId, 
                    room.gameState, 
                    room.players
                );
                
                if (!validationResult.isValid) {
                    console.warn(`Game ${gameId} validation failed:`, validationResult.errors);
                    
                    // Send validation errors to clients for debugging
                    broadcastToGame(gameId, JSON.stringify({
                        type: 'validation_error',
                        errors: validationResult.errors,
                        warnings: validationResult.warnings,
                        timestamp: Date.now()
                    }), userId);
                }
                
                // Broadcast updated game state with validation info
                broadcastToGame(gameId, JSON.stringify({
                    type: 'game_state_update',
                    gameState: room.gameState,
                    validation: {
                        isValid: validationResult.isValid,
                        warnings: validationResult.warnings
                    },
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

        case 'score_update':
            // Handle score updates and sync with AI system
            if (room && message.data) {
                const { scorer, newScore } = message.data;
                
                if (scorer === 'human') {
                    room.gameState.score.player1 = newScore.human;
                    room.gameState.score.player2 = newScore.ai;
                } else if (scorer === 'ai') {
                    room.gameState.score.player1 = newScore.human;
                    room.gameState.score.player2 = newScore.ai;
                }
                
                // Notify AI of score change for strategic adjustments
                if (aiPlayer) {
                    aiPlayer.onScoreUpdate(room.gameState.score);
                }
                
                // Broadcast score update to all players
                broadcastToGame(gameId, JSON.stringify({
                    type: 'score_updated',
                    gameId: gameId,
                    score: room.gameState.score,
                    scorer: scorer,
                    timestamp: Date.now()
                }));
                
                // Check for game end conditions
                const winningScore = 5; // Standard Pong winning score
                if (room.gameState.score.player1 >= winningScore || room.gameState.score.player2 >= winningScore) {
                    const winner = room.gameState.score.player1 >= winningScore ? 'human' : 'ai';
                    
                    room.gameState.gameActive = false;
                    room.gameState.winner = winner;
                    
                    if (aiPlayer) {
                        aiPlayer.onGameEnd(winner, room.gameState.score);
                        aiPlayer.deactivate();
                    }
                    
                    broadcastToGame(gameId, JSON.stringify({
                        type: 'game_ended',
                        gameId: gameId,
                        winner: winner,
                        finalScore: room.gameState.score,
                        timestamp: Date.now()
                    }));
                }
            }
            break;

        case 'ball_scored':
            // Handle ball scoring events
            if (room && message.data && aiPlayer) {
                const { side, ballPosition, ballVelocity } = message.data;
                
                // Update AI with scoring context for learning
                aiPlayer.onBallScored(side, {
                    ballX: ballPosition.x,
                    ballY: ballPosition.y,
                    ballVelX: ballVelocity.x,
                    ballVelY: ballVelocity.y,
                    paddleY: room.gameState.paddles.player2.y,
                    paddleHeight: room.gameState.paddles.player2.height,
                    canvasHeight: room.gameState.canvas.height,
                    canvasWidth: room.gameState.canvas.width,
                    opponentPaddleY: room.gameState.paddles.player1.y,
                    score: { 
                        ai: room.gameState.score.player2,
                        human: room.gameState.score.player1
                    },
                    gameActive: room.gameState.gameActive
                });
            }
            break;

        case 'validate_state':
            // Handle frontend state validation requests
            if (room && message.data) {
                const frontendState = message.data.gameState;
                
                if (frontendState) {
                    // Compare frontend state with backend state
                    const comparisonResult = gameStateValidator.compareStates(
                        gameId,
                        frontendState,
                        room.gameState
                    );
                    
                    // Send validation results back to requesting client
                    connection.send(JSON.stringify({
                        type: 'state_validation_result',
                        gameId: gameId,
                        validation: comparisonResult,
                        backendState: room.gameState,
                        timestamp: Date.now()
                    }));
                    
                    // If there are critical issues, broadcast to all clients
                    if (!comparisonResult.isValid) {
                        broadcastToGame(gameId, JSON.stringify({
                            type: 'state_sync_required',
                            gameId: gameId,
                            authoritative: room.gameState,
                            issues: comparisonResult.errors,
                            timestamp: Date.now()
                        }), userId);
                    }
                }
            }
            break;

        case 'request_state_sync':
            // Force synchronize client state with server
            if (room) {
                const validationResult = gameStateValidator.validateGameState(
                    gameId,
                    room.gameState,
                    room.players
                );
                
                connection.send(JSON.stringify({
                    type: 'authoritative_state',
                    gameId: gameId,
                    gameState: room.gameState,
                    validation: validationResult,
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
            
            // Clean up synchronizer
            const gameSynchronizer = gameSynchronizers.get(gameId);
            if (gameSynchronizer) {
                gameSynchronizer.stopSync();
                gameSynchronizers.delete(gameId);
            }
            
            gameRooms.delete(gameId);
            playerGameMap.delete(userId);
            
            // Cleanup error tracking for this game
            gameErrorHandler.cleanupGame(gameId);
            
            broadcastToGame(gameId, JSON.stringify({
                type: 'player_left',
                playerId: userId,
                timestamp: Date.now()
            }));
            break;
    }
    }, 'websocket_message_invalid', {
        operation: 'handleGameMessage',
        gameId: playerGameMap.get(userId),
        playerId: userId.toString()
    });
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
                        const gameId = await createAIGameRoom(userId, message.data.difficulty || 'medium');
                        
                        if (gameId) {
                            connection.send(JSON.stringify({
                                type: 'game_joined',
                                gameId: gameId,
                                playerSide: 'left', // Human player is always left
                                aiDifficulty: message.data.difficulty || 'medium',
                                timestamp: Date.now()
                            }));
                        } else {
                            await safeSend(connection, {
                                type: 'game_join_failed',
                                error: 'Failed to create AI game room',
                                timestamp: Date.now()
                            });
                        }
                    }
                } else {
                    // Handle other game events
                    await handleGameMessage(connection, userId, message);
                }
                
            } catch (error) {
                await gameErrorHandler.logError(
                    'websocket_message_invalid',
                    'Failed to process WebSocket message',
                    { 
                        error: error instanceof Error ? error.message : 'Unknown error',
                        rawMessage: messageBuffer.toString() 
                    },
                    undefined,
                    userId?.toString()
                );
                
                fastify.log.error('Error processing game message:', error);
                await safeSend(connection, { error: 'Invalid message format' }, undefined, userId?.toString());
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
                
                // Clean up synchronizer on disconnect
                const cleanupSynchronizer = gameSynchronizers.get(gameId);
                if (cleanupSynchronizer) {
                    cleanupSynchronizer.stopSync();
                    gameSynchronizers.delete(gameId);
                }
                
                gameRooms.delete(gameId);
                playerGameMap.delete(userId);
                
                // Cleanup error tracking for this game
                gameErrorHandler.cleanupGame(gameId);
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

    // Health and error monitoring endpoint
    fastify.get('/api/game-health', async (request, reply) => {
        try {
            const healthMetrics = gameErrorHandler.getHealthMetrics();
            const errorStats = gameErrorHandler.getErrorStats();
            const recentErrors = gameErrorHandler.getRecentErrors(10);
            const isHealthy = gameErrorHandler.isSystemHealthy();

            // Update current statistics
            gameErrorHandler.updateHealthStats(
                activeUsers.size,
                gameRooms.size,
                healthMetrics.averageLatency
            );

            return {
                status: isHealthy ? 'healthy' : 'unhealthy',
                metrics: healthMetrics,
                errorStats,
                recentErrors: recentErrors.map(err => ({
                    id: err.id,
                    type: err.type,
                    severity: err.severity,
                    message: err.message,
                    timestamp: err.timestamp,
                    gameId: err.gameId,
                    recoveryAction: err.recoveryAction
                })),
                timestamp: Date.now()
            };
        } catch (error) {
            await gameErrorHandler.logError(
                'unknown_error',
                'Failed to generate health report',
                { error: error instanceof Error ? error.message : 'Unknown error' }
            );
            
            reply.status(500);
            return { error: 'Failed to retrieve health metrics' };
        }
    });
}
