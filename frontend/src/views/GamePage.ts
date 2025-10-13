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
                } else if (message.move === 'down') {
                    player2.y = Math.min(canvas.height - player2.height, player2.y + PADDLE_SPEED);
                }
                break;

            case 'ai_performance_stats':
                updateAIStatsDisplay(message.stats);
                break;

            case 'ai_activated':
                console.log(`AI activated with ${message.difficulty} difficulty`);
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
        // Move player 1 paddle (always human-controlled)
        if ((keysPressed['w'] || keysPressed['W']) && player1.y > 0) {
            player1.y -= PADDLE_SPEED;
            // Send paddle movement to AI if in AI mode
            if (isAIMode && aiSocket && aiGameId) {
                aiSocket.send(JSON.stringify({
                    event: 'paddle_move',
                    gameId: aiGameId,
                    playerId: 'human_player',
                    timestamp: Date.now(),
                    data: { y: player1.y }
                }));
            }
        }
        if ((keysPressed['s'] || keysPressed['S']) && player1.y < canvas.height - player1.height) {
            player1.y += PADDLE_SPEED;
            // Send paddle movement to AI if in AI mode
            if (isAIMode && aiSocket && aiGameId) {
                aiSocket.send(JSON.stringify({
                    event: 'paddle_move',
                    gameId: aiGameId,
                    playerId: 'human_player',
                    timestamp: Date.now(),
                    data: { y: player1.y }
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
            if (gameOptions.onGameEnd && player1.score >= WINNING_SCORE) {
                cancelAnimationFrame(animationFrameId);
                gameOptions.onGameEnd({ winnerName: player1Alias, score1: player1.score, score2: player2.score });
                return;
            }
            resetBall();
        } else if (ball.x - ball.radius < 0) {
            player2.score++;
            updateScoreDisplay();
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
        
        // Show AI indicator if in AI mode
        if (isAIMode) {
            ctx!.font = '12px sans-serif';
            ctx!.fillStyle = '#00ff00';
            ctx!.fillText('AI', (canvas.width / 4) * 3, canvas.height - 40);
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