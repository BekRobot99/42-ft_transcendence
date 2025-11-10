import { translate } from "../languageService.js";

interface GameModeOptions {
    mode: 'human' | 'ai';
    aiDifficulty?: 'easy' | 'medium' | 'hard';
    player1Name?: string;
    player2Name?: string;
    onGameEnd?: (result: { winnerName: string, score1: number, score2: number }) => void;
}

export function renderGamePage(gameWrapper: HTMLElement, options?: GameModeOptions | { player1Name: string, player2Name: string, onGameEnd: (result: { winnerName: string, score1: number, score2: number }) => void }): () => void {
    // Handle legacy tournament options format
    let gameOptions: GameModeOptions;
    if (options && 'player1Name' in options && !('mode' in options)) {
        gameOptions = {
            mode: 'human',
            player1Name: options.player1Name,
            player2Name: options.player2Name,
            onGameEnd: options.onGameEnd
        };
    } else {
        gameOptions = options as GameModeOptions || { mode: 'human' };
    }

    const isAIMode = gameOptions.mode === 'ai';
    console.log('🎮 Game Mode:', gameOptions.mode, '| AI Mode:', isAIMode, '| Difficulty:', gameOptions.aiDifficulty);
    const player1Alias = gameOptions.player1Name || translate('Player 1', 'Spieler 1', 'Joueur 1');
    const player2Alias = isAIMode ? `AI (${gameOptions.aiDifficulty || 'medium'})` : 
                         (gameOptions.player2Name || translate('Player 2', 'Spieler 2', 'Joueur 2'));

    // Enhanced UI with AI mode support
    gameWrapper.innerHTML = `
        <div class="text-center flex flex-col items-center gap-4">
           <header class="w-full max-w-3xl">
               <h1 class="text-3xl font-bold mb-1 text-center">${translate('Ping Pong', 'Ping Pong', 'Ping Pong')}</h1>
               <p class="text-gray-600 text-sm text-center">${translate('A friendly match — pick a mode and start playing.', 'Ein freundliches Match - wähle einen Modus und starte das Spiel.', 'Un match amical - choisissez un mode et commencez à jouer.')}</p>
           </header>

           ${!isAIMode ? `
           <div class="mb-2 p-4 bg-gray-100 rounded-lg w-full max-w-md">
               <h2 class="text-lg font-semibold mb-3 text-center">${translate('Game Mode', 'Spielmodus', 'Mode de jeu')}</h2>
               <div class="flex gap-4 justify-center">
                   <button id="humanModeBtn" class="autumn-button-light game-mode-button-small">
                       ${translate('Human vs Human', 'Mensch vs Mensch', 'Humain vs Humain')}
                   </button>
                   <button id="aiModeBtn" class="autumn-button-light game-mode-button-small">
                       ${translate('Human vs AI', 'Mensch vs KI', 'Humain vs IA')}
                   </button>
               </div>
           </div>
           ` : `
           <div class="mb-2 p-4 bg-green-100 rounded-lg w-full max-w-md">
               <h2 class="text-lg font-semibold mb-3 text-center">${translate('AI Mode', 'KI-Modus', 'Mode IA')}</h2>
               <div class="flex gap-2 justify-center mb-3">
                   <button id="easyBtn" class="px-3 py-1 text-sm ${gameOptions.aiDifficulty === 'easy' ? 'bg-green-600 text-white' : 'bg-gray-200'} rounded">
                       ${translate('Easy', 'Einfach', 'Facile')}
                   </button>
                   <button id="mediumBtn" class="px-3 py-1 text-sm ${gameOptions.aiDifficulty === 'medium' || !gameOptions.aiDifficulty ? 'bg-yellow-600 text-white' : 'bg-gray-200'} rounded">
                       ${translate('Medium', 'Mittel', 'Moyen')}
                   </button>
                   <button id="hardBtn" class="px-3 py-1 text-sm ${gameOptions.aiDifficulty === 'hard' ? 'bg-red-600 text-white' : 'bg-gray-200'} rounded">
                       ${translate('Hard', 'Schwer', 'Difficile')}
                   </button>
               </div>
               <div class="text-center">
                   <button id="backToModeBtn" class="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600">
                       ${translate('Back to Mode Selection', 'Zurück zur Modusauswahl', 'Retour à la sélection de mode')}
                   </button>
               </div>
           </div>
           `}

           <section class="w-full max-w-3xl">
               <div class="mb-3 flex items-center justify-between">
                   <span class="font-semibold">${player1Alias}</span>
                   <span class="text-xl font-bold" id="scoreDisplay">0 - 0</span>
                   <span class="font-semibold">${player2Alias}</span>
               </div>

               <p class="text-gray-600 text-sm mb-3 text-center">
                   ${isAIMode ?
                       translate('W/S keys to control your paddle', 'W/S Tasten um dein Paddle zu steuern', 'Touches W/S pour contrôler votre raquette') :
                       translate('Player 1: W/S keys | Player 2: Arrow Up/Down keys', 'Spieler 1: W/S Tasten | Spieler 2: Pfeiltasten Hoch/Runter', 'Joueur 1 : Touches W/S | Joueur 2 : Touches Haut/Bas')
                   }
               </p>

               ${isAIMode ? `
               <div class="text-sm text-gray-600 mb-2 text-center">
                   <span id="aiStatsDisplay">AI Performance: Loading...</span>
               </div>
               ` : ''}

               <div class="flex justify-center">
                   <canvas id="pongCanvas" class="bg-black border-2 border-white"></canvas>
               </div>
           </section>
        </div>
    `;

    const canvas = document.getElementById('pongCanvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error("Could not find #pongCanvas");
        return () => {};
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Could not get 2D context");
        return () => {};
    }

    // Game constants
    const PADDLE_WIDTH = 10;
    const PADDLE_HEIGHT = 100;
    const BALL_RADIUS = 7;
    const PADDLE_SPEED = 6;
    const WINNING_SCORE = 11; // First to 11 points wins
    const INITIAL_BALL_SPEED = 3;
    const BALL_SPEED_INCREASE_FACTOR = 1.1;

    // State validation variables
    let lastValidationTime = 0;
    const VALIDATION_INTERVAL = 10000; // Validate every 10 seconds

    // Error handling variables
    let connectionErrors = 0;
    let lastErrorTime = 0;
    const MAX_CONNECTION_ERRORS = 5;
    const ERROR_DISPLAY_DURATION = 3000; // 3 seconds

    canvas.width = 800;
    canvas.height = 600;

    // Game objects
    const player1 = {
        x: 10,
        y: canvas.height / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        score: 0,
    };

    const player2 = {
        x: canvas.width - PADDLE_WIDTH - 10,
        y: canvas.height / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        score: 0,
    };

    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: BALL_RADIUS,
        dx: 0,
        dy: 0
    };

    // Keyboard state
    const keysPressed: { [key: string]: boolean } = {};
    
    // AI game variables
    let aiSocket: WebSocket | null = null;
    let aiGameId: string | null = null;
    let aiStatsInterval: number | null = null;
    let frameCounter = 0;
    let aiTargetY = 300; // Target Y position for smooth interpolation
    let aiCurrentY = 300; // Current interpolated Y position
    
    // AI status indicators and visual feedback
    let aiStatus = {
        isActive: false,
        difficulty: 'medium',
        lastMove: 'none' as 'up' | 'down' | 'none',
        lastMoveTime: 0,
        reactionTime: 0,
        accuracy: 0,
        thinking: false,
        thinkingStartTime: 0
    };
    
    // Visual effects for AI feedback
    let aiIndicators = {
        thinkingOpacity: 0,
        moveIndicatorOpacity: 0,
        accuracyBarWidth: 0,
        reactionTimeColor: '#00ff00'
    };

    function keyDownHandler(e: KeyboardEvent) {
        keysPressed[e.key] = true;
    }

    function keyUpHandler(e: KeyboardEvent) {
        keysPressed[e.key] = false;
    }

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    // Setup button handlers for game mode selection
    const humanModeBtn = document.getElementById('humanModeBtn');
    const aiModeBtn = document.getElementById('aiModeBtn');
    const backToModeBtn = document.getElementById('backToModeBtn');
    const easyBtn = document.getElementById('easyBtn');
    const mediumBtn = document.getElementById('mediumBtn');
    const hardBtn = document.getElementById('hardBtn');

    if (humanModeBtn) {
        humanModeBtn.addEventListener('click', () => {
            // Reload page with human mode
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete('mode');
            currentUrl.searchParams.delete('difficulty');
            window.history.pushState({}, '', currentUrl);
            window.location.reload();
        });
    }

    if (aiModeBtn) {
        aiModeBtn.addEventListener('click', () => {
            // Switch to AI mode with medium difficulty
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('mode', 'ai');
            currentUrl.searchParams.set('difficulty', 'medium');
            window.history.pushState({}, '', currentUrl);
            window.location.reload();
        });
    }

    if (backToModeBtn) {
        backToModeBtn.addEventListener('click', () => {
            // Go back to mode selection
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete('mode');
            currentUrl.searchParams.delete('difficulty');
            window.history.pushState({}, '', currentUrl);
            window.location.reload();
        });
    }

    // AI difficulty buttons
    if (easyBtn) {
        easyBtn.addEventListener('click', () => {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('difficulty', 'easy');
            window.history.pushState({}, '', currentUrl);
            window.location.reload();
        });
    }

    if (mediumBtn) {
        mediumBtn.addEventListener('click', () => {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('difficulty', 'medium');
            window.history.pushState({}, '', currentUrl);
            window.location.reload();
        });
    }

    if (hardBtn) {
        hardBtn.addEventListener('click', () => {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('difficulty', 'hard');
            window.history.pushState({}, '', currentUrl);
            window.location.reload();
        });
    }

    // Initialize AI connection if in AI mode
    if (isAIMode) {
        console.log('🤖 Initializing AI game mode...');
        initializeAIGame();
    }

    function initializeAIGame() {
        try {
            // Use wss:// for secure WebSocket connection over HTTPS
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/api/ws/game`;
            console.log('🔌 Connecting to AI WebSocket:', wsUrl);
            aiSocket = new WebSocket(wsUrl);
            
            aiSocket.onopen = () => {
                console.log('AI WebSocket connected');
                // Join AI game
                aiSocket!.send(JSON.stringify({
                    event: 'join_game',
                    gameId: '',
                    playerId: 'human_player',
                    timestamp: Date.now(),
                    data: {
                        gameType: 'ai',
                        difficulty: gameOptions.aiDifficulty || 'medium'
                    }
                }));
            };

            aiSocket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('📨 Received message:', message.type, message);
                    handleAIGameMessage(message);
                } catch (error) {
                    console.error('Error parsing AI game message:', error);
                }
            };

            aiSocket.onclose = (event) => {
                console.log('🔌 AI WebSocket disconnected', { code: event.code, reason: event.reason, wasClean: event.wasClean });
                if (event.code === 1008) {
                    console.error('❌ Authentication failed! Make sure you are logged in.');
                }
                if (aiStatsInterval) {
                    clearInterval(aiStatsInterval);
                }
            };

            aiSocket.onerror = (error) => {
                console.error('❌ AI WebSocket error:', error);
            };
        } catch (error) {
            console.error('Failed to connect to AI game server:', error);
        }
    }

    function handleAIGameMessage(message: any) {
        switch (message.type) {
            case 'game_joined':
                aiGameId = message.gameId;
                console.log(`✅ Joined AI game: ${aiGameId}`);
                
                // Send player_ready to activate the AI
                if (aiSocket && aiGameId) {
                    aiSocket.send(JSON.stringify({
                        event: 'player_ready',
                        gameId: aiGameId,
                        playerId: 'human_player',
                        timestamp: Date.now(),
                        data: {}
                    }));
                    console.log('🎮 Sent player_ready event to activate AI');
                }
                
                // Start requesting AI stats periodically
                if (aiStatsInterval) clearInterval(aiStatsInterval);
                aiStatsInterval = window.setInterval(() => {
                    if (aiSocket && aiGameId) {
                        aiSocket.send(JSON.stringify({
                            event: 'ai_performance_stats',
                            gameId: aiGameId,
                            playerId: 'human_player',
                            timestamp: Date.now(),
                            data: {}
                        }));
                    }
                }, 5000); // Request stats every 5 seconds
                break;

            case 'ai_move':
                // Handle AI paddle movement
                console.log('🤖 AI move received:', message.move, 'current Y:', player2.y);
                if (message.move === 'up') {
                    player2.y = Math.max(0, player2.y - PADDLE_SPEED);
                    aiStatus.lastMove = 'up';
                } else if (message.move === 'down') {
                    player2.y = Math.min(canvas.height - player2.height, player2.y + PADDLE_SPEED);
                    aiStatus.lastMove = 'down';
                } else {
                    aiStatus.lastMove = 'none';
                }
                aiStatus.lastMoveTime = Date.now();
                console.log('🤖 AI new Y:', player2.y);
                break;

            case 'ai_performance_stats':
                updateAIStatsDisplay(message.stats);
                if (message.stats) {
                    aiStatus.reactionTime = message.stats.averageReactionTime || 0;
                    aiStatus.accuracy = message.stats.complianceRate ? message.stats.complianceRate / 100 : 0;
                    aiStatus.thinking = message.stats.isThinking || false;
                    if (aiStatus.thinking && aiStatus.thinkingStartTime === 0) {
                        aiStatus.thinkingStartTime = Date.now();
                    } else if (!aiStatus.thinking) {
                        aiStatus.thinkingStartTime = 0;
                    }
                }
                break;

            case 'ai_activated':
                console.log(`AI activated with ${message.difficulty} difficulty`);
                aiStatus.isActive = true;
                aiStatus.difficulty = message.difficulty || 'medium';
                break;

            case 'score_updated':
                // Update score display when backend confirms score change
                if (message.score) {
                    player1.score = message.score.player1;
                    player2.score = message.score.player2;
                    updateScoreDisplay();
                    console.log(`Score updated by ${message.scorer}: ${player1.score} - ${player2.score}`);
                }
                break;

            case 'game_sync':
                // Handle synchronized game state from backend (includes AI paddle position)
                if (message.players && message.players.player2) {
                    // Update AI paddle target position - check all possible property names
                    const aiPaddleY = message.players.player2.y || message.players.player2.paddlePosition?.y || message.players.player2.paddleY;
                    if (typeof aiPaddleY === 'number') {
                        aiTargetY = aiPaddleY;
                        console.log('game_sync: aiTargetY updated to', aiTargetY);
                    }
                }
                break;

            case 'game_ended':
                // Handle game end event
                if (message.winner && ctx) {
                    const winnerText = message.winner === 'human' ? 'You Win!' : 'AI Wins!';
                    const finalScore = `Final Score: ${message.finalScore.player1} - ${message.finalScore.player2}`;
                    
                    // Display game end message overlay
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    ctx.fillStyle = 'white';
                    ctx.font = '48px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(winnerText, canvas.width / 2, canvas.height / 2 - 50);
                    
                    ctx.font = '24px Arial';
                    ctx.fillText(finalScore, canvas.width / 2, canvas.height / 2 + 50);
                    
                    console.log(`Game ended - Winner: ${message.winner}, Final: ${finalScore}`);
                    
                    // Stop the ball movement
                    ball.dx = 0;
                    ball.dy = 0;
                }
                break;

            case 'ball_scored_analysis':
                // Handle AI ball scoring analysis (for debugging/stats)
                if (message.aiScoredAgainst) {
                    console.log(`AI missed ball - Distance: ${message.missDistance}px, Quality: ${message.reactionQuality}`);
                } else {
                    console.log('AI successfully defended');
                }
                break;

            case 'ai_thinking_started':
                // Start thinking animation
                aiStatus.thinking = true;
                aiStatus.thinkingStartTime = Date.now();
                console.log('AI started thinking...');
                break;

            case 'ai_thinking_completed':
                // Stop thinking animation and show decision
                aiStatus.thinking = false;
                aiStatus.thinkingStartTime = 0;
                console.log(`AI decision: ${message.decision} (confidence: ${Math.round((message.confidence || 0) * 100)}%)`);
                break;

            case 'ai_reaction':
                // Show reaction indicator
                if (message.reactionType === 'move_up') {
                    aiStatus.lastMove = 'up';
                } else if (message.reactionType === 'move_down') {
                    aiStatus.lastMove = 'down';
                } else {
                    aiStatus.lastMove = 'none';
                }
                aiStatus.lastMoveTime = Date.now();
                aiStatus.reactionTime = message.reactionTime || 0;
                console.log(`AI reacting: ${message.reactionType} (${message.reactionTime}ms)`);
                break;

            case 'game_sync':
                // Handle synchronized paddle positions
                if (message.players) {
                    // Smoothly update player positions
                    if (message.players.player1) {
                        const targetY = message.players.player1.y;
                        const currentY = player1.y;
                        const velocity = message.players.player1.velocity || 0;
                        
                        // Smooth interpolation for human player
                        const lerpFactor = 0.8; // Adjust for smoothness
                        player1.y = currentY + (targetY - currentY) * lerpFactor;
                    }
                    
                    if (message.players.player2) {
                        const targetY = message.players.player2.y;
                        const currentY = player2.y;
                        const velocity = message.players.player2.velocity || 0;
                        
                        // Smooth interpolation for AI player
                        const lerpFactor = 0.9; // Slightly smoother for AI
                        player2.y = currentY + (targetY - currentY) * lerpFactor;
                    }
                }
                break;

            case 'validation_error':
                // Handle validation errors from backend
                if (message.errors && message.errors.length > 0) {
                    console.warn('Game state validation errors:', message.errors);
                    
                    // Show validation warning to user
                    const criticalErrors = message.errors.filter((err: any) => 
                        err.severity === 'critical' || err.severity === 'high'
                    );
                    
                    if (criticalErrors.length > 0 && ctx) {
                        // Display validation error overlay
                        ctx.save();
                        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        
                        ctx.fillStyle = 'white';
                        ctx.font = '16px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('Game State Validation Error', canvas.width / 2, 30);
                        ctx.font = '12px Arial';
                        ctx.fillText('Requesting sync...', canvas.width / 2, 50);
                        ctx.restore();
                        
                        // Request state sync from server
                        setTimeout(() => {
                            if (aiSocket && aiGameId) {
                                aiSocket.send(JSON.stringify({
                                    event: 'request_state_sync',
                                    gameId: aiGameId,
                                    playerId: 'human_player',
                                    timestamp: Date.now(),
                                    data: {}
                                }));
                            }
                        }, 1000);
                    }
                }
                break;

            case 'state_validation_result':
                // Handle validation comparison results
                if (message.validation) {
                    console.log('State validation result:', message.validation);
                    
                    if (!message.validation.isValid && message.validation.warnings) {
                        const positionWarnings = message.validation.warnings.filter((w: any) => 
                            w.code.includes('POSITION_DESYNC')
                        );
                        
                        if (positionWarnings.length > 0) {
                            console.log('Position desync detected, correcting...');
                            
                            // Correct positions with server data
                            if (message.backendState) {
                                if (message.backendState.ball) {
                                    ball.x = message.backendState.ball.x;
                                    ball.y = message.backendState.ball.y;
                                    ball.dx = message.backendState.ball.velocityX;
                                    ball.dy = message.backendState.ball.velocityY;
                                }
                                
                                if (message.backendState.paddles) {
                                    if (message.backendState.paddles.player1) {
                                        player1.y = message.backendState.paddles.player1.y;
                                    }
                                    if (message.backendState.paddles.player2) {
                                        player2.y = message.backendState.paddles.player2.y;
                                    }
                                }
                                
                                if (message.backendState.score) {
                                    player1.score = message.backendState.score.player1;
                                    player2.score = message.backendState.score.player2;
                                    updateScoreDisplay();
                                }
                            }
                        }
                    }
                }
                break;

            case 'state_sync_required':
                // Handle forced state synchronization
                console.log('State sync required:', message.issues);
                
                if (message.authoritative) {
                    // Force update to authoritative server state
                    const authState = message.authoritative;
                    
                    if (authState.ball) {
                        ball.x = authState.ball.x;
                        ball.y = authState.ball.y;
                        ball.dx = authState.ball.velocityX;
                        ball.dy = authState.ball.velocityY;
                    }
                    
                    if (authState.paddles) {
                        if (authState.paddles.player1) {
                            player1.y = authState.paddles.player1.y;
                        }
                        if (authState.paddles.player2) {
                            player2.y = authState.paddles.player2.y;
                        }
                    }
                    
                    if (authState.score) {
                        player1.score = authState.score.player1;
                        player2.score = authState.score.player2;
                        updateScoreDisplay();
                    }
                    
                    console.log('Game state synchronized with server');
                }
                break;

            case 'authoritative_state':
                // Handle authoritative state from server
                if (message.gameState) {
                    const serverState = message.gameState;
                    
                    // Force sync all game elements
                    if (serverState.ball) {
                        ball.x = serverState.ball.x;
                        ball.y = serverState.ball.y;
                        ball.dx = serverState.ball.velocityX;
                        ball.dy = serverState.ball.velocityY;
                    }
                    
                    if (serverState.paddles) {
                        if (serverState.paddles.player1) {
                            player1.y = serverState.paddles.player1.y;
                        }
                        if (serverState.paddles.player2) {
                            player2.y = serverState.paddles.player2.y;
                        }
                    }
                    
                    if (serverState.score) {
                        player1.score = serverState.score.player1;
                        player2.score = serverState.score.player2;
                        updateScoreDisplay();
                    }
                    
                    console.log('Received authoritative state from server');
                    
                    // Log validation results if present
                    if (message.validation) {
                        console.log('State validation:', message.validation);
                    }
                }
                break;

            default:
                console.log('Unknown AI game message:', message);
        }
    }

    function updateAIStatsDisplay(stats: any) {
        const statsDisplay = document.getElementById('aiStatsDisplay');
        if (statsDisplay && stats) {
            statsDisplay.textContent = `AI Performance: ${stats.complianceRate}% timing compliance, ${stats.humanlikeScore}% human-like`;
        }
    }

    function updateScoreDisplay() {
        const scoreDisplay = document.getElementById('scoreDisplay');
        if (scoreDisplay) {
            scoreDisplay.textContent = `${player1.score} - ${player2.score}`;
        }
    }

    function resetBall() {
        const lastDx = ball.dx;
        // Stop the ball and center it
        ball.dx = 0;
        ball.dy = 0;
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;

        setTimeout(() => {
            // After a pause, send the ball to the player who just scored
            ball.dx = lastDx > 0 ? -INITIAL_BALL_SPEED : INITIAL_BALL_SPEED;
            // Give a random vertical direction
            ball.dy = (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED;
        }, 1000); // 1-second pause
    }

    function startGame() {
        // For AI games, start immediately. For PvP, add small delay
        const delay = isAIMode ? 100 : 1000;
        setTimeout(() => {
            // Start the ball in a random direction
            ball.dx = (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED;
            ball.dy = (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED;
            console.log(`🎾 Ball started with velocity (${ball.dx}, ${ball.dy})`);
        }, delay);
    }

    // Function to validate current game state with server
    function validateGameState() {
        if (!aiSocket || !aiGameId) return;
        
        const currentGameState = {
            ball: {
                x: ball.x,
                y: ball.y,
                velocityX: ball.dx,
                velocityY: ball.dy,
                speed: Math.sqrt(ball.dx ** 2 + ball.dy ** 2)
            },
            canvas: {
                width: canvas.width,
                height: canvas.height
            },
            paddles: {
                player1: {
                    y: player1.y,
                    height: PADDLE_HEIGHT,
                    width: PADDLE_WIDTH,
                    speed: PADDLE_SPEED
                },
                player2: {
                    y: player2.y,
                    height: PADDLE_HEIGHT,
                    width: PADDLE_WIDTH,
                    speed: PADDLE_SPEED
                }
            },
            score: {
                player1: player1.score,
                player2: player2.score
            },
            gameActive: true,
            isPaused: false,
            lastUpdate: Date.now()
        };
        
        // Send validation request to server
        try {
            aiSocket.send(JSON.stringify({
                event: 'validate_state',
                gameId: aiGameId,
                playerId: 'human_player',
                timestamp: Date.now(),
                data: {
                    gameState: currentGameState
                }
            }));
        } catch (error) {
            console.error('Failed to send state validation request:', error);
        }
    }

    function update() {
        // Move player 1 paddle (always human-controlled) with enhanced synchronization
        if ((keysPressed['w'] || keysPressed['W']) && player1.y > 0) {
            const oldY = player1.y;
            player1.y -= PADDLE_SPEED;
            
            // Send enhanced paddle movement data for synchronization
            if (isAIMode && aiSocket && aiGameId) {
                aiSocket.send(JSON.stringify({
                    event: 'paddle_move',
                    gameId: aiGameId,
                    playerId: 'human_player',
                    timestamp: Date.now(),
                    data: { 
                        y: player1.y,
                        direction: 'up',
                        velocity: PADDLE_SPEED,
                        intensity: 1,
                        duration: 16, // Frame duration
                        previousY: oldY,
                        // Include ball state for AI
                        ball: {
                            x: ball.x,
                            y: ball.y,
                            velocityX: ball.dx,
                            velocityY: ball.dy
                        }
                    }
                }));
            }
        }
        if ((keysPressed['s'] || keysPressed['S']) && player1.y < canvas.height - player1.height) {
            const oldY = player1.y;
            player1.y += PADDLE_SPEED;
            
            // Send enhanced paddle movement data for synchronization
            if (isAIMode && aiSocket && aiGameId) {
                aiSocket.send(JSON.stringify({
                    event: 'paddle_move',
                    gameId: aiGameId,
                    playerId: 'human_player',
                    timestamp: Date.now(),
                    data: { 
                        y: player1.y,
                        direction: 'down',
                        velocity: PADDLE_SPEED,
                        intensity: 1,
                        duration: 16, // Frame duration
                        previousY: oldY,
                        // Include ball state for AI
                        ball: {
                            x: ball.x,
                            y: ball.y,
                            velocityX: ball.dx,
                            velocityY: ball.dy
                        }
                    }
                }));
            }
        }
        
        // Move player 2 paddle (human in human mode, AI-controlled in AI mode)
        if (!isAIMode) {
            if (keysPressed['ArrowUp'] && player2.y > 0) {
                player2.y -= PADDLE_SPEED;
            }
            if (keysPressed['ArrowDown'] && player2.y < canvas.height - player2.height) {
                player2.y += PADDLE_SPEED;
            }
        } else {
            // Smooth lerp to reduce shaking, but snap to target if very close
            const diff = Math.abs(aiTargetY - player2.y);
            if (diff < 2) {
                // Very close - snap to eliminate shaking
                player2.y = aiTargetY;
            } else if (diff < 20) {
                // Small difference - use light smoothing
                player2.y += (aiTargetY - player2.y) * 0.4;
            } else {
                // Large difference - move faster
                player2.y += (aiTargetY - player2.y) * 0.6;
            }
        }        // Move ball
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Wall collision (top/bottom)
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.dy *= -1;
        }

        // Send periodic updates to AI (every 3 frames, ~20 times per second at 60fps)
        frameCounter++;
        if (isAIMode && aiSocket && aiGameId && aiSocket.readyState === WebSocket.OPEN && frameCounter % 3 === 0) {
            aiSocket.send(JSON.stringify({
                event: 'paddle_move',
                gameId: aiGameId,
                playerId: 'human_player',
                timestamp: Date.now(),
                data: {
                    y: player1.y,
                    direction: 'none',
                    velocity: 0,
                    intensity: 0,
                    duration: 16,
                    previousY: player1.y,
                    ball: {
                        x: ball.x,
                        y: ball.y,
                        velocityX: ball.dx,
                        velocityY: ball.dy
                    }
                }
            }));
        }

        // Paddle collision detection
        let player = (ball.dx < 0) ? player1 : player2;
        if (
            ball.x - ball.radius < player.x + player.width &&
            ball.x + ball.radius > player.x &&
            ball.y - ball.radius < player.y + player.height &&
            ball.y + ball.radius > player.y
        ) {
            ball.dx *= -1;
            // Increase speed slightly on hit
            ball.dx *= BALL_SPEED_INCREASE_FACTOR;
            ball.dy *= BALL_SPEED_INCREASE_FACTOR;
        }

        // Score points if ball goes past a paddle
        if (ball.x + ball.radius > canvas.width) {
            player1.score++;
            updateScoreDisplay();
            
            // Notify AI of scoring event
            if (isAIMode && aiSocket && aiGameId) {
                // Send ball scored event first
                aiSocket.send(JSON.stringify({
                    event: 'ball_scored',
                    gameId: aiGameId,
                    playerId: 'human_player',
                    timestamp: Date.now(),
                    data: {
                        side: 'right', // Ball went past right paddle (AI scored against)
                        ballPosition: { x: ball.x, y: ball.y },
                        ballVelocity: { x: ball.dx, y: ball.dy }
                    }
                }));
                
                // Send score update
                aiSocket.send(JSON.stringify({
                    event: 'score_update',
                    gameId: aiGameId,
                    playerId: 'human_player',
                    timestamp: Date.now(),
                    data: {
                        scorer: 'human',
                        newScore: { human: player1.score, ai: player2.score }
                    }
                }));
            }
            
            if (gameOptions.onGameEnd && player1.score >= WINNING_SCORE) {
                cancelAnimationFrame(animationFrameId);
                gameOptions.onGameEnd({ winnerName: player1Alias, score1: player1.score, score2: player2.score });
                return;
            }
            resetBall();
        } else if (ball.x - ball.radius < 0) {
            player2.score++;
            updateScoreDisplay();
            
            // Notify AI of scoring event
            if (isAIMode && aiSocket && aiGameId) {
                // Send ball scored event first
                aiSocket.send(JSON.stringify({
                    event: 'ball_scored',
                    gameId: aiGameId,
                    playerId: 'human_player',
                    timestamp: Date.now(),
                    data: {
                        side: 'left', // Ball went past left paddle (human scored against)
                        ballPosition: { x: ball.x, y: ball.y },
                        ballVelocity: { x: ball.dx, y: ball.dy }
                    }
                }));
                
                // Send score update
                aiSocket.send(JSON.stringify({
                    event: 'score_update',
                    gameId: aiGameId,
                    playerId: 'human_player',
                    timestamp: Date.now(),
                    data: {
                        scorer: 'ai',
                        newScore: { human: player1.score, ai: player2.score }
                    }
                }));
            }
            
            if (gameOptions.onGameEnd && player2.score >= WINNING_SCORE) {
                cancelAnimationFrame(animationFrameId);
                gameOptions.onGameEnd({ winnerName: player2Alias, score1: player1.score, score2: player2.score });
                return;
            }
            resetBall();
        }

        draw();
        // Periodic state validation
        const currentTime = Date.now();
        if (isAIMode && aiSocket && aiGameId && (currentTime - lastValidationTime > VALIDATION_INTERVAL)) {
            validateGameState();
            lastValidationTime = currentTime;
        }

        animationFrameId = requestAnimationFrame(update);
    }

    function draw() {
        // Clear canvas
        ctx!.fillStyle = 'black';
        ctx!.fillRect(0, 0, canvas.width, canvas.height);

        // Draw paddles
        ctx!.fillStyle = 'white';
        ctx!.fillRect(player1.x, player1.y, player1.width, player1.height);
        ctx!.fillRect(player2.x, player2.y, player2.width, player2.height);

        // Draw ball
        ctx!.beginPath();
        ctx!.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx!.fillStyle = 'white';
        ctx!.fill();
        ctx!.closePath();

        // Draw net
        ctx!.beginPath();
        ctx!.setLineDash([10, 15]);
        ctx!.moveTo(canvas.width / 2, 0);
        ctx!.lineTo(canvas.width / 2, canvas.height);
        ctx!.strokeStyle = 'white';
        ctx!.lineWidth = 2;
        ctx!.stroke();
        ctx!.closePath();
        ctx!.setLineDash([]); // Reset line dash

        // Draw scores
        ctx!.font = '45px sans-serif';
        ctx!.fillText(player1.score.toString(), canvas.width / 4, 50);
        ctx!.fillText(player2.score.toString(), (canvas.width / 4) * 3, 50);
    }

        // Draw player names and game mode info
        ctx!.font = '20px sans-serif';
        ctx!.textAlign = 'center';
        ctx!.fillStyle = 'white';
        ctx!.fillText(player1Alias, canvas.width / 4, canvas.height - 20);
        ctx!.fillText(player2Alias, (canvas.width / 4) * 3, canvas.height - 20);
        
        // Enhanced AI status indicators
        if (isAIMode && ctx) {
            // AI difficulty indicator
            const aiX = player2.x + player2.width + 15;
            const aiY = player2.y;
            
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#00ff00';
            ctx.fillText(`AI: ${aiStatus.difficulty.toUpperCase()}`, aiX, aiY - 10);
            
            // AI status badge
            const badgeColor = aiStatus.isActive ? '#00ff00' : '#ff0000';
            ctx.fillStyle = badgeColor;
            ctx.fillRect(aiX, aiY - 5, 8, 8);
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.fillText(aiStatus.isActive ? 'ON' : 'OFF', aiX + 12, aiY + 2);
            
            // Performance bars
            const barY = aiY + 35;
            const barWidth = 80;
            const barHeight = 6;
            
            // Accuracy bar background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(aiX, barY, barWidth, barHeight);
            
            // Accuracy bar fill
            const accuracyWidth = (aiStatus.accuracy * barWidth);
            const accuracyColor = aiStatus.accuracy > 0.8 ? '#00ff00' : 
                                aiStatus.accuracy > 0.5 ? '#ffff00' : '#ff4444';
            ctx.fillStyle = accuracyColor;
            ctx.fillRect(aiX, barY, accuracyWidth, barHeight);
            
            // Accuracy label
            ctx.font = '8px Arial';
            ctx.fillStyle = 'white';
            ctx.fillText(`Accuracy: ${Math.round(aiStatus.accuracy * 100)}%`, aiX, barY - 2);
            
            // Animated thinking indicator
            if (aiStatus.thinking) {
                const thinkTime = Date.now() - aiStatus.thinkingStartTime;
                const pulse = Math.sin(thinkTime / 200) * 0.5 + 0.5;
                
                // Pulsing thought bubble
                ctx.fillStyle = `rgba(255, 255, 0, ${pulse * 0.8})`;
                ctx.beginPath();
                ctx.arc(aiX + 40, aiY - 30, 15 + (pulse * 5), 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = 'black';
                ctx.font = '8px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('?', aiX + 40, aiY - 26);
                
                // Ball trajectory prediction line with animation
                if (ball.dx !== 0 && ball.dy !== 0) {
                    ctx.strokeStyle = `rgba(0, 255, 0, ${pulse * 0.5})`;
                    ctx.lineWidth = 1;
                    ctx.setLineDash([5, 5]);
                    ctx.beginPath();
                    
                    let predX = ball.x;
                    let predY = ball.y;
                    let predVelX = ball.dx;
                    let predVelY = ball.dy;
                    
                    ctx.moveTo(predX, predY);
                    
                    // Animated prediction line
                    const steps = 20 + Math.floor(pulse * 10);
                    for (let i = 0; i < steps; i++) {
                        predX += predVelX;
                        predY += predVelY;
                        
                        if (predY <= 0 || predY >= canvas.height) {
                            predVelY = -predVelY;
                        }
                        
                        ctx.lineTo(predX, predY);
                        
                        if (predX >= player2.x) break;
                    }
                    
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }
            
            // Movement indicator with animation
            if (aiStatus.lastMoveTime > 0 && Date.now() - aiStatus.lastMoveTime < 1000) {
                const moveAge = Date.now() - aiStatus.lastMoveTime;
                const moveOpacity = Math.max(0, 1 - (moveAge / 1000));
                
                const moveColor = aiStatus.lastMove === 'up' ? 
                    `rgba(0, 150, 255, ${moveOpacity})` : 
                    `rgba(255, 150, 0, ${moveOpacity})`;
                
                // Animated arrow indicator
                const arrowY = aiStatus.lastMove === 'up' ? aiY - 25 : aiY + player2.height + 15;
                const arrowSize = 8 + (moveOpacity * 4);
                
                ctx.fillStyle = moveColor;
                ctx.beginPath();
                
                if (aiStatus.lastMove === 'up') {
                    // Up arrow
                    ctx.moveTo(aiX + 20, arrowY);
                    ctx.lineTo(aiX + 20 - arrowSize, arrowY + arrowSize);
                    ctx.lineTo(aiX + 20 + arrowSize, arrowY + arrowSize);
                } else {
                    // Down arrow
                    ctx.moveTo(aiX + 20, arrowY);
                    ctx.lineTo(aiX + 20 - arrowSize, arrowY - arrowSize);
                    ctx.lineTo(aiX + 20 + arrowSize, arrowY - arrowSize);
                }
                
                ctx.closePath();
                ctx.fill();
            }
        }

    let animationFrameId: number;
    
    // Initialize the game
    update();
    startGame();

    // Return a cleanup function to be called when the view is destroyed
    const cleanup = () => {
        cancelAnimationFrame(animationFrameId);
        document.removeEventListener('keydown', keyDownHandler);
        document.removeEventListener('keyup', keyUpHandler);
        
        // Cleanup AI connections
        if (aiStatsInterval) {
            clearInterval(aiStatsInterval);
        }
        
        if (aiSocket) {
            if (aiGameId) {
                try {
                    aiSocket.send(JSON.stringify({
                        event: 'leave_game',
                        gameId: aiGameId,
                        playerId: 'human_player',
                        timestamp: Date.now(),
                        data: {}
                    }));
                } catch (error) {
                    console.error('Error sending leave_game message:', error);
                }
            }
            aiSocket.close();
        }
    };

    return cleanup;
}
