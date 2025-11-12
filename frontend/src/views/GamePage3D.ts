import { translate } from "../languageService.js";

// Using global BABYLON and BABYLON.GUI which are loaded from script tags in index.html
declare const BABYLON: any;

export function renderGamePage3D(container: HTMLElement, tournamentOptions: { player1Name: string, player2Name: string, onGameEnd: (result: { winnerName: string, score1: number, score2: number }) => void }): () => void {
    const player1Alias = tournamentOptions.player1Name;
    const player2Alias = tournamentOptions.player2Name;

    container.innerHTML = `
        <div class="text-center flex flex-col items-center">
           <h1 class="text-3xl font-bold mb-2">${translate('3D Ping Pong', '3D Ping Pong', 'Ping Pong 3D')}</h1>
            <div style="position: relative; display: inline-block;">
                <canvas id="pongCanvas3D" class="bg-black border-2 border-white"></canvas>
                
                <!-- Pre-game Popup -->
                <div id="preGamePopup3D" class="game-popup-overlay">
                    <div class="game-popup-content">
                        <h2 class="game-popup-title">${translate('Get ready to play!', 'Mach dich bereit zum Spielen!', 'Préparez-vous à jouer!')}</h2>
                        <div class="game-popup-score">
                            <span class="font-semibold">${player1Alias}</span>
                            <span class="text-xl font-bold">0 - 0</span>
                            <span class="font-semibold">${player2Alias}</span>
                        </div>
                        <div class="game-popup-instructions">
                            <p>${translate('Player 1: A/D keys', 'Spieler 1: A/D Tasten', 'Joueur 1 : Touches A/D')}</p>
                            <p>${translate('Player 2: Left/Right Arrow keys', 'Spieler 2: Pfeiltasten Links/Rechts', 'Joueur 2 : Touches Gauche/Droite')}</p>
                        </div>
                        <button id="startGameBtn3D" class="game-popup-button">${translate('Start Game', 'Spiel starten', 'Commencer le jeu')}</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const canvas = document.getElementById('pongCanvas3D') as HTMLCanvasElement;
    if (!canvas) {
        console.error("Could not find #pongCanvas3D");
        return () => {};
    }
    
    canvas.width = 800;
    canvas.height = 600;

    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);

    // Camera
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 20, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);
    camera.inputs.remove(camera.inputs.attached.keyboard); // Prevent camera from being controlled by keyboard
    camera.lowerRadiusLimit = 15;
    camera.upperRadiusLimit = 50;
    
    // Lighting
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Game constants
    const TABLE_WIDTH = 10;
    const TABLE_DEPTH = 20;
    const PADDLE_WIDTH = 2;
    const PADDLE_HEIGHT = 0.5;
    const PADDLE_DEPTH = 0.2;
    const BALL_RADIUS = 0.3;
    const PADDLE_SPEED = 0.2;
    const WINNING_SCORE = 10;
    const INITIAL_BALL_SPEED = 0.1;
    const BALL_SPEED_INCREASE_FACTOR = 1.02;

    // Game state
    let player1Score = 0;
    let player2Score = 0;
    let gameRunning = false;

    // Game Table
    const table = BABYLON.MeshBuilder.CreateBox("table", { width: TABLE_WIDTH, height: 0.2, depth: TABLE_DEPTH }, scene);
    table.position.y = -PADDLE_HEIGHT;
    const tableMaterial = new BABYLON.StandardMaterial("tableMat", scene);
    tableMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.5, 0.9);
    table.material = tableMaterial;

    // Center line
    const centerLine = BABYLON.MeshBuilder.CreateLines("centerLine", {
        points: [new BABYLON.Vector3(-TABLE_WIDTH / 2, -PADDLE_HEIGHT + 0.11, 0), new BABYLON.Vector3(TABLE_WIDTH / 2, -PADDLE_HEIGHT + 0.11, 0)],
    }, scene);
    centerLine.color = BABYLON.Color3.White();

    // Paddles
    const paddle1 = BABYLON.MeshBuilder.CreateBox("paddle1", { width: PADDLE_WIDTH, height: PADDLE_HEIGHT, depth: PADDLE_DEPTH }, scene);
    paddle1.position.z = -TABLE_DEPTH / 2 + 1;
    const paddle1Material = new BABYLON.StandardMaterial("p1Mat", scene);
    paddle1Material.diffuseColor = new BABYLON.Color3(1, 0, 0);
    paddle1.material = paddle1Material;

    const paddle2 = BABYLON.MeshBuilder.CreateBox("paddle2", { width: PADDLE_WIDTH, height: PADDLE_HEIGHT, depth: PADDLE_DEPTH }, scene);
    paddle2.position.z = TABLE_DEPTH / 2 - 1;
    const paddle2Material = new BABYLON.StandardMaterial("p2Mat", scene);
    paddle2Material.diffuseColor = new BABYLON.Color3(0, 0, 1);
    paddle2.material = paddle2Material;

    // Ball
    const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: BALL_RADIUS * 2 }, scene);
    const ballMaterial = new BABYLON.StandardMaterial("ballMat", scene);
    ballMaterial.diffuseColor = BABYLON.Color3.White();
    ball.material = ballMaterial;
    let ballVelocity = new BABYLON.Vector3(0, 0, 0);

    // Keyboard state
    const keysPressed: { [key: string]: boolean } = {};
    const keyDownHandler = (e: KeyboardEvent) => { keysPressed[e.key] = true; };
    const keyUpHandler = (e: KeyboardEvent) => { keysPressed[e.key] = false; };
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);

    // GUI for scores
    const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // Player 1 Score (Red, Bottom Paddle)
    const player1ScoreText = new BABYLON.GUI.TextBlock();
    player1ScoreText.text = `${player1Alias}: ${player1Score}`;
    player1ScoreText.color = "red";
    player1ScoreText.fontSize = 24;
    player1ScoreText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    player1ScoreText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    player1ScoreText.left = "20px";
    player1ScoreText.top = "-20px";
    advancedTexture.addControl(player1ScoreText);

    // Player 2 Score (Blue, Top Paddle)
    const player2ScoreText = new BABYLON.GUI.TextBlock();
    player2ScoreText.text = `${player2Alias}: ${player2Score}`;
    player2ScoreText.color = "cyan"; // Brighter blue for visibility
    player2ScoreText.fontSize = 24;
    player2ScoreText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    player2ScoreText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    player2ScoreText.left = "20px";
    player2ScoreText.top = "20px";
    advancedTexture.addControl(player2ScoreText);

    function updateScoreText() {
        player1ScoreText.text = `${player1Alias}: ${player1Score}`;
        player2ScoreText.text = `${player2Alias}: ${player2Score}`;
    }

    function resetBall(direction: number) {
        ball.position = new BABYLON.Vector3(0, 0, 0);
        ballVelocity = new BABYLON.Vector3(0, 0, 0);
        gameRunning = false;

        setTimeout(() => {
            const angle = (Math.random() - 0.5) * (Math.PI / 2); // -45 to +45 degrees
            ballVelocity.z = direction * INITIAL_BALL_SPEED * Math.cos(angle);
            ballVelocity.x = INITIAL_BALL_SPEED * Math.sin(angle);
            gameRunning = true;
        }, 1000);
    }
    
    function startGame() {
        showPreGamePopup();
    }
    
    function showPreGamePopup() {
        const popup = document.getElementById('preGamePopup3D');
        const startBtn = document.getElementById('startGameBtn3D');
        
        if (!popup || !startBtn) return;
        
        popup.classList.add('show');
        
        startBtn.onclick = () => {
            // hide popup
            popup.classList.remove('show');
            showCanvasCountdown();
        };
    }
    
    function showCanvasCountdown() {
        const canvasContainer = canvas.parentElement;
        if (!canvasContainer) return;
        
        // countdown element
        const countdownElement = document.createElement('div');
        countdownElement.className = 'canvas-countdown';
        countdownElement.style.position = 'absolute';
        countdownElement.style.top = '50%';
        countdownElement.style.left = '50%';
        countdownElement.style.transform = 'translate(-50%, -50%)';
        
        canvasContainer.style.position = 'relative';
        canvasContainer.appendChild(countdownElement);
        
        let countdown = 3;
        countdownElement.textContent = countdown.toString();
        
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                countdownElement.textContent = countdown.toString();
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
                    const direction = Math.random() > 0.5 ? 1 : -1;
                    resetBall(direction);
                }, 1000);
            }
        }, 1000);
    }

    function checkWinCondition() {
        if (player1Score >= WINNING_SCORE) {
            endGame(player1Alias);
        } else if (player2Score >= WINNING_SCORE) {
            endGame(player2Alias);
        }
    }

    function endGame(winnerName: string) {
        gameRunning = false;
        ballVelocity = new BABYLON.Vector3(0, 0, 0);
        engine.stopRenderLoop();
        tournamentOptions.onGameEnd({ winnerName, score1: player1Score, score2: player2Score });
    }

    scene.onBeforeRenderObservable.add(() => {
        if (!gameRunning) return;

        // Paddle movement (A/D for P1, Left/Right for P2, moving along X-axis)
        if (keysPressed['a'] || keysPressed['A']) {
            paddle1.position.x = Math.max(-TABLE_WIDTH / 2 + PADDLE_WIDTH / 2, paddle1.position.x - PADDLE_SPEED);
        }
        if (keysPressed['d'] || keysPressed['D']) {
            paddle1.position.x = Math.min(TABLE_WIDTH / 2 - PADDLE_WIDTH / 2, paddle1.position.x + PADDLE_SPEED);
        }
        if (keysPressed['ArrowLeft']) {
            paddle2.position.x = Math.max(-TABLE_WIDTH / 2 + PADDLE_WIDTH / 2, paddle2.position.x - PADDLE_SPEED);
        }
        if (keysPressed['ArrowRight']) {
            paddle2.position.x = Math.min(TABLE_WIDTH / 2 - PADDLE_WIDTH / 2, paddle2.position.x + PADDLE_SPEED);
        }

        // Ball movement
        ball.position.addInPlace(ballVelocity);

        // Wall collisions (left/right)
        if (ball.position.x >= TABLE_WIDTH / 2 - BALL_RADIUS || ball.position.x <= -TABLE_WIDTH / 2 + BALL_RADIUS) {
            ballVelocity.x *= -1;
        }

        // Paddle collisions
        if (ball.intersectsMesh(paddle1, false) && ballVelocity.z < 0) {
            ballVelocity.z *= -1;
            ballVelocity.scaleInPlace(BALL_SPEED_INCREASE_FACTOR);
        }
        if (ball.intersectsMesh(paddle2, false) && ballVelocity.z > 0) {
            ballVelocity.z *= -1;
            ballVelocity.scaleInPlace(BALL_SPEED_INCREASE_FACTOR);
        }

        // Score points
        if (ball.position.z > TABLE_DEPTH / 2) {
            player1Score++;
            updateScoreText();
            checkWinCondition();
            if(gameRunning) resetBall(-1); // Serve to player 2
        } else if (ball.position.z < -TABLE_DEPTH / 2) {
            player2Score++;
            updateScoreText();
            checkWinCondition();
            if(gameRunning) resetBall(1); // Serve to player 1
        }
    });

    engine.runRenderLoop(() => {
        scene.render();
    });

    window.addEventListener('resize', () => {
        engine.resize();
    });

    startGame();

    const cleanup = () => {
        engine.stopRenderLoop();
        if (scene) {
            scene.dispose();
        }
        engine.dispose();
        window.removeEventListener('keydown', keyDownHandler);
        window.removeEventListener('keyup', keyUpHandler);
        window.removeEventListener('resize', () => engine.resize());
        container.innerHTML = '';
    };

    return cleanup;
}
