"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIPlayer = void 0;
class AIPlayer {
    constructor(difficulty = 'medium') {
        this.isActive = false;
        this.lastUpdateTime = 0;
        this.gameState = null;
        // Event handlers
        this.eventHandlers = new Map();
        // External callback functions for WebSocket integration
        this.onAIKeyboardInput = null;
        this.onAIActivated = null;
        this.onAIDeactivated = null;
        this.onDifficultyChanged = null;
        // AI updates game state once per second for realistic gameplay
        this.UPDATE_INTERVAL = 1000; // 1 second update cycle
        // Predefined difficulty levels
        this.DIFFICULTIES = {
            easy: {
                name: 'easy',
                reactionTime: 800, // Slower reactions
                accuracy: 0.6, // 60% accuracy
                speed: 0.7, // Slower movement
                predictionDepth: 1 // Basic prediction
            },
            medium: {
                name: 'medium',
                reactionTime: 400, // Medium reactions
                accuracy: 0.8, // 80% accuracy
                speed: 0.9, // Near normal speed
                predictionDepth: 2 // Better prediction
            },
            hard: {
                name: 'hard',
                reactionTime: 200, // Fast reactions
                accuracy: 0.95, // 95% accuracy
                speed: 1.2, // Faster than human
                predictionDepth: 3 // Advanced prediction
            }
        };
        this.difficulty = this.DIFFICULTIES[difficulty];
        console.log(`AI Player initialized with ${difficulty} difficulty`);
    }
    /**
     * Add event listener (replaces EventEmitter functionality)
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }
    /**
     * Remove event listener
     */
    off(event, handler) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    /**
     * Emit event (replaces EventEmitter functionality)
     */
    emit(event, data) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                }
                catch (error) {
                    console.error(`Error in AI event handler for ${event}:`, error);
                }
            });
        }
    }
    /**
     * Activate the AI player
     */
    activate() {
        this.isActive = true;
        this.lastUpdateTime = Date.now();
        console.log(`AI Player activated (${this.difficulty.name} mode)`);
        this.emit('aiActivated', { difficulty: this.difficulty.name });
        // Call external callback if set
        if (this.onAIActivated) {
            this.onAIActivated({ difficulty: this.difficulty.name });
        }
    }
    /**
     * Deactivate the AI player
     */
    deactivate() {
        this.isActive = false;
        this.gameState = null;
        console.log('AI Player deactivated');
        this.emit('aiDeactivated');
        // Call external callback if set
        if (this.onAIDeactivated) {
            this.onAIDeactivated();
        }
    }
    /**
     * Update game state - called from game loop
     * AI processes this ONLY once per second (42 School constraint)
     */
    updateGameState(state) {
        if (!this.isActive || !state.gameActive) {
            return;
        }
        const now = Date.now();
        // Only update AI logic once per second for balanced gameplay
        if (now - this.lastUpdateTime >= this.UPDATE_INTERVAL) {
            this.gameState = { ...state }; // Deep copy to prevent reference issues
            this.lastUpdateTime = now;
            // Add reaction time delay to simulate human-like behavior
            setTimeout(() => {
                if (this.isActive && this.gameState) {
                    this.makeDecision();
                }
            }, this.difficulty.reactionTime);
        }
    }
    /**
     * AI decision making logic
     * Analyzes game state and determines next move
     */
    makeDecision() {
        if (!this.gameState)
            return;
        const paddleCenter = this.gameState.paddleY + (this.gameState.paddleHeight / 2);
        const ballY = this.gameState.ballY;
        const ballX = this.gameState.ballX;
        // Predict where ball will be (based on difficulty)
        let targetY = ballY;
        if (this.difficulty.predictionDepth > 1) {
            // Simple ball trajectory prediction for higher difficulties
            const timeToReachPaddle = Math.abs(ballX - this.gameState.canvasWidth * 0.9) / Math.abs(this.gameState.ballVelX);
            targetY = ballY + (this.gameState.ballVelY * timeToReachPaddle);
            // Handle ball bouncing off top/bottom walls
            const canvasHeight = this.gameState.canvasHeight;
            if (targetY < 0 || targetY > canvasHeight) {
                targetY = targetY < 0 ? -targetY : (2 * canvasHeight - targetY);
            }
        }
        // Add accuracy variation (AI doesn't always move perfectly)
        const accuracyOffset = (Math.random() - 0.5) * (1 - this.difficulty.accuracy) * 100;
        targetY += accuracyOffset;
        // Determine movement based on target position
        let move = 'none';
        const deadZone = 15; // Prevent jittery movement
        if (targetY > paddleCenter + deadZone) {
            move = 'down';
        }
        else if (targetY < paddleCenter - deadZone) {
            move = 'up';
        }
        // Send movement command through event system
        if (move !== 'none') {
            const keyboardEvent = {
                action: move,
                player: 'ai',
                timestamp: Date.now(),
                difficulty: this.difficulty.name
            };
            this.emit('aiKeyboardInput', keyboardEvent);
            // Call external callback if set
            if (this.onAIKeyboardInput) {
                this.onAIKeyboardInput(keyboardEvent);
            }
        }
    }
    /**
     * Change AI difficulty during gameplay
     */
    setDifficulty(level) {
        this.difficulty = this.DIFFICULTIES[level];
        console.log(`AI difficulty changed to ${level}`);
        this.emit('difficultyChanged', { newDifficulty: level });
        // Call external callback if set
        if (this.onDifficultyChanged) {
            this.onDifficultyChanged({ newDifficulty: level });
        }
    }
    /**
     * Get current AI status
     */
    getStatus() {
        return {
            active: this.isActive,
            difficulty: this.difficulty.name,
            lastUpdate: this.lastUpdateTime
        };
    }
    /**
     * Check if AI is currently active
     */
    isAIActive() {
        return this.isActive;
    }
    /**
     * Get current difficulty settings
     */
    getDifficulty() {
        return { ...this.difficulty };
    }
}
exports.AIPlayer = AIPlayer;
