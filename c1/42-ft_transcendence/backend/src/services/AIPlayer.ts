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
  
  // Event handlers
  private eventHandlers: Map<string, AIEventHandler[]> = new Map();
  
  // AI updates game state once per second for realistic gameplay
  private readonly UPDATE_INTERVAL = 1000; // 1 second update cycle
  
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
  }

  /**
   * Deactivate the AI player
   */
  deactivate(): void {
    this.isActive = false;
    this.gameState = null;
    console.log('AI Player deactivated');
    this.emit('aiDeactivated');
  }

  /**
   * Update game state - called from game loop
   * AI processes this ONLY once per second (42 School constraint)
   */
  updateGameState(state: GameState): void {
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
      this.emit('aiKeyboardInput', {
        action: move,
        player: 'ai',
        timestamp: Date.now(),
        difficulty: this.difficulty.name
      });
    }
  }

  /**
   * Change AI difficulty during gameplay
   */
  setDifficulty(level: 'easy' | 'medium' | 'hard'): void {
    this.difficulty = this.DIFFICULTIES[level];
    console.log(`AI difficulty changed to ${level}`);
    this.emit('difficultyChanged', { newDifficulty: level });
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
}