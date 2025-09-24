import { translate } from "../languageService.js";
export function renderGamePage(gameWrapper, tournamentOptions) {
    const player1Alias = tournamentOptions ? tournamentOptions.player1Name : translate('Player 1', 'Spieler 1', 'Joueur 1');
    const player2Alias = tournamentOptions ? tournamentOptions.player2Name : translate('Player 2', 'Spieler 2', 'Joueur 2');
    gameWrapper.innerHTML = `
        <div class="text-center flex flex-col items-center">
           <h1 class="text-3xl font-bold mb-2">${translate('Ping Pong', 'Ping Pong', 'Ping Pong')}</h1>
            <p class="text-gray-600 mb-4">${translate('Player 1: W/S keys | Player 2: Arrow Up/Down keys', 'Spieler 1: W/S Tasten | Spieler 2: Pfeiltasten Hoch/Runter', 'Joueur 1 : Touches W/S | Joueur 2 : Touches Haut/Bas')}</p>
            <canvas id="pongCanvas" class="bg-black border-2 border-white"></canvas>
        </div>
    `;
    const canvas = document.getElementById('pongCanvas');
    if (!canvas) {
        console.error("Could not find #pongCanvas");
        return () => { };
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Could not get 2D context");
        return () => { };
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
    const keysPressed = {};
    function keyDownHandler(e) {
        keysPressed[e.key] = true;
    }
    function keyUpHandler(e) {
        keysPressed[e.key] = false;
    }
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
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
        // Move paddles based on keyboard state
        if ((keysPressed['w'] || keysPressed['W']) && player1.y > 0) {
            player1.y -= PADDLE_SPEED;
        }
        if ((keysPressed['s'] || keysPressed['S']) && player1.y < canvas.height - player1.height) {
            player1.y += PADDLE_SPEED;
        }
        if (keysPressed['ArrowUp'] && player2.y > 0) {
            player2.y -= PADDLE_SPEED;
        }
        if (keysPressed['ArrowDown'] && player2.y < canvas.height - player2.height) {
            player2.y += PADDLE_SPEED;
        }
        // Move ball
        ball.x += ball.dx;
        ball.y += ball.dy;
        // Wall collision (top/bottom)
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.dy *= -1;
        }
        // Paddle collision detection
        let player = (ball.dx < 0) ? player1 : player2;
        if (ball.x - ball.radius < player.x + player.width &&
            ball.x + ball.radius > player.x &&
            ball.y - ball.radius < player.y + player.height &&
            ball.y + ball.radius > player.y) {
            ball.dx *= -1;
            // Increase speed slightly on hit
            ball.dx *= BALL_SPEED_INCREASE_FACTOR;
            ball.dy *= BALL_SPEED_INCREASE_FACTOR;
        }
        // Score points if ball goes past a paddle
        if (ball.x + ball.radius > canvas.width) {
            player1.score++;
            if (tournamentOptions && player1.score >= WINNING_SCORE) {
                cancelAnimationFrame(animationFrameId);
                tournamentOptions.onGameEnd({ winnerName: player1Alias, score1: player1.score, score2: player2.score });
                return;
            }
            resetBall();
        }
        else if (ball.x - ball.radius < 0) {
            player2.score++;
            if (tournamentOptions && player2.score >= WINNING_SCORE) {
                cancelAnimationFrame(animationFrameId);
                tournamentOptions.onGameEnd({ winnerName: player2Alias, score1: player1.score, score2: player2.score });
                return;
            }
            resetBall();
        }
        draw();
        animationFrameId = requestAnimationFrame(update);
    }
    function draw() {
        // Clear canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw paddles
        ctx.fillStyle = 'white';
        ctx.fillRect(player1.x, player1.y, player1.width, player1.height);
        ctx.fillRect(player2.x, player2.y, player2.width, player2.height);
        // Draw ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
        // Draw net
        ctx.beginPath();
        ctx.setLineDash([10, 15]);
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        ctx.setLineDash([]); // Reset line dash
        // Draw scores
        ctx.font = '45px sans-serif';
        ctx.fillText(player1.score.toString(), canvas.width / 4, 50);
        ctx.fillText(player2.score.toString(), (canvas.width / 4) * 3, 50);
    }
    // Draw player names if in tournament mode
    if (tournamentOptions) {
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.fillText(player1Alias, canvas.width / 4, canvas.height - 20);
        ctx.fillText(player2Alias, (canvas.width / 4) * 3, canvas.height - 20);
    }
    let animationFrameId;
    update();
    startGame();
    // Return a cleanup function to be called when the view is destroyed
    const cleanup = () => {
        cancelAnimationFrame(animationFrameId);
        document.removeEventListener('keydown', keyDownHandler);
        document.removeEventListener('keyup', keyUpHandler);
    };
    return cleanup;
}
//# sourceMappingURL=GamePage.js.map