import { AIKeyboardEvent, KeyboardSimulationMetrics } from '../interfaces/GameTypes';
import { BallPhysicsEngine, BallState, PaddlePhysics, Vector2D } from './BallPhysics';

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
  timestamp?: number; // For game duration tracking
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

  // Physics engine for advanced ball prediction
  private physicsEngine: BallPhysicsEngine;
  
  // Game identification and statistics
  private gameId: string = `ai_game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  private aiSide: 'left' | 'right' = 'right'; // Default to right side
  private stats = {
    gamesPlayed: 0,
    gamesWon: 0,
    averageReactionTime: 0,
    totalPlayTime: 0
  };
  
  // Enhanced performance statistics for scoring integration
  private performanceStats = {
    totalReactions: 0,
    totalReactionTime: 0,
    missedBalls: 0,
    successfulDefenses: 0,
    totalMissDistance: 0
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
  
  // Gameplay balance configuration
  private readonly BALANCE_CONFIG = {
    maxTrajectoryBounces: 3,
    centerBiasWeight: 0.3,
    randomnessIntensity: 0.15,
    momentumSmoothing: 1.2,
    strategicDepth: 0.8
  };
  
  // Carefully tuned difficulty levels for balanced gameplay
  private readonly DIFFICULTIES: Record<string, AIDifficulty> = {
    easy: {
      name: 'easy',
      reactionTime: 650,     // Slightly faster than before for better gameplay
      accuracy: 0.65,        // Improved from 60% to make it less frustrating
      speed: 0.75,          // Slightly faster movement
      predictionDepth: 1    // Still basic prediction only
    },
    medium: {
      name: 'medium',
      reactionTime: 350,     // Faster reactions for challenging gameplay
      accuracy: 0.82,        // Fine-tuned for competitive balance
      speed: 0.95,          // Nearly human-level speed
      predictionDepth: 2    // Good prediction capability
    },
    hard: {
      name: 'hard',
      reactionTime: 180,     // Very fast but not impossible reactions
      accuracy: 0.92,        // Reduced from 95% to be beatable
      speed: 1.15,          // Faster than human but not overwhelming
      predictionDepth: 3    // Full advanced prediction
    }
  };

  constructor(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    this.difficulty = this.DIFFICULTIES[difficulty];
    this.physicsEngine = new BallPhysicsEngine({
      maxSpeed: 8,
      minSpeed: 2,
      speedIncreaseFactor: 1.05,
      wallBounceDamping: 0.98,
      paddleBounceDamping: 1.02
    });
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
   * Enhanced AI decision making logic with advanced ball tracking
   * Analyzes game state, predicts ball trajectory, and determines optimal move
   */
  private makeDecision(): void {
    if (!this.gameState) return;
    
    // Emit thinking start event for visual feedback
    this.emit('thinking_started', {
      gameId: this.gameId,
      timestamp: Date.now(),
      ballPosition: { x: this.gameState.ballX, y: this.gameState.ballY },
      difficulty: this.difficulty.name
    });
    
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
    
    // Emit thinking completion event for visual feedback
    this.emit('thinking_completed', {
      gameId: this.gameId,
      timestamp: Date.now(),
      decision: move,
      targetPosition: targetY,
      confidence: this.calculateDecisionConfidence(targetY, paddleCenter),
      processingTime: Date.now() - this.lastUpdateTime
    });
    
    // Simulate human-like keyboard input patterns
    this.simulateKeyboardInput(move);
  }

  /**
   * Calculate ball trajectory using advanced physics engine
   */
  private calculateBallTrajectory(ballX: number, ballY: number, velX: number, velY: number): {
    interceptY: number;
    timeToIntercept: number;
    bounces: number;
  } {
    const paddleX = this.gameState!.canvasWidth * 0.9; // AI paddle position
    const canvasWidth = this.gameState!.canvasWidth;
    const canvasHeight = this.gameState!.canvasHeight;
    
    // Create ball state for physics engine
    const ballState: BallState = {
      position: { x: ballX, y: ballY },
      velocity: { x: velX, y: velY },
      radius: 7, // Standard ball radius
      lastCollisionTime: Date.now()
    };
    
    // Use physics engine for precise trajectory prediction
    const interceptionPoint = this.physicsEngine.calculateInterceptionPoint(
      ballState, paddleX, canvasWidth, canvasHeight
    );
    
    // Enhanced prediction with physics simulation
    const trajectory = this.physicsEngine.predictTrajectory(ballState, canvasWidth, canvasHeight, 60);
    
    let bounces = 0;
    let interceptY = interceptionPoint.y;
    let timeToIntercept = interceptionPoint.time;
    
    // Count wall bounces in trajectory
    for (let i = 1; i < trajectory.length; i++) {
      const prevY = trajectory[i - 1].y;
      const currY = trajectory[i].y;
      
      // Detect bounce (change in direction near walls)
      if ((prevY <= 10 && currY > 10) || (prevY >= canvasHeight - 10 && currY < canvasHeight - 10)) {
        bounces++;
      }
      
      // Stop if ball reaches paddle area
      if (trajectory[i].x >= paddleX) {
        interceptY = trajectory[i].y;
        timeToIntercept = i * 16.67; // Approximate time based on frame rate
        break;
      }
    }
    
    return {
      interceptY,
      timeToIntercept,
      bounces: Math.min(bounces, this.difficulty.predictionDepth)
    };
  }

  /**
   * Analyze current game situation for strategic decisions
   */
  private analyzeGameSituation(): {
    isWinning: boolean;
    ballDirection: 'incoming' | 'outgoing';
    urgency: 'low' | 'medium' | 'high';
    paddleAdvantage: number; // -1 to 1, where 1 is optimal position
  } {
    const ballVelX = this.gameState!.ballVelX;
    const ballX = this.gameState!.ballX;
    const canvasWidth = this.gameState!.canvasWidth;
    
    const isWinning = (this.gameState!.score.ai || 0) > (this.gameState!.score.human || 0);
    const ballDirection = ballVelX > 0 ? 'incoming' : 'outgoing';
    
    // Calculate urgency based on ball proximity and speed
    const distanceRatio = (canvasWidth - ballX) / canvasWidth;
    const speedFactor = Math.abs(ballVelX) / 5; // Normalize speed
    let urgency: 'low' | 'medium' | 'high' = 'low';
    
    if (ballDirection === 'incoming') {
      if (distanceRatio < 0.3 && speedFactor > 1) urgency = 'high';
      else if (distanceRatio < 0.5) urgency = 'medium';
    }
    
    // Calculate paddle positioning advantage
    const paddleCenter = this.gameState!.paddleY + (this.gameState!.paddleHeight / 2);
    const canvasCenter = this.gameState!.canvasHeight / 2;
    const paddleAdvantage = 1 - (Math.abs(paddleCenter - canvasCenter) / (this.gameState!.canvasHeight / 2));
    
    return { isWinning, ballDirection, urgency, paddleAdvantage };
  }

  /**
   * Apply strategic modifications to target position
   */
  private applyGameStrategy(targetY: number, strategy: any): number {
    let modifiedY = targetY;
    const canvasHeight = this.gameState!.canvasHeight;
    const paddleHeight = this.gameState!.paddleHeight;
    
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
  private applyDifficultyModifiers(targetY: number, currentCenter: number): number {
    // Refined accuracy error scaling for better game balance
    const maxError = (1 - this.difficulty.accuracy) * 60; // Reduced from 80 to 60
    const accuracyError = (Math.random() - 0.5) * maxError;
    
    // Enhanced skill-based targeting adjustments
    let skillModifier = 0;
    
    switch (this.difficulty.name) {
      case 'easy':
        // More frequent sub-optimal positioning, but not completely random
        if (Math.random() < 0.45) {
          const centerBias = (this.gameState!.canvasHeight / 2 - targetY) * 0.4;
          skillModifier = centerBias;
        }
        // Sometimes completely misses timing (represents human errors)
        if (Math.random() < 0.15) {
          skillModifier += (Math.random() - 0.5) * 40;
        }
        break;
        
      case 'medium':
        // Occasional strategic errors
        if (Math.random() < 0.2) {
          skillModifier = (Math.random() - 0.5) * 20;
        }
        break;
        
      case 'hard':
        // Advanced predictive positioning with opponent movement tracking
        const opponentY = this.gameState!.opponentPaddleY;
        const opponentCenter = opponentY + (this.gameState!.paddleHeight / 2);
        const opponentMovement = opponentCenter - (this.gameState!.canvasHeight / 2);
        skillModifier = -opponentMovement * 0.25; // Enhanced counter positioning
        
        // Rare but impactful strategic adjustments
        if (Math.random() < 0.1) {
          skillModifier += (Math.random() - 0.5) * 15;
        }
        break;
    }
    
    return targetY + accuracyError + skillModifier;
  }

  /**
   * Calculate optimal movement direction with enhanced logic
   */
  private calculateOptimalMove(targetY: number, currentCenter: number): AIMove {
    const difference = targetY - currentCenter;
    
    // Fine-tuned movement thresholds for better gameplay balance
    const moveThreshold = this.difficulty.name === 'easy' ? 22 : 
                         this.difficulty.name === 'medium' ? 16 : 10;
    
    // Add momentum consideration for smoother movement
    const momentumFactor = this.difficulty.speed;
    const adjustedThreshold = moveThreshold / momentumFactor;
    
    // Add small randomization to prevent perfect robotic movement
    const randomOffset = (Math.random() - 0.5) * 3;
    const finalThreshold = adjustedThreshold + randomOffset;
    
    if (Math.abs(difference) < finalThreshold) {
      return 'none';
    }
    
    return difference > 0 ? 'down' : 'up';
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
      
      // Emit visual reaction event before keyboard input
      this.emit('ai_reaction', {
        gameId: this.gameId,
        reactionType: move === 'up' ? 'move_up' : 'move_down',
        intensity: 'active',
        reactionTime: inputCharacteristics.keyPressDelay,
        timestamp: Date.now(),
        difficulty: this.difficulty.name
      });
      
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

  /**
   * Handle score updates and adjust AI strategy accordingly
   */
  onScoreUpdate(score: { player1: number; player2: number }): void {
    if (!this.gameState) return;
    
    // Update internal score tracking - convert format
    this.gameState.score = { 
      ai: score.player2,     // AI is typically player 2
      human: score.player1   // Human is typically player 1
    };
    
    // Adjust AI behavior based on score situation
    const aiScore = score.player2; // AI is typically player 2
    const humanScore = score.player1;
    const scoreDiff = aiScore - humanScore;
    
    // Emit strategic adjustment event
    this.emit('score_updated', {
      gameId: this.gameId,
      score: score,
      scoreDifferential: scoreDiff,
      aiPosition: scoreDiff > 0 ? 'winning' : scoreDiff < 0 ? 'losing' : 'tied',
      timestamp: Date.now(),
      strategicAdjustment: this.calculateStrategicAdjustment(scoreDiff)
    });
    
    // Track scoring patterns for performance analysis
    this.stats.gamesPlayed = Math.max(this.stats.gamesPlayed, aiScore + humanScore);
    
    console.log(`[AI ${this.gameId}] Score updated - AI: ${aiScore}, Human: ${humanScore}, Diff: ${scoreDiff}`);
  }

  /**
   * Handle ball scoring events for AI learning and adaptation
   */
  onBallScored(side: 'left' | 'right', gameContext: GameState): void {
    if (!this.gameState) return;
    
    const aiScoredAgainst = (side === 'left' && this.aiSide === 'right') || 
                            (side === 'right' && this.aiSide === 'left');
    
    // Calculate miss analysis for performance improvement
    const missDistance = Math.abs(gameContext.paddleY - gameContext.ballY);
    const reactionQuality = missDistance < 50 ? 'good' : missDistance < 100 ? 'fair' : 'poor';
    
    // Update performance statistics
    if (aiScoredAgainst) {
      this.performanceStats.missedBalls++;
      this.performanceStats.totalMissDistance += missDistance;
    } else {
      this.performanceStats.successfulDefenses++;
    }
    
    // Emit ball scored analysis event
    this.emit('ball_scored_analysis', {
      gameId: this.gameId,
      aiScoredAgainst,
      missDistance,
      reactionQuality,
      ballSpeed: Math.sqrt(gameContext.ballVelX ** 2 + gameContext.ballVelY ** 2),
      paddlePosition: gameContext.paddleY,
      ballPosition: gameContext.ballY,
      difficulty: this.difficulty.name,
      timestamp: Date.now()
    });
    
    console.log(`[AI ${this.gameId}] Ball scored on ${side} side - AI affected: ${aiScoredAgainst}, Reaction: ${reactionQuality}`);
  }

  /**
   * Handle game end events and finalize statistics
   */
  onGameEnd(winner: 'human' | 'ai', finalScore: { player1: number; player2: number }): void {
    const aiWon = winner === 'ai';
    const gameDuration = Date.now() - (this.gameState?.timestamp || Date.now());
    
    // Update final statistics
    this.stats.gamesPlayed++;
    if (aiWon) {
      this.stats.gamesWon++;
    }
    
    // Calculate final performance metrics
    const totalReactions = this.performanceStats.totalReactions;
    const avgReactionTime = totalReactions > 0 ? 
      this.performanceStats.totalReactionTime / totalReactions : 0;
    
    const accuracyRate = this.performanceStats.successfulDefenses / 
      (this.performanceStats.successfulDefenses + this.performanceStats.missedBalls);
    
    // Emit comprehensive game end analysis
    this.emit('game_ended', {
      gameId: this.gameId,
      winner,
      finalScore,
      aiWon,
      gameDuration,
      performance: {
        averageReactionTime: avgReactionTime,
        accuracyRate: isNaN(accuracyRate) ? 0 : accuracyRate,
        totalReactions,
        missedBalls: this.performanceStats.missedBalls,
        successfulDefenses: this.performanceStats.successfulDefenses,
        difficulty: this.difficulty.name
      },
      timestamp: Date.now()
    });
    
    console.log(`[AI ${this.gameId}] Game ended - Winner: ${winner}, AI Performance: ${(accuracyRate * 100).toFixed(1)}% accuracy`);
  }

  /**
   * Calculate strategic adjustments based on score differential
   */
  private calculateStrategicAdjustment(scoreDiff: number): string {
    if (scoreDiff >= 2) return 'defensive'; // AI is winning, play safer
    if (scoreDiff <= -2) return 'aggressive'; // AI is losing, take risks
    if (scoreDiff === 1) return 'maintain'; // Slight lead, maintain advantage
    if (scoreDiff === -1) return 'pressure'; // Slight deficit, apply pressure
    return 'balanced'; // Tied game, balanced play
  }

  /**
   * Calculate AI decision confidence based on position accuracy and game context
   */
  private calculateDecisionConfidence(targetY: number, currentCenter: number): number {
    if (!this.gameState) return 0;
    
    const distance = Math.abs(targetY - currentCenter);
    const maxDistance = this.gameState.canvasHeight;
    const positionConfidence = 1 - (distance / maxDistance);
    
    // Factor in ball speed - slower balls = higher confidence
    const ballSpeed = Math.sqrt(this.gameState.ballVelX ** 2 + this.gameState.ballVelY ** 2);
    const maxSpeed = 10; // Typical max ball speed
    const speedConfidence = Math.max(0, 1 - (ballSpeed / maxSpeed));
    
    // Factor in difficulty - higher difficulty = more confident decisions
    const difficultyConfidence = this.difficulty.accuracy;
    
    // Weighted average of confidence factors
    const overallConfidence = (positionConfidence * 0.4) + 
                             (speedConfidence * 0.3) + 
                             (difficultyConfidence * 0.3);
    
    return Math.min(1, Math.max(0, overallConfidence));
  }
}