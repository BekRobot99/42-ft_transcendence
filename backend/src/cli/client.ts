import WebSocket from 'ws';
import axios from 'axios';
import * as readline from 'readline';
import { stdin, stdout } from 'process';

const API_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000/api/ws/game';

// Types for Game State (simplified from backend)
interface GameState {
    ball: { x: number, y: number };
    paddles: {
        player1: { y: number, height: number }; // Human (Left)
        player2: { y: number, height: number }; // AI/Opponent (Right)
    };
    score: { player1: number, player2: number };
    canvas: { width: number, height: number };
}

class PongCLI {
    private ws: WebSocket | null = null;
    private cookie: string = '';
    private rl: readline.Interface;
    private gameActive: boolean = false;
    private paddleY: number = 250;
    private gameId: string = '';

    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    private async ask(question: string): Promise<string> {
        return new Promise(resolve => {
            this.rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    }

    async start() {
        console.clear();
        console.log('🏓 Welcome to ft_transcendence CLI Pong! 🏓');

        try {
            await this.login();
            await this.connectToGame();
        } catch (error: any) {
            console.error('Error:', error.message || error);
            this.rl.close();
            process.exit(1);
        }
    }

    private async login() {
        console.log('\n--- Login ---');
        const username = await this.ask('Username: ');
        const password = await this.ask('Password: ');

        try {
            let response = await axios.post(`${API_URL}/api/signin`, {
                username,
                password
            }, {
                validateStatus: (status) => status < 500 // Handle 401 manually
            });

            if (response.status === 200 && response.data.twofaRequired) {
                console.log('🔐 2FA Code Required');
                // Extract pending cookie
                const cookies = response.headers['set-cookie'];
                if (!cookies) throw new Error('No cookies received for 2FA');

                const mfaCode = await this.ask('Enter 2FA Code: ');

                response = await axios.post(`${API_URL}/api/signin`, {
                    username,
                    password,
                    mfaCode
                }, {
                    headers: {
                        Cookie: cookies // Send back the pending cookie
                    }
                });
            }

            if (response.status !== 200) {
                throw new Error(response.data.message || 'Login failed');
            }

            // Save auth cookie
            const cookies = response.headers['set-cookie'];
            if (cookies) {
                this.cookie = cookies.find(c => c.startsWith('authToken=')) || '';
                console.log('✅ Login successful!');
            } else {
                throw new Error('No auth token received');
            }

        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || 'Login failed');
            }
            throw error;
        }
    }

    private async connectToGame() {
        console.log('Connecting to Game Server...');

        this.ws = new WebSocket(WS_URL, {
            headers: {
                Cookie: this.cookie
            }
        });

        this.ws.on('open', () => {
            console.log('✅ Connected to WebSocket');
            this.joinGame();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
            const message = JSON.parse(data.toString());
            this.handleMessage(message);
        });

        this.ws.on('error', (err: Error) => {
            console.error('WebSocket Error:', err.message);
            process.exit(1);
        });

        this.ws.on('close', () => {
            console.log('Disconnected from server');
            process.exit(0);
        });
    }

    private joinGame() {
        console.log('Joining AI Game (Medium Difficulty)...');
        this.ws?.send(JSON.stringify({
            event: 'join_game',
            data: {
                gameType: 'ai',
                difficulty: 'medium'
            }
        }));
    }

    private handleMessage(message: any) {
        switch (message.type) {
            case 'game_joined':
                console.log('🎮 Game Joined! ID:', message.gameId);
                this.gameId = message.gameId;
                this.startGameLoop();
                break;
            case 'game_state_update':
                if (this.gameActive) {
                    this.renderGame(message.gameState);
                }
                break;
            case 'game_ended':
                this.gameActive = false;
                console.clear();
                console.log(`🏆 Game Over! Winner: ${message.winner}`);
                console.log(`Final Score - You: ${message.finalScore.player1} | AI: ${message.finalScore.player2}`);
                process.exit(0);
                break;
            case 'error':
                console.error('Server Error:', message.error);
                break;
        }
    }

    private startGameLoop() {
        this.gameActive = true;

        // Setup raw mode for input
        if (stdin.isTTY) {
            stdin.setRawMode(true);
            stdin.resume();
            stdin.setEncoding('utf8');

            stdin.on('data', (key: string) => {
                // Ctrl+C to exit
                if (key === '\u0003') {
                    console.clear();
                    console.log('Exiting...');
                    process.exit(0);
                }

                // Arrow Up/Down
                if (key === '\u001b[A') { // Up
                    this.movePaddle('up');
                } else if (key === '\u001b[B') { // Down
                    this.movePaddle('down');
                }
            });
        }
    }

    private movePaddle(direction: 'up' | 'down') {
        const moveAmount = 15;
        if (direction === 'up') {
            this.paddleY = Math.max(0, this.paddleY - moveAmount);
        } else {
            this.paddleY = Math.min(600 - 100, this.paddleY + moveAmount); // Assuming canvas height 600, paddle height 100
        }

        this.ws?.send(JSON.stringify({
            event: 'paddle_move',
            data: {
                y: this.paddleY,
                direction: direction,
                intensity: 1
            }
        }));
    }

    private renderGame(state: GameState) {
        // Simple ASCII Rendering
        // Canvas is 800x600. We'll scale it down to fit terminal (e.g., 80x24)
        const width = 80;
        const height = 24;
        const scaleX = width / state.canvas.width;
        const scaleY = height / state.canvas.height;

        const buffer = Array(height).fill(null).map(() => Array(width).fill(' '));

        // Draw Borders
        for (let x = 0; x < width; x++) {
            buffer[0][x] = '═';
            buffer[height - 1][x] = '═';
        }

        // Draw Ball
        const ballX = Math.floor(state.ball.x * scaleX);
        const ballY = Math.floor(state.ball.y * scaleY);
        if (ballY >= 0 && ballY < height && ballX >= 0 && ballX < width) {
            buffer[ballY][ballX] = 'O';
        }

        // Draw Paddles
        const drawPaddle = (y: number, h: number, xPos: number) => {
            const startY = Math.floor(y * scaleY);
            const endY = Math.floor((y + h) * scaleY);
            for (let i = startY; i < endY; i++) {
                if (i >= 0 && i < height) {
                    buffer[i][xPos] = '║';
                }
            }
        };

        drawPaddle(state.paddles.player1.y, state.paddles.player1.height, 2); // Left
        drawPaddle(state.paddles.player2.y, state.paddles.player2.height, width - 3); // Right

        // Render
        console.clear();
        console.log(`Score: You ${state.score.player1} - ${state.score.player2} AI`);
        console.log(buffer.map(row => row.join('')).join('\n'));
        console.log('Use Arrow Keys to Move (Ctrl+C to Quit)');
    }
}

// Start the CLI
new PongCLI().start();
