import { AIKeyboardEvent, KeyboardSimulationMetrics } from '../interfaces/GameTypes';

/**
 * AI Player for Pong Game
 * 
 * Implements an AI opponent that can play against human players.
 * Uses event-driven architecture for game state updates and decisions.
 */

export interface GameState {
  ballX: number;
  ballY: number;
  ballVelX: number;
  ballVelY: number;
  paddleY: number;
  paddleHeight: number;
  canvasHeight: number;
  canvasWidth: number;
  opponentPaddleY: number;
  score: { ai: number; human: number };
  gameActive: boolean;
}

export type AIMove = 'up' | 'down' | 'none';

export interface AIDifficulty {
  name: 'easy' | 'medium' | 'hard';
  reactionTime: number;    // milliseconds delay
  accuracy: number;        // 0.0 to 1.0 (how precise movements are)
  speed: number;          // movement speed modifier (0.5 to 1.5)
  predictionDepth: number; // how far ahead AI tries to predict
}

// Event handler type for AI events
export type AIEventHandler = (data: any) => void;

export class AIPlayer {
  private isActive: boolean = false;
  private lastUpdateTime: number = 0;
  private gameState: GameState | null = null;
  private difficulty: AIDifficulty;
  
  // Performance monitoring for 1-second constraint
  private updateCount: number = 0;
  private skippedUpdates: number = 0;
  private averageProcessingTime: number = 0;
  private lastProcessingTime: number = 0;
  
  // Keyboard simulation metrics
  private keyboardMetrics = {
    totalKeyPresses: 0,
    totalHoldTime: 0,
    jitterEvents: 0,
    doubleTaps: 0,
    correctionInputs: 0
  };
  
  // Event handlers
  private eventHandlers: Map<string, AIEventHandler[]> = new Map();
  
  // External callback functions for WebSocket integration
  public onAIKeyboardInput: ((event: AIKeyboardEvent) => void) | null = null;
  public onAIActivated: ((data: { difficulty: string }) => void) | null = null;
  public onAIDeactivated: (() => void) | null = null;
  public onDifficultyChanged: ((data: { newDifficulty: string }) => void) | null = null;
  
  // Precise 1-second constraint implementation
  private readonly UPDATE_INTERVAL = 1000; // Exactly 1 second - critical requirement
  private readonly TIMING_TOLERANCE = 50; // Allow 50ms variance for system load
  
  // Predefined difficulty levels
  private readonly DIFFICULTIES: Record<string, AIDifficulty> = {
    easy: {
      name: 'easy',
      reactionTime: 800,     // Slower reactions
      accuracy: 0.6,         // 60% accuracy
      speed: 0.7,           // Slower movement
      predictionDepth: 1    // Basic prediction
    },
    medium: {
      name: 'medium',
      reactionTime: 400,     // Medium reactions
      accuracy: 0.8,         // 80% accuracy
      speed: 0.9,           // Near normal speed
      predictionDepth: 2    // Better prediction
    },
    hard: {
      name: 'hard',
      reactionTime: 200,     // Fast reactions
      accuracy: 0.95,        // 95% accuracy
      speed: 1.2,           // Faster than human
      predictionDepth: 3    // Advanced prediction
    }
  };

  constructor(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    this.difficulty = this.DIFFICULTIES[difficulty];
    console.log(`AI Player initialized with ${difficulty} difficulty`);
  }

