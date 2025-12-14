import { translate } from "../languageService.js";

// Using global BABYLON and BABYLON.GUI which are loaded from script tags in index.html
declare const BABYLON: any;

export function renderGamePage3D(container: HTMLElement, tournamentOptions: { player1Name: string, player2Name: string, onGameEnd: (result: { winnerName: string, score1: number, score2: number }) => void }): () => void {
    container.innerHTML = `
        <div class="text-center flex flex-col items-center" style="padding: 8px; margin: 0 auto; width: 100%; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <h1 class="game-title-with-leaves">${translate('3D Ping Pong', '3D Ping Pong', 'Ping Pong 3D')}</h1>
            <!-- Top bar OUTSIDE the game window, with frame -->
            <div id="game3DTopBar" style="position: relative; width: 800px; height: 44px; margin-bottom: 2px; z-index: 10; pointer-events: none; font-family: 'sans-serif'; border: 2px solid #8B4513; border-radius: 8px; background: #2a1a10; box-shadow: 0 2px 8px rgba(61,40,23,0.12);">
                <div style="position: absolute; left: 0; top: 0; width: 200px; height: 100%; display: flex; align-items: center; justify-content: flex-end;">
                    <span id="player1Label3D" style="color: #ebd26e; font-size: 20px; font-weight: bold; margin-right: 10px; text-shadow: 2px 2px 4px #3D2817; font-family: 'sans-serif';">Player 1</span>
                </div>
                <div style="position: absolute; left: 200px; top: 0; width: 400px; height: 100%; display: flex; align-items: center; justify-content: center;">
                    <span id="scoreLabel3D" style="color: #ebd26e; font-size: 28px; font-weight: bold; margin: 0 10px; text-shadow: 2px 2px 4px #3D2817; font-family: 'sans-serif';">0 : 0</span>
                </div>
                <div style="position: absolute; left: 600px; top: 0; width: 200px; height: 100%; display: flex; align-items: center; justify-content: flex-start;">
                    <span id="player2Label3D" style="color: #ebd26e; font-size: 20px; font-weight: bold; margin-left: 10px; text-shadow: 2px 2px 4px #3D2817; font-family: 'sans-serif';">Player 2</span>
                </div>
            </div>
            <div style="position: relative; display: inline-block; width: 800px; height: 600px; max-width: 100%; margin: 0 auto;">
                <canvas id="pongCanvas3D" style="background: #3D2817; border: 4px solid #8B4513; border-radius: 8px; display: block;"></canvas>
                <!-- Pre-game Popup -->
                <div id="preGamePopup3D" class="game-popup-overlay">
                    <div class="game-popup-content">
                        <h2 class="game-popup-title">${translate('Get ready to play!', 'Mach dich bereit zum Spielen!', 'Préparez-vous à jouer!')}</h2>
                        <div class="game-popup-score">
                            <span class="font-semibold">Player 1</span>
                            <span class="text-xl font-bold">0 : 0</span>
                            <span class="font-semibold">Player 2</span>
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

    // same like 2d
    scene.clearColor = new BABYLON.Color4(0.239, 0.157, 0.090, 1.0); // #3D2817

    // Camera
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        -Math.PI / 2,         // alpha
        Math.PI / 3,          // beta
        24,                   // radius
        new BABYLON.Vector3(0, 0, 0),
        scene
    );
    camera.attachControl(canvas, true);
    camera.inputs.remove(camera.inputs.attached.keyboard); // Prevent camera from being controlled by keyboard
    camera.lowerRadiusLimit = 15;
    camera.upperRadiusLimit = 50;
    
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1.0;
    light.diffuse = new BABYLON.Color3(1, 0.9, 0.7); // Warm light
    light.groundColor = new BABYLON.Color3(0.4, 0.3, 0.2); // Brown ground reflection
    
    const pointLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 8, 0), scene);
    pointLight.intensity = 0.5;
    pointLight.diffuse = new BABYLON.Color3(1, 0.85, 0.6); // Soft warm glow

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
    tableMaterial.diffuseColor = new BABYLON.Color3(100/255, 75/255, 47/255);
    tableMaterial.specularColor = new BABYLON.Color3(0.3, 0.2, 0.1); 
    table.material = tableMaterial;

    // Center line 
    const centerLine = BABYLON.MeshBuilder.CreateLines("centerLine", {
        points: [new BABYLON.Vector3(-TABLE_WIDTH / 2, -PADDLE_HEIGHT + 0.11, 0), new BABYLON.Vector3(TABLE_WIDTH / 2, -PADDLE_HEIGHT + 0.11, 0)],
    }, scene);
    centerLine.color = new BABYLON.Color3(0.95, 0.8, 0.6);

    // Paddles
    const paddle1 = BABYLON.MeshBuilder.CreateCylinder("paddle1", { 
        diameter: PADDLE_WIDTH, 
        height: PADDLE_DEPTH, 
        tessellation: 32 
    }, scene);
    paddle1.scaling.z = PADDLE_HEIGHT / PADDLE_WIDTH;
    paddle1.rotation.x = Math.PI / 2;
    paddle1.position.z = -TABLE_DEPTH / 2 + 1;
    paddle1.position.y = 0;
    const paddle1Material = new BABYLON.StandardMaterial("p1Mat", scene);
    paddle1Material.diffuseColor = new BABYLON.Color3(168/255, 97/255, 50/255);
    paddle1Material.specularColor = new BABYLON.Color3(0.3, 0.2, 0.1); 
    paddle1Material.emissiveColor = new BABYLON.Color3(0.08, 0.04, 0.02);
    paddle1.material = paddle1Material;

    const paddle2 = BABYLON.MeshBuilder.CreateCylinder("paddle2", { 
        diameter: PADDLE_WIDTH, 
        height: PADDLE_DEPTH, 
        tessellation: 32 
    }, scene);
    paddle2.scaling.z = PADDLE_HEIGHT / PADDLE_WIDTH;
    paddle2.rotation.x = Math.PI / 2;
    paddle2.position.z = TABLE_DEPTH / 2 - 1;
    paddle2.position.y = 0;
    const paddle2Material = new BABYLON.StandardMaterial("p2Mat", scene);
    paddle2Material.diffuseColor = new BABYLON.Color3(129/255, 64/255, 28/255);
    paddle2Material.specularColor = new BABYLON.Color3(0.25, 0.15, 0.08); 
    paddle2Material.emissiveColor = new BABYLON.Color3(0.05, 0.03, 0.02);
    paddle2.material = paddle2Material;

    // pumpkin ball
    const ball = BABYLON.MeshBuilder.CreateSphere("ball", { 
        diameter: BALL_RADIUS * 2, 
        segments: 32,
        diameterY: BALL_RADIUS * 1.6  // flattened
    }, scene);
    
    // pumpkin lines
    const positions = ball.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    if (positions) {
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // around the pumpkin
            const angle = Math.atan2(z, x);
            const ridgeEffect = Math.cos(angle * 8) * 0.08;
            const distance = Math.sqrt(x * x + z * z);
            if (distance > 0) {
                positions[i] += (x / distance) * ridgeEffect;
                positions[i + 2] += (z / distance) * ridgeEffect;
            }
        }
        ball.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
    }
    
    const ballMaterial = new BABYLON.StandardMaterial("ballMat", scene);
    
    const pumpkinTexture = new BABYLON.DynamicTexture("pumpkinTexture", 512, scene);
    const ctx = pumpkinTexture.getContext();
    
    const gradient = ctx.createRadialGradient(256, 256, 50, 256, 256, 300);
    gradient.addColorStop(0, '#d37e47');
    gradient.addColorStop(0.7, '#c5733f');
    gradient.addColorStop(1, '#b76838');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    ctx.strokeStyle = '#a85f32';
    ctx.lineWidth = 12;
    for (let i = 0; i < 8; i++) {
        const x = (i * 512) / 8 + 32;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.bezierCurveTo(x - 15, 128, x + 15, 384, x, 512);
        ctx.stroke();
    }
    
    ctx.fillStyle = 'rgba(183, 104, 56, 0.3)';
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 20 + 10;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    pumpkinTexture.update();
    
    ballMaterial.diffuseTexture = pumpkinTexture;
    ballMaterial.diffuseColor = new BABYLON.Color3(211/255, 126/255, 71/255);
    ballMaterial.specularColor = new BABYLON.Color3(0.15, 0.08, 0.04);
    ballMaterial.specularPower = 10;
    ballMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
    ballMaterial.backFaceCulling = false;
    
    ball.material = ballMaterial;
    
    // pumpkin stem
    const stem = BABYLON.MeshBuilder.CreateCylinder("stem", {
        height: BALL_RADIUS * 0.5,
        diameterTop: BALL_RADIUS * 0.15,
        diameterBottom: BALL_RADIUS * 0.25,
        tessellation: 8
    }, scene);
    
    // top of pumpkin
    stem.position.y = BALL_RADIUS * 0.9;
    stem.parent = ball;
    
    const stemMaterial = new BABYLON.StandardMaterial("stemMat", scene);
    stemMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.25, 0.15);
    stemMaterial.specularColor = new BABYLON.Color3(0.2, 0.12, 0.08);
    stemMaterial.emissiveColor = new BABYLON.Color3(0.05, 0.03, 0.02);
    stem.material = stemMaterial;
    
    let ballVelocity = new BABYLON.Vector3(0, 0, 0);

    // Keyboard state
    const keysPressed: { [key: string]: boolean } = {};
    const keyDownHandler = (e: KeyboardEvent) => { 
        keysPressed[e.key] = true;
        const gameKeys = ['a', 'A', 'd', 'D', 'ArrowLeft', 'ArrowRight', ' '];
        if (gameKeys.indexOf(e.key) !== -1) {
            e.preventDefault();
        }
    };
    const keyUpHandler = (e: KeyboardEvent) => { 
        keysPressed[e.key] = false;
        const gameKeys = ['a', 'A', 'd', 'D', 'ArrowLeft', 'ArrowRight', ' '];
        if (gameKeys.indexOf(e.key) !== -1) {
            e.preventDefault();
        }
    };
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);

    // Remove Babylon GUI score display, use HTML overlay instead
    function updateScoreText() {
        const scoreLabel = document.getElementById('scoreLabel3D');
        if (scoreLabel) {
            scoreLabel.textContent = `${player1Score} : ${player2Score}`;
        }
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
        endGame('Player 1');
        } else if (player2Score >= WINNING_SCORE) {
        endGame('Player 2');
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
        
        // pumpkin rotation
        if (ballVelocity.length() > 0) {
            ball.rotation.x += ballVelocity.z * 0.5;
            ball.rotation.z -= ballVelocity.x * 0.5;
        }

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