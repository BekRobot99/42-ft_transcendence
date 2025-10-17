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
    const player1Alias = gameOptions.player1Name || translate('Player 1', 'Spieler 1', 'Joueur 1');
    const player2Alias = isAIMode ? `AI (${gameOptions.aiDifficulty || 'medium'})` : 
                         (gameOptions.player2Name || translate('Player 2', 'Spieler 2', 'Joueur 2'));

    // Enhanced UI with AI mode support
    gameWrapper.innerHTML = `
        <div class="text-center flex flex-col items-center">
           <h1 class="text-3xl font-bold mb-2">${translate('Ping Pong', 'Ping Pong', 'Ping Pong')}</h1>
           
           ${!isAIMode ? `
           <div class="mb-4 p-4 bg-gray-100 rounded-lg">
               <h2 class="text-lg font-semibold mb-2">${translate('Game Mode', 'Spielmodus', 'Mode de jeu')}</h2>
               <div class="flex gap-4 justify-center mb-4">
                   <button id="humanModeBtn" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                       ${translate('Human vs Human', 'Mensch vs Mensch', 'Humain vs Humain')}
                   </button>
                   <button id="aiModeBtn" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                       ${translate('Human vs AI', 'Mensch vs KI', 'Humain vs IA')}
                   </button>
               </div>
           </div>
           ` : `
           <div class="mb-4 p-4 bg-green-100 rounded-lg">
               <h2 class="text-lg font-semibold mb-2">${translate('AI Mode', 'KI-Modus', 'Mode IA')}</h2>
               <div class="flex gap-2 justify-center mb-2">
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
               <button id="backToModeBtn" class="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600">
                   ${translate('Back to Mode Selection', 'Zurück zur Modusauswahl', 'Retour à la sélection de mode')}
               </button>
           </div>
           `}
           
           <div class="mb-4">
               <div class="flex justify-between items-center mb-2">
                   <span class="font-semibold">${player1Alias}</span>
                   <span class="text-xl font-bold" id="scoreDisplay">0 - 0</span>
                   <span class="font-semibold">${player2Alias}</span>
               </div>
               ${isAIMode ? `
               <div class="text-sm text-gray-600 mb-2">
                   <span id="aiStatsDisplay">AI Performance: Loading...</span>
               </div>
               ` : ''}
           </div>
           
            <p class="text-gray-600 mb-4">
                ${isAIMode ? 
                    translate('W/S keys to control your paddle', 'W/S Tasten um dein Paddle zu steuern', 'Touches W/S pour contrôler votre raquette') :
                    translate('Player 1: W/S keys | Player 2: Arrow Up/Down keys', 'Spieler 1: W/S Tasten | Spieler 2: Pfeiltasten Hoch/Runter', 'Joueur 1 : Touches W/S | Joueur 2 : Touches Haut/Bas')
                }
            </p>
            <canvas id="pongCanvas" class="bg-black border-2 border-white"></canvas>
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
    const WINNING_SCORE = 1;
    const INITIAL_BALL_SPEED = 3;
    const BALL_SPEED_INCREASE_FACTOR = 1.1;

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
        initializeAIGame();
    }

    function initializeAIGame() {
        try {
            aiSocket = new WebSocket(`ws://localhost:8080/api/ws/game`);
            
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
                    handleAIGameMessage(message);
                } catch (error) {
                    console.error('Error parsing AI game message:', error);
                }
            };

            aiSocket.onclose = () => {
                console.log('AI WebSocket disconnected');
                if (aiStatsInterval) {
                    clearInterval(aiStatsInterval);
                }
            };

            aiSocket.onerror = (error) => {
                console.error('AI WebSocket error:', error);
            };
        } catch (error) {
            console.error('Failed to connect to AI game server:', error);
        }
    }

    function handleAIGameMessage(message: any) {
        switch (message.type) {
            case 'game_joined':
                aiGameId = message.gameId;
                console.log(`Joined AI game: ${aiGameId}`);
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
        setTimeout(() => {
            // Start the ball in a random direction
            ball.dx = (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED;
            ball.dy = (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED;
        }, 1000); // 1-second delay before game starts
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
                        previousY: oldY
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
                        previousY: oldY
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
        }
        // Note: In AI mode, player2 paddle movement is handled by AI messages

        // Move ball
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Wall collision (top/bottom)
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.dy *= -1;
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