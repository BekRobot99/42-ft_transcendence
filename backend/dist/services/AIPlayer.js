"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIPlayer = void 0;
class AIPlayer {
    constructor(difficulty = 'medium') {
        this.isActive = false;
        this.lastUpdateTime = 0;
        this.gameState = null;
        // Performance monitoring for 1-second constraint
        this.updateCount = 0;
        this.skippedUpdates = 0;
        this.averageProcessingTime = 0;
        this.lastProcessingTime = 0;
        // Keyboard simulation metrics
        this.keyboardMetrics = {
            totalKeyPresses: 0,
            totalHoldTime: 0,
            jitterEvents: 0,
            doubleTaps: 0,
            correctionInputs: 0
        };
        // Event handlers
        this.eventHandlers = new Map();
        // External callback functions for WebSocket integration
        this.onAIKeyboardInput = null;
        this.onAIActivated = null;
        this.onAIDeactivated = null;
        this.onDifficultyChanged = null;
        // Precise 1-second constraint implementation
        this.UPDATE_INTERVAL = 1000; // Exactly 1 second - critical requirement
        this.TIMING_TOLERANCE = 50; // Allow 50ms variance for system load
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
     * Implements strict 1-second update constraint with performance monitoring
     */
    updateGameState(state) {
        if (!this.isActive || !state.gameActive) {
            return;
        }
        const now = Date.now();
        const timeSinceLastUpdate = now - this.lastUpdateTime;
        // Strict 1-second enforcement with timing precision
        if (timeSinceLastUpdate >= (this.UPDATE_INTERVAL - this.TIMING_TOLERANCE)) {
            const processingStart = performance.now();
            // Performance monitoring
            if (timeSinceLastUpdate < this.UPDATE_INTERVAL) {
                this.skippedUpdates++;
                console.debug(`AI update skipped - too early by ${this.UPDATE_INTERVAL - timeSinceLastUpdate}ms`);
                return;
            }
            // Update state and timing
            this.gameState = this.deepCopyGameState(state);
            this.lastUpdateTime = now;
            this.updateCount++;
            // Log timing violations for debugging
            if (timeSinceLastUpdate > this.UPDATE_INTERVAL + this.TIMING_TOLERANCE) {
                console.warn(`AI update late by ${timeSinceLastUpdate - this.UPDATE_INTERVAL}ms - system under load?`);
            }
            // Process decision with reaction delay
            setTimeout(() => {
                if (this.isActive && this.gameState) {
                    const decisionStart = performance.now();
                    this.makeDecision();
                    // Track processing performance
                    this.lastProcessingTime = performance.now() - decisionStart;
                    this.averageProcessingTime = (this.averageProcessingTime * (this.updateCount - 1) + this.lastProcessingTime) / this.updateCount;
                }
            }, this.difficulty.reactionTime);
            // Overall processing time tracking
            const processingEnd = performance.now();
            const totalProcessingTime = processingEnd - processingStart;
            if (totalProcessingTime > 100) {
                console.warn(`AI processing took ${totalProcessingTime.toFixed(2)}ms - consider optimization`);
            }
        }
    }
    /**
     * Deep copy game state to prevent reference issues
     */
    deepCopyGameState(state) {
        return {
            ballX: state.ballX,
            ballY: state.ballY,
            ballVelX: state.ballVelX,
            ballVelY: state.ballVelY,
            paddleY: state.paddleY,
            paddleHeight: state.paddleHeight,
            canvasHeight: state.canvasHeight,
            canvasWidth: state.canvasWidth,
            opponentPaddleY: state.opponentPaddleY,
            score: { ...state.score },
            gameActive: state.gameActive
        };
    }
    /**
     * Enhanced AI decision making logic with advanced ball tracking
     * Analyzes game state, predicts ball trajectory, and determines optimal move
     */
    makeDecision() {
        if (!this.gameState)
            return;
        const paddleCenter = this.gameState.paddleY + (this.gameState.paddleHeight / 2);
        const ballY = this.gameState.ballY;
        const ballX = this.gameState.ballX;
        const ballVelX = this.gameState.ballVelX;
        const ballVelY = this.gameState.ballVelY;
        // Enhanced ball trajectory analysis
        const prediction = this.calculateBallTrajectory(ballX, ballY, ballVelX, ballVelY);
        let targetY = prediction.interceptY;
        // Strategic positioning based on game situation
        const gameStrategy = this.analyzeGameSituation();
        targetY = this.applyGameStrategy(targetY, gameStrategy);
        // Apply difficulty-based modifications
        targetY = this.applyDifficultyModifiers(targetY, paddleCenter);
        // Determine movement with enhanced logic
        const move = this.calculateOptimalMove(targetY, paddleCenter);
        // Simulate human-like keyboard input patterns
        this.simulateKeyboardInput(move);
    }
    /**
     * Calculate ball trajectory with multiple bounce predictions
     */
    calculateBallTrajectory(ballX, ballY, velX, velY) {
        const paddleX = this.gameState.canvasWidth * 0.9; // AI paddle position
        const canvasHeight = this.gameState.canvasHeight;
        let currentX = ballX;
        let currentY = ballY;
        let currentVelX = velX;
        let currentVelY = velY;
        let bounces = 0;
        let time = 0;
        // Predict trajectory for up to 3 bounces (based on difficulty)
        const maxBounces = this.difficulty.predictionDepth;
        while (currentX < paddleX && bounces < maxBounces) {
            // Calculate time to reach paddle X or wall collision
            const timeToWall = currentVelY > 0 ?
                (canvasHeight - currentY) / currentVelY :
                -currentY / currentVelY;
            const timeToPaddle = (paddleX - currentX) / currentVelX;
            if (timeToPaddle <= timeToWall) {
                // Ball reaches paddle before hitting wall
                time += timeToPaddle;
                return {
                    interceptY: currentY + (currentVelY * timeToPaddle),
                    timeToIntercept: time,
                    bounces: bounces
                };
            }
            else {
                // Ball hits wall first
                time += timeToWall;
                currentX += currentVelX * timeToWall;
                currentY = currentVelY > 0 ? canvasHeight : 0;
                currentVelY *= -1; // Bounce off wall
                bounces++;
            }
        }
        // Fallback: simple linear prediction
        const timeToReach = Math.abs(paddleX - currentX) / Math.abs(currentVelX);
        return {
            interceptY: currentY + (currentVelY * timeToReach),
            timeToIntercept: time + timeToReach,
            bounces: bounces
        };
    }
    /**
     * Analyze current game situation for strategic decisions
     */
    analyzeGameSituation() {
        const ballVelX = this.gameState.ballVelX;
        const ballX = this.gameState.ballX;
        const canvasWidth = this.gameState.canvasWidth;
        const isWinning = (this.gameState.score.ai || 0) > (this.gameState.score.human || 0);
        const ballDirection = ballVelX > 0 ? 'incoming' : 'outgoing';
        // Calculate urgency based on ball proximity and speed
        const distanceRatio = (canvasWidth - ballX) / canvasWidth;
        const speedFactor = Math.abs(ballVelX) / 5; // Normalize speed
        let urgency = 'low';
        if (ballDirection === 'incoming') {
            if (distanceRatio < 0.3 && speedFactor > 1)
                urgency = 'high';
            else if (distanceRatio < 0.5)
                urgency = 'medium';
        }
        // Calculate paddle positioning advantage
        const paddleCenter = this.gameState.paddleY + (this.gameState.paddleHeight / 2);
        const canvasCenter = this.gameState.canvasHeight / 2;
        const paddleAdvantage = 1 - (Math.abs(paddleCenter - canvasCenter) / (this.gameState.canvasHeight / 2));
        return { isWinning, ballDirection, urgency, paddleAdvantage };
    }
    /**
     * Apply strategic modifications to target position
     */
    applyGameStrategy(targetY, strategy) {
        let modifiedY = targetY;
        const canvasHeight = this.gameState.canvasHeight;
        const paddleHeight = this.gameState.paddleHeight;
        // Defensive strategy: stay closer to center when not urgent
        if (strategy.urgency === 'low' && strategy.ballDirection === 'outgoing') {
            const centerY = canvasHeight / 2;
            const centerWeight = this.difficulty.name === 'easy' ? 0.7 : 0.3;
            modifiedY = (modifiedY * (1 - centerWeight)) + (centerY * centerWeight);
        }
        // Aggressive strategy: optimize for counter-attacks when winning
        if (strategy.isWinning && strategy.ballDirection === 'incoming') {
            // Position slightly off-center to create angled returns
            const angleOffset = (Math.random() - 0.5) * paddleHeight * 0.3;
            modifiedY += angleOffset;
        }
        // Ensure target is within playable bounds
        return Math.max(paddleHeight / 2, Math.min(canvasHeight - paddleHeight / 2, modifiedY));
    }
    /**
     * Apply difficulty-based accuracy and reaction modifiers
     */
    applyDifficultyModifiers(targetY, currentCenter) {
        // Base accuracy error
        const maxError = (1 - this.difficulty.accuracy) * 80;
        const accuracyError = (Math.random() - 0.5) * maxError;
        // Skill-based targeting adjustments
        let skillModifier = 0;
        switch (this.difficulty.name) {
            case 'easy':
                // Sometimes aims for center of paddle instead of optimal position
                if (Math.random() < 0.4) {
                    skillModifier = (this.gameState.canvasHeight / 2 - targetY) * 0.5;
                }
                break;
            case 'hard':
                // Predictive positioning - tries to anticipate player movement
                const opponentY = this.gameState.opponentPaddleY;
                const opponentCenter = opponentY + (this.gameState.paddleHeight / 2);
                const opponentMovement = opponentCenter - (this.gameState.canvasHeight / 2);
                skillModifier = -opponentMovement * 0.2; // Counter opponent positioning
                break;
        }
        return targetY + accuracyError + skillModifier;
    }
    /**
     * Calculate optimal movement direction with enhanced logic
     */
    calculateOptimalMove(targetY, currentCenter) {
        const difference = targetY - currentCenter;
        const moveThreshold = this.difficulty.name === 'easy' ? 25 :
            this.difficulty.name === 'medium' ? 18 : 12;
        // Add momentum consideration for smoother movement
        const momentumFactor = this.difficulty.speed;
        const adjustedThreshold = moveThreshold / momentumFactor;
        if (Math.abs(difference) < adjustedThreshold) {
            return 'none';
        }
        return difference > 0 ? 'down' : 'up';
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
    /**
     * Get performance statistics for monitoring 1-second constraint compliance
     */
    getPerformanceStats() {
        const complianceRate = this.updateCount > 0 ?
            ((this.updateCount - this.skippedUpdates) / this.updateCount) * 100 : 100;
        return {
            updateCount: this.updateCount,
            skippedUpdates: this.skippedUpdates,
            averageProcessingTime: Math.round(this.averageProcessingTime * 100) / 100,
            lastProcessingTime: Math.round(this.lastProcessingTime * 100) / 100,
            complianceRate: Math.round(complianceRate * 100) / 100,
            isCompliant: complianceRate >= 95 // 95% compliance threshold
        };
    }
    /**
     * Reset performance counters
     */
    resetPerformanceStats() {
        this.updateCount = 0;
        this.skippedUpdates = 0;
        this.averageProcessingTime = 0;
        this.lastProcessingTime = 0;
        console.log('AI performance statistics reset');
    }
    /**
     * Get keyboard simulation metrics
     */
    getKeyboardMetrics() {
        const averageHoldTime = this.keyboardMetrics.totalKeyPresses > 0 ?
            this.keyboardMetrics.totalHoldTime / this.keyboardMetrics.totalKeyPresses : 0;
        // Calculate human-likeness score based on various factors
        let humanlikeScore = 100;
        // Reduce score for too perfect patterns
        if (this.keyboardMetrics.jitterEvents === 0 && this.keyboardMetrics.totalKeyPresses > 10) {
            humanlikeScore -= 30; // Too robotic
        }
        // Reduce score for excessive double taps
        const doubleTapRatio = this.keyboardMetrics.totalKeyPresses > 0 ?
            this.keyboardMetrics.doubleTaps / this.keyboardMetrics.totalKeyPresses : 0;
        if (doubleTapRatio > 0.2) {
            humanlikeScore -= 20; // Too many mistakes
        }
        // Bonus for realistic correction patterns
        if (this.keyboardMetrics.correctionInputs > 0) {
            humanlikeScore = Math.min(100, humanlikeScore + 10);
        }
        return {
            totalKeyPresses: this.keyboardMetrics.totalKeyPresses,
            averageHoldTime: Math.round(averageHoldTime * 100) / 100,
            jitterEvents: this.keyboardMetrics.jitterEvents,
            doubleTaps: this.keyboardMetrics.doubleTaps,
            correctionInputs: this.keyboardMetrics.correctionInputs,
            humanlikeScore: Math.max(0, Math.min(100, Math.round(humanlikeScore)))
        };
    }
    /**
     * Reset keyboard simulation metrics
     */
    resetKeyboardMetrics() {
        this.keyboardMetrics = {
            totalKeyPresses: 0,
            totalHoldTime: 0,
            jitterEvents: 0,
            doubleTaps: 0,
            correctionInputs: 0
        };
        console.log('AI keyboard simulation metrics reset');
    }
    /**
     * Simulate realistic keyboard input patterns like a human player
     */
    simulateKeyboardInput(move) {
        if (move === 'none')
            return;
        // Human-like input characteristics based on difficulty
        const inputCharacteristics = {
            keyHoldTime: this.generateHumanKeyHoldTime(),
            keyPressDelay: this.generateKeyPressDelay(),
            inputJitter: this.generateInputJitter(),
            doubleTapProbability: this.difficulty.name === 'easy' ? 0.15 : 0.05
        };
        // Simulate key press with human-like timing variations
        const simulateKeyPress = () => {
            const keyboardEvent = {
                action: move,
                player: 'ai',
                timestamp: Date.now(),
                difficulty: this.difficulty.name
            };
            // Add jitter to make movement less robotic
            if (Math.random() < inputCharacteristics.inputJitter) {
                this.keyboardMetrics.jitterEvents++;
                this.keyboardMetrics.correctionInputs++;
                // Sometimes add a very brief opposite movement (human correction)
                const oppositeMove = move === 'up' ? 'down' : 'up';
                setTimeout(() => {
                    const correctionEvent = {
                        ...keyboardEvent,
                        action: oppositeMove,
                        timestamp: Date.now(),
                        inputType: 'correction',
                        holdDuration: 20
                    };
                    this.emit('aiKeyboardInput', correctionEvent);
                    if (this.onAIKeyboardInput) {
                        this.onAIKeyboardInput(correctionEvent);
                    }
                }, 20); // Brief 20ms correction
            }
            // Track metrics for main input
            this.keyboardMetrics.totalKeyPresses++;
            this.keyboardMetrics.totalHoldTime += inputCharacteristics.keyHoldTime;
            // Main input event with enhanced data
            const enhancedKeyboardEvent = {
                ...keyboardEvent,
                inputType: 'press',
                holdDuration: inputCharacteristics.keyHoldTime,
                reactionDelay: inputCharacteristics.keyPressDelay
            };
            this.emit('aiKeyboardInput', enhancedKeyboardEvent);
            if (this.onAIKeyboardInput) {
                this.onAIKeyboardInput(enhancedKeyboardEvent);
            }
            // Simulate key release after hold time
            setTimeout(() => {
                const releaseEvent = {
                    action: 'none',
                    player: 'ai',
                    timestamp: Date.now(),
                    difficulty: this.difficulty.name
                };
                this.emit('aiKeyboardInput', releaseEvent);
                if (this.onAIKeyboardInput) {
                    this.onAIKeyboardInput(releaseEvent);
                }
            }, inputCharacteristics.keyHoldTime);
            // Sometimes simulate double-tap (especially on easy difficulty)
            if (Math.random() < inputCharacteristics.doubleTapProbability) {
                this.keyboardMetrics.doubleTaps++;
                setTimeout(() => {
                    const doubleTapEvent = {
                        ...keyboardEvent,
                        timestamp: Date.now(),
                        inputType: 'double_tap'
                    };
                    this.emit('aiKeyboardInput', doubleTapEvent);
                    if (this.onAIKeyboardInput) {
                        this.onAIKeyboardInput(doubleTapEvent);
                    }
                }, inputCharacteristics.keyHoldTime + 50);
            }
        };
        // Add random delay before key press (human reaction time variation)
        setTimeout(simulateKeyPress, inputCharacteristics.keyPressDelay);
    }
    /**
     * Generate human-like key hold duration
     */
    generateHumanKeyHoldTime() {
        const baseTime = this.difficulty.name === 'easy' ? 180 :
            this.difficulty.name === 'medium' ? 120 : 80;
        // Add realistic variation (±40%)
        const variation = (Math.random() - 0.5) * 0.4;
        return Math.max(50, baseTime + (baseTime * variation));
    }
    /**
     * Generate realistic key press delay
     */
    generateKeyPressDelay() {
        const baseDelay = this.difficulty.reactionTime * 0.1; // 10% of reaction time
        // Human-like variation in response timing
        const variation = (Math.random() - 0.5) * 0.6;
        return Math.max(10, baseDelay + (baseDelay * variation));
    }
    /**
     * Calculate input jitter probability based on difficulty
     */
    generateInputJitter() {
        switch (this.difficulty.name) {
            case 'easy': return 0.25; // 25% chance of jittery input
            case 'medium': return 0.15; // 15% chance
            case 'hard': return 0.08; // 8% chance (more precise)
            default: return 0.15;
        }
    }
    /**
     * Force immediate AI update (for testing purposes only)
     */
    forceUpdate(state) {
        if (!this.isActive) {
            console.warn('Cannot force update - AI is not active');
            return;
        }
        console.warn('FORCED UPDATE - This bypasses the 1-second constraint!');
        this.gameState = this.deepCopyGameState(state);
        this.makeDecision();
    }
}
exports.AIPlayer = AIPlayer;
