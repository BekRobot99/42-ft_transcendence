import { AIKeyboardEvent } from '../interfaces/GameTypes';

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
    
    // Send movement command through event system
    if (move !== 'none') {
      const keyboardEvent: AIKeyboardEvent = {
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