  /**
   * Add event listener (replaces EventEmitter functionality)
   */
  on(event: string, handler: AIEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Remove event listener
   */
  off(event: string, handler: AIEventHandler): void {
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
  private emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in AI event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Activate the AI player
   */
  activate(): void {
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
  deactivate(): void {
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
  updateGameState(state: GameState): void {
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
  private deepCopyGameState(state: GameState): GameState {
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
   * AI decision making logic
   * Analyzes game state and determines next move
   */
  private makeDecision(): void {
    if (!this.gameState) return;
    
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
    let move: AIMove = 'none';
    const deadZone = 15; // Prevent jittery movement
    
    if (targetY > paddleCenter + deadZone) {
      move = 'down';
    } else if (targetY < paddleCenter - deadZone) {
      move = 'up';
    }
    
    // Simulate human-like keyboard input patterns
    this.simulateKeyboardInput(move);
  }

  /**
   * Change AI difficulty during gameplay
   */
  setDifficulty(level: 'easy' | 'medium' | 'hard'): void {
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
  getStatus(): { active: boolean; difficulty: string; lastUpdate: number } {
    return {
      active: this.isActive,
      difficulty: this.difficulty.name,
      lastUpdate: this.lastUpdateTime
    };
  }

  /**
   * Check if AI is currently active
   */
  isAIActive(): boolean {
    return this.isActive;
  }

  /**
   * Get current difficulty settings
   */
  getDifficulty(): AIDifficulty {
    return { ...this.difficulty };
  }

  /**
   * Get performance statistics for monitoring 1-second constraint compliance
   */
  getPerformanceStats(): {
    updateCount: number;
    skippedUpdates: number;
    averageProcessingTime: number;
    lastProcessingTime: number;
    complianceRate: number;
    isCompliant: boolean;
  } {
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
  resetPerformanceStats(): void {
    this.updateCount = 0;
    this.skippedUpdates = 0;
    this.averageProcessingTime = 0;
    this.lastProcessingTime = 0;
    console.log('AI performance statistics reset');
  }

  /**
   * Get keyboard simulation metrics
   */
  getKeyboardMetrics(): KeyboardSimulationMetrics {
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
  resetKeyboardMetrics(): void {
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
  private simulateKeyboardInput(move: AIMove): void {
    if (move === 'none') return;

    // Human-like input characteristics based on difficulty
    const inputCharacteristics = {
      keyHoldTime: this.generateHumanKeyHoldTime(),
      keyPressDelay: this.generateKeyPressDelay(),
      inputJitter: this.generateInputJitter(),
      doubleTapProbability: this.difficulty.name === 'easy' ? 0.15 : 0.05
    };

    // Simulate key press with human-like timing variations
    const simulateKeyPress = () => {
      const keyboardEvent: AIKeyboardEvent = {
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
        const oppositeMove: AIMove = move === 'up' ? 'down' : 'up';
        
        setTimeout(() => {
          const correctionEvent = {
            ...keyboardEvent,
            action: oppositeMove,
            timestamp: Date.now(),
            inputType: 'correction' as const,
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
        inputType: 'press' as const,
        holdDuration: inputCharacteristics.keyHoldTime,
        reactionDelay: inputCharacteristics.keyPressDelay
      };
      
      this.emit('aiKeyboardInput', enhancedKeyboardEvent);
      
      if (this.onAIKeyboardInput) {
        this.onAIKeyboardInput(enhancedKeyboardEvent);
      }

      // Simulate key release after hold time
      setTimeout(() => {
        const releaseEvent: AIKeyboardEvent = {
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
            inputType: 'double_tap' as const
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
  private generateHumanKeyHoldTime(): number {
    const baseTime = this.difficulty.name === 'easy' ? 180 : 
                     this.difficulty.name === 'medium' ? 120 : 80;
    
    // Add realistic variation (±40%)
    const variation = (Math.random() - 0.5) * 0.4;
    return Math.max(50, baseTime + (baseTime * variation));
  }

  /**
   * Generate realistic key press delay
   */
  private generateKeyPressDelay(): number {
    const baseDelay = this.difficulty.reactionTime * 0.1; // 10% of reaction time
    
    // Human-like variation in response timing
    const variation = (Math.random() - 0.5) * 0.6;
    return Math.max(10, baseDelay + (baseDelay * variation));
  }

  /**
   * Calculate input jitter probability based on difficulty
   */
  private generateInputJitter(): number {
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
  forceUpdate(state: GameState): void {
    if (!this.isActive) {
      console.warn('Cannot force update - AI is not active');
      return;
    }
    
    console.warn('FORCED UPDATE - This bypasses the 1-second constraint!');
    this.gameState = this.deepCopyGameState(state);
    this.makeDecision();
  }
}