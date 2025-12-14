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
    const player2Alias = isAIMode ? translate('AI', 'KI', 'IA') : 
                         (gameOptions.player2Name || translate('Player 2', 'Spieler 2', 'Joueur 2'));

    gameWrapper.innerHTML = `
        <div class="text-center flex flex-col items-center gap-4" style="padding: 8px; margin: 0 auto; width: 100%; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
           <header class="w-full max-w-3xl">
               <h1 class="game-title-with-leaves">${translate('Ping Pong', 'Ping Pong', 'Ping Pong')}</h1>
           </header>

           ${isAIMode ? `
           <div class="mb-2 w-full max-w-md">
               <h2 class="text-lg font-semibold mb-3 text-center">${translate('AI Difficulty', 'KI-Schwierigkeit', 'Difficulté IA')}</h2>
               <div class="flex gap-3 justify-center mb-3">
                   <button id="easyBtn" class="ai-difficulty-btn ${gameOptions.aiDifficulty === 'easy' ? 'active' : ''}">
                       ${translate('Easy', 'Einfach', 'Facile')}
                   </button>
                   <button id="mediumBtn" class="ai-difficulty-btn ${gameOptions.aiDifficulty === 'medium' || !gameOptions.aiDifficulty ? 'active' : ''}">
                       ${translate('Medium', 'Mittel', 'Moyen')}
                   </button>
                   <button id="hardBtn" class="ai-difficulty-btn ${gameOptions.aiDifficulty === 'hard' ? 'active' : ''}">
                       ${translate('Hard', 'Schwer', 'Difficile')}
                   </button>
               </div>
           </div>
           ` : ''}

           <!-- Top bar OUTSIDE the game window, with frame -->
           <div id="game2DTopBar" style="position: relative; width: 800px; height: 44px; margin-bottom: 2px; z-index: 10; pointer-events: none; font-family: 'sans-serif'; border: 2px solid #8B4513; border-radius: 8px; background: #2a1a10; box-shadow: 0 2px 8px rgba(61,40,23,0.12);">
               <div style="position: absolute; left: 0; top: 0; width: 200px; height: 100%; display: flex; align-items: center; justify-content: flex-end;">
                   <span id="player1Label2D" style="color: #ebd26e; font-size: 20px; font-weight: bold; margin-right: 10px; text-shadow: 2px 2px 4px #3D2817; font-family: 'sans-serif';">${player1Alias}</span>
               </div>
               <div style="position: absolute; left: 200px; top: 0; width: 400px; height: 100%; display: flex; align-items: center; justify-content: center;">
                   <span id="scoreLabel2D" style="color: #ebd26e; font-size: 28px; font-weight: bold; margin: 0 10px; text-shadow: 2px 2px 4px #3D2817; font-family: 'sans-serif';">0 : 0</span>
               </div>
               <div style="position: absolute; left: 600px; top: 0; width: 200px; height: 100%; display: flex; align-items: center; justify-content: flex-start;">
                   <span id="player2Label2D" style="color: #ebd26e; font-size: 20px; font-weight: bold; margin-left: 10px; text-shadow: 2px 2px 4px #3D2817; font-family: 'sans-serif';">${player2Alias}</span>
               </div>
           </div>

           <section class="w-full max-w-3xl">
               <div style="position: relative; display: flex; justify-content: center; width: 800px; max-width: 100%; margin: 0 auto;">
                   <canvas id="pongCanvas" style="background: #3D2817; border: 4px solid #8B4513; border-radius: 8px; display: block;"></canvas>
                   <!-- Pre-game Popup -->
                   <div id="preGamePopup" class="game-popup-overlay">
                       <div class="game-popup-content">
                           <h2 class="game-popup-title">${translate('Get ready to play!', 'Mach dich bereit zum Spielen!', 'Préparez-vous à jouer!')}</h2>
                           <div class="game-popup-score">
                               <span class="font-semibold">${player1Alias}</span>
                               <span class="text-xl font-bold">0 : 0</span>
                               <span class="font-semibold" id="popupPlayer2Name">${player2Alias}</span>
                           </div>
                           <div class="game-popup-instructions">
                               ${isAIMode ?
                                   `<p>${translate('W/S keys to control your paddle', 'W/S Tasten um dein Paddle zu steuern', 'Touches W/S pour contrôler votre raquette')}</p>` :
                                   `<p>${translate('Player 1: W/S keys', 'Spieler 1: W/S Tasten', 'Joueur 1 : Touches W/S')}</p>
                                    <p>${translate('Player 2: Arrow Up/Down keys', 'Spieler 2: Pfeiltasten Hoch/Runter', 'Joueur 2 : Touches Haut/Bas')}</p>`
                               }
                           </div>
                           <button id="startGameBtn" class="game-popup-button">${translate('Start Game', 'Spiel starten', 'Commencer le jeu')}</button>
                       </div>
                   </div>
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
    const BALL_RADIUS = 15; 
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

    // pumpkin image for the ball
    const pumpkinImage = new Image();
    pumpkinImage.src = '/assets/pumpkin.png';
    
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
        difficulty: (gameOptions.aiDifficulty || 'medium') as 'easy' | 'medium' | 'hard',
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
        const gameKeys = ['w', 'W', 's', 'S', 'ArrowUp', 'ArrowDown', ' '];
        if (gameKeys.indexOf(e.key) !== -1) {
            e.preventDefault();
        }
    }

    function keyUpHandler(e: KeyboardEvent) {
        keysPressed[e.key] = false;
        const gameKeys = ['w', 'W', 's', 'S', 'ArrowUp', 'ArrowDown', ' '];
        if (gameKeys.indexOf(e.key) !== -1) {
            e.preventDefault();
        }
    }

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    // function to restart the game
    function restartGame() {
        player1.score = 0;
        player2.score = 0;
        updateScoreDisplay();
        
        // Reset ball
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx = 0;
        ball.dy = 0;
        
        player1.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
        player2.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
        
        // close existing AI
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
            aiSocket = null;
        }
        
        if (aiStatsInterval) {
            clearInterval(aiStatsInterval);
            aiStatsInterval = null;
        }
        
        // update button
        const easyBtn = document.getElementById('easyBtn');
        const mediumBtn = document.getElementById('mediumBtn');
        const hardBtn = document.getElementById('hardBtn');
        
        if (easyBtn) {
            easyBtn.className = `ai-difficulty-btn ${gameOptions.aiDifficulty === 'easy' ? 'active' : ''}`;
        }
        if (mediumBtn) {
            mediumBtn.className = `ai-difficulty-btn ${gameOptions.aiDifficulty === 'medium' ? 'active' : ''}`;
        }
        if (hardBtn) {
            hardBtn.className = `ai-difficulty-btn ${gameOptions.aiDifficulty === 'hard' ? 'active' : ''}`;
        }
        
        const popupPlayer2Name = document.getElementById('popupPlayer2Name');
        if (popupPlayer2Name && isAIMode) {
            popupPlayer2Name.textContent = translate('AI', 'KI', 'IA');
        }
        
        // reinitialize AI with
        if (isAIMode) {
            console.log('🔄 Restarting game with difficulty:', gameOptions.aiDifficulty);
            initializeAIGame();
        }
        
        startGame();
    }

    // Setup button handlers for AI difficulty selection
    const easyBtn = document.getElementById('easyBtn');
    const mediumBtn = document.getElementById('mediumBtn');
    const hardBtn = document.getElementById('hardBtn');

    // AI difficulty buttons
    if (easyBtn) {
        easyBtn.addEventListener('click', () => {
            gameOptions.aiDifficulty = 'easy';
            aiStatus.difficulty = 'easy'; 
            updatePlayer2Name();
            restartGame();
        });
    }

    if (mediumBtn) {
        mediumBtn.addEventListener('click', () => {
            gameOptions.aiDifficulty = 'medium';
            aiStatus.difficulty = 'medium';
            updatePlayer2Name(); 
            restartGame();
        });
    }

    if (hardBtn) {
        hardBtn.addEventListener('click', () => {
            gameOptions.aiDifficulty = 'hard';
            aiStatus.difficulty = 'hard'; 
            updatePlayer2Name();
            restartGame();
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
                console.log('🎮 Sending join_game with difficulty:', gameOptions.aiDifficulty || 'medium');
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
        const scoreLabel2D = document.getElementById('scoreLabel2D');
        if (scoreLabel2D) {
            scoreLabel2D.textContent = `${player1.score} : ${player2.score}`;
        }
        if (scoreDisplay) {
            scoreDisplay.textContent = `${player1.score} : ${player2.score}`;
        }
    }

    function updatePlayer2Name() {
        const player2NameDisplay = document.getElementById('player2Name');
        if (player2NameDisplay && isAIMode) {
            player2NameDisplay.textContent = `AI (${aiStatus.difficulty})`;
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
        // Show pre-game popup
        showPreGamePopup();
    }

    function showPreGamePopup() {
        const popup = document.getElementById('preGamePopup');
        const startBtn = document.getElementById('startGameBtn');
        
        if (!popup || !startBtn) return;
        
        popup.classList.add('show');
        
        startBtn.onclick = () => {
            // Hide the popup immediately
            popup.classList.remove('show');
            
            // Show countdown on canvas
            showCanvasCountdown();
        };
    }
    
    function showCanvasCountdown() {
        const canvasContainer = canvas.parentElement;
        if (!canvasContainer) return;
        
        // Create countdown overlay element
        const countdownElement = document.createElement('div');
        countdownElement.className = 'canvas-countdown';
        countdownElement.style.position = 'absolute';
        countdownElement.style.top = '50%';
        countdownElement.style.left = '50%';
        countdownElement.style.transform = 'translate(-50%, -50%)';
        
        // Position it relative to canvas
        const canvasRect = canvas.getBoundingClientRect();
        canvasContainer.style.position = 'relative';
        canvasContainer.appendChild(countdownElement);
        
        let countdown = 3;
        countdownElement.textContent = countdown.toString();
        
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                countdownElement.textContent = countdown.toString();
                // Re-trigger animation
                countdownElement.style.animation = 'none';
                setTimeout(() => {
                    countdownElement.style.animation = 'countdownPulse 1s ease-in-out';
                }, 10);
            } else {
                countdownElement.textContent = translate('GO!', 'LOS!', 'GO!');
                countdownElement.style.animation = 'none';
                setTimeout(() => {
                    countdownElement.style.animation = 'countdownPulse 1s ease-in-out';
                }, 10);
                clearInterval(countdownInterval);
                
                setTimeout(() => {
                    countdownElement.remove();
                    // Start the ball in a random direction
                    ball.dx = (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED;
                    ball.dy = (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED;
                    console.log(`🎾 Ball started with velocity (${ball.dx}, ${ball.dy})`);
                }, 1000);
            }
        }, 1000);
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

    function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
        const r = Math.min(radius, width / 2, height / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + width - r, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + r);
        ctx.lineTo(x + width, y + height - r);
        ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        ctx.lineTo(x + r, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
    }

    function draw() {
        // Clear canvas with dark brown autumn background
        ctx!.fillStyle = '#3D2817'; // Dark brown color
        ctx!.fillRect(0, 0, canvas.width, canvas.height);

        // Player 1 - Orange paddle (like autumn leaves)
        ctx!.fillStyle = '#D2691E'; // Chocolate/orange
        drawRoundedRect(ctx!, player1.x, player1.y, player1.width, player1.height, 18);

        // Player 2 - Dark orange/burnt orange paddle
        ctx!.fillStyle = '#CC5500'; // Burnt orange
        drawRoundedRect(ctx!, player2.x, player2.y, player2.width, player2.height, 18);

        // Draw ball as pumpkin image
        if (pumpkinImage.complete) {
            ctx!.drawImage(
                pumpkinImage,
                ball.x - ball.radius,
                ball.y - ball.radius,
                ball.radius * 2,
                ball.radius * 2
            );
        } else {
            // Fallback: Draw orange circle if image not loaded
            ctx!.beginPath();
            ctx!.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx!.fillStyle = '#FF6B35'; // Pumpkin orange
            ctx!.fill();
            ctx!.closePath();
        }

        // Draw net with autumn beige color
        ctx!.beginPath();
        ctx!.setLineDash([10, 15]);
        ctx!.moveTo(canvas.width / 2, 0);
        ctx!.lineTo(canvas.width / 2, canvas.height);
        ctx!.strokeStyle = '#D4A574'; // Autumn beige
        ctx!.lineWidth = 2;
        ctx!.stroke();
        ctx!.closePath();
        ctx!.setLineDash([]); // Reset line dash

        // [AI-UPDATE] REQUIREMENT 2: AI paddle must use exact same rendering as human paddle
        // NO additional decorations, debug lines, or offsets allowed
        // All AI status indicators, thinking bubbles, and movement arrows removed
        // Canvas drawing is clean: always clear and redraw without artifacts
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