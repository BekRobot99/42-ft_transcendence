/**
 * Game State Validator Service
 * 
 * Provides comprehensive validation and synchronization for game states
 * between frontend and backend to ensure consistency and prevent cheating
 */

import { GameSessionState, Player } from '../interfaces/GameTypes';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  correctedState?: any;
}

export interface ValidationError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  field: string;
  expectedValue?: any;
  actualValue?: any;
}

export interface ValidationWarning {
  code: string;
  message: string;
  field: string;
  suggestion?: string;
}

export interface GameStateSnapshot {
  timestamp: number;
  gameId: string;
  state: GameSessionState;
  players: Player[];
  checksum: string;
  source: 'frontend' | 'backend';
}

export class GameStateValidator {
  private readonly CANVAS_MIN_WIDTH = 400;
  private readonly CANVAS_MAX_WIDTH = 1200;
  private readonly CANVAS_MIN_HEIGHT = 300;
  private readonly CANVAS_MAX_HEIGHT = 800;
  
  private readonly PADDLE_MIN_HEIGHT = 50;
  private readonly PADDLE_MAX_HEIGHT = 150;
  private readonly PADDLE_MIN_WIDTH = 8;
  private readonly PADDLE_MAX_WIDTH = 20;
  
  private readonly BALL_MIN_RADIUS = 5;
  private readonly BALL_MAX_RADIUS = 15;
  private readonly BALL_MIN_SPEED = 1;
  private readonly BALL_MAX_SPEED = 20;
  
  private readonly MAX_SCORE = 11; // Standard Pong winning score
  private readonly POSITION_TOLERANCE = 5; // Pixels tolerance for position validation
  
  private stateSnapshots: Map<string, GameStateSnapshot[]> = new Map();
  private readonly MAX_SNAPSHOTS = 10; // Keep last 10 snapshots per game

  /**
   * Validate complete game state
   */
  validateGameState(gameId: string, state: GameSessionState, players: Player[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Validate canvas dimensions
    const canvasValidation = this.validateCanvas(state.canvas);
    errors.push(...canvasValidation.errors);
    warnings.push(...canvasValidation.warnings);
    
    // Validate ball state
    const ballValidation = this.validateBall(state.ball, state.canvas);
    errors.push(...ballValidation.errors);
    warnings.push(...ballValidation.warnings);
    
    // Validate paddles
    const paddleValidation = this.validatePaddles(state.paddles, state.canvas);
    errors.push(...paddleValidation.errors);
    warnings.push(...paddleValidation.warnings);
    
    // Validate scores
    const scoreValidation = this.validateScores(state.score, players);
    errors.push(...scoreValidation.errors);
    warnings.push(...scoreValidation.warnings);
    
    // Validate game timing
    const timingValidation = this.validateTiming(state);
    errors.push(...timingValidation.errors);
    warnings.push(...timingValidation.warnings);
    
    // Check for physics consistency
    const physicsValidation = this.validatePhysics(state);
    errors.push(...physicsValidation.errors);
    warnings.push(...physicsValidation.warnings);

    const result: ValidationResult = {
      isValid: errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
      errors,
      warnings
    };
    
    // Store snapshot for future validation
    this.storeStateSnapshot(gameId, state, players, 'backend');
    
    return result;
  }

  /**
   * Validate canvas dimensions and properties
   */
  private validateCanvas(canvas: { width: number; height: number }): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    if (canvas.width < this.CANVAS_MIN_WIDTH || canvas.width > this.CANVAS_MAX_WIDTH) {
      errors.push({
        code: 'INVALID_CANVAS_WIDTH',
        message: `Canvas width ${canvas.width} is outside allowed range ${this.CANVAS_MIN_WIDTH}-${this.CANVAS_MAX_WIDTH}`,
        severity: 'high',
        field: 'canvas.width',
        expectedValue: `${this.CANVAS_MIN_WIDTH}-${this.CANVAS_MAX_WIDTH}`,
        actualValue: canvas.width
      });
    }
    
    if (canvas.height < this.CANVAS_MIN_HEIGHT || canvas.height > this.CANVAS_MAX_HEIGHT) {
      errors.push({
        code: 'INVALID_CANVAS_HEIGHT',
        message: `Canvas height ${canvas.height} is outside allowed range ${this.CANVAS_MIN_HEIGHT}-${this.CANVAS_MAX_HEIGHT}`,
        severity: 'high',
        field: 'canvas.height',
        expectedValue: `${this.CANVAS_MIN_HEIGHT}-${this.CANVAS_MAX_HEIGHT}`,
        actualValue: canvas.height
      });
    }
    
    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate ball position, velocity, and properties
   */
  private validateBall(ball: any, canvas: { width: number; height: number }): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Check ball position bounds
    if (ball.x < -50 || ball.x > canvas.width + 50) {
      warnings.push({
        code: 'BALL_OUT_OF_BOUNDS_X',
        message: `Ball X position ${ball.x} is outside reasonable bounds`,
        field: 'ball.x',
        suggestion: 'Ball may need to be reset to center'
      });
    }
    
    if (ball.y < -50 || ball.y > canvas.height + 50) {
      warnings.push({
        code: 'BALL_OUT_OF_BOUNDS_Y',
        message: `Ball Y position ${ball.y} is outside reasonable bounds`,
        field: 'ball.y',
        suggestion: 'Ball may need to be reset to center'
      });
    }
    
    // Check ball velocity
    const ballSpeed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2);
    if (ballSpeed < this.BALL_MIN_SPEED) {
      warnings.push({
        code: 'BALL_TOO_SLOW',
        message: `Ball speed ${ballSpeed.toFixed(2)} is below minimum ${this.BALL_MIN_SPEED}`,
        field: 'ball.speed',
        suggestion: 'Ball may be stuck or need speed boost'
      });
    }
    
    if (ballSpeed > this.BALL_MAX_SPEED) {
      errors.push({
        code: 'BALL_TOO_FAST',
        message: `Ball speed ${ballSpeed.toFixed(2)} exceeds maximum ${this.BALL_MAX_SPEED}`,
        severity: 'medium',
        field: 'ball.speed',
        expectedValue: `<= ${this.BALL_MAX_SPEED}`,
        actualValue: ballSpeed
      });
    }
    
    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate paddle positions and properties
   */
  private validatePaddles(paddles: any, canvas: { width: number; height: number }): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    ['player1', 'player2'].forEach(playerKey => {
      const paddle = paddles[playerKey];
      
      // Check paddle position bounds
      if (paddle.y < 0) {
        errors.push({
          code: 'PADDLE_ABOVE_BOUNDS',
          message: `${playerKey} paddle Y position ${paddle.y} is above canvas`,
          severity: 'medium',
          field: `paddles.${playerKey}.y`,
          expectedValue: '>= 0',
          actualValue: paddle.y
        });
      }
      
      if (paddle.y + paddle.height > canvas.height) {
        errors.push({
          code: 'PADDLE_BELOW_BOUNDS',
          message: `${playerKey} paddle extends below canvas (y: ${paddle.y}, height: ${paddle.height})`,
          severity: 'medium',
          field: `paddles.${playerKey}.y`,
          expectedValue: `<= ${canvas.height - paddle.height}`,
          actualValue: paddle.y
        });
      }
      
      // Check paddle dimensions
      if (paddle.height < this.PADDLE_MIN_HEIGHT || paddle.height > this.PADDLE_MAX_HEIGHT) {
        errors.push({
          code: 'INVALID_PADDLE_HEIGHT',
          message: `${playerKey} paddle height ${paddle.height} is outside allowed range`,
          severity: 'high',
          field: `paddles.${playerKey}.height`,
          expectedValue: `${this.PADDLE_MIN_HEIGHT}-${this.PADDLE_MAX_HEIGHT}`,
          actualValue: paddle.height
        });
      }
      
      if (paddle.width && (paddle.width < this.PADDLE_MIN_WIDTH || paddle.width > this.PADDLE_MAX_WIDTH)) {
        warnings.push({
          code: 'UNUSUAL_PADDLE_WIDTH',
          message: `${playerKey} paddle width ${paddle.width} is outside typical range`,
          field: `paddles.${playerKey}.width`,
          suggestion: `Consider width between ${this.PADDLE_MIN_WIDTH}-${this.PADDLE_MAX_WIDTH}`
        });
      }
    });
    
    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate game scores
   */
  private validateScores(score: { player1: number; player2: number }, players: Player[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Check score values
    if (score.player1 < 0 || score.player2 < 0) {
      errors.push({
        code: 'NEGATIVE_SCORE',
        message: 'Scores cannot be negative',
        severity: 'critical',
        field: 'score',
        expectedValue: '>= 0',
        actualValue: `player1: ${score.player1}, player2: ${score.player2}`
      });
    }
    
    if (score.player1 > this.MAX_SCORE || score.player2 > this.MAX_SCORE) {
      warnings.push({
        code: 'HIGH_SCORE',
        message: `Score exceeds typical maximum of ${this.MAX_SCORE}`,
        field: 'score',
        suggestion: 'Game may have ended'
      });
    }
    
    // Check score consistency with player objects
    if (players.length >= 2) {
      if (players[0].score !== score.player1) {
        errors.push({
          code: 'SCORE_MISMATCH_P1',
          message: 'Player 1 score mismatch between game state and player object',
          severity: 'high',
          field: 'score.player1',
          expectedValue: players[0].score,
          actualValue: score.player1
        });
      }
      
      if (players[1].score !== score.player2) {
        errors.push({
          code: 'SCORE_MISMATCH_P2',
          message: 'Player 2 score mismatch between game state and player object',
          severity: 'high',
          field: 'score.player2',
          expectedValue: players[1].score,
          actualValue: score.player2
        });
      }
    }
    
    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate game timing and update consistency
   */
  private validateTiming(state: GameSessionState): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const now = Date.now();
    
    // Check last update timestamp
    if (state.lastUpdate > now) {
      errors.push({
        code: 'FUTURE_TIMESTAMP',
        message: 'Game state has future timestamp',
        severity: 'high',
        field: 'lastUpdate',
        expectedValue: `<= ${now}`,
        actualValue: state.lastUpdate
      });
    }
    
    const timeSinceUpdate = now - state.lastUpdate;
    if (timeSinceUpdate > 5000) { // 5 seconds
      warnings.push({
        code: 'STALE_GAME_STATE',
        message: `Game state is ${timeSinceUpdate}ms old`,
        field: 'lastUpdate',
        suggestion: 'Game state may need refresh'
      });
    }
    
    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate physics consistency
   */
  private validatePhysics(state: GameSessionState): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Check for impossible ball-paddle collision scenarios
    const ball = state.ball;
    const paddles = state.paddles;
    
    // Ball inside paddle detection
    const player1PaddleX = 10; // Typical left paddle X
    const player2PaddleX = state.canvas.width - 20; // Typical right paddle X
    
    if (ball.x >= player1PaddleX && ball.x <= player1PaddleX + 10 &&
        ball.y >= paddles.player1.y && ball.y <= paddles.player1.y + paddles.player1.height) {
      warnings.push({
        code: 'BALL_INSIDE_PADDLE_P1',
        message: 'Ball appears to be inside player 1 paddle',
        field: 'ball.position',
        suggestion: 'Check collision detection'
      });
    }
    
    if (ball.x >= player2PaddleX - 10 && ball.x <= player2PaddleX &&
        ball.y >= paddles.player2.y && ball.y <= paddles.player2.y + paddles.player2.height) {
      warnings.push({
        code: 'BALL_INSIDE_PADDLE_P2',
        message: 'Ball appears to be inside player 2 paddle',
        field: 'ball.position',
        suggestion: 'Check collision detection'
      });
    }
    
    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Store state snapshot for validation history
   */
  private storeStateSnapshot(gameId: string, state: GameSessionState, players: Player[], source: 'frontend' | 'backend'): void {
    if (!this.stateSnapshots.has(gameId)) {
      this.stateSnapshots.set(gameId, []);
    }
    
    const snapshots = this.stateSnapshots.get(gameId)!;
    const checksum = this.calculateStateChecksum(state);
    
    const snapshot: GameStateSnapshot = {
      timestamp: Date.now(),
      gameId,
      state: { ...state },
      players: [...players],
      checksum,
      source
    };
    
    snapshots.push(snapshot);
    
    // Keep only recent snapshots
    if (snapshots.length > this.MAX_SNAPSHOTS) {
      snapshots.shift();
    }
  }

  /**
   * Calculate checksum for state validation
   */
  private calculateStateChecksum(state: GameSessionState): string {
    const stateString = JSON.stringify({
      ball: state.ball,
      paddles: state.paddles,
      score: state.score,
      gameActive: state.gameActive
    });
    
    // Simple checksum calculation
    let hash = 0;
    for (let i = 0; i < stateString.length; i++) {
      const char = stateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(16);
  }

  /**
   * Compare frontend and backend states for synchronization
   */
  compareStates(gameId: string, frontendState: GameSessionState, backendState: GameSessionState): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Compare ball positions
    const ballPosDiff = Math.sqrt(
      Math.pow(frontendState.ball.x - backendState.ball.x, 2) +
      Math.pow(frontendState.ball.y - backendState.ball.y, 2)
    );
    
    if (ballPosDiff > this.POSITION_TOLERANCE) {
      warnings.push({
        code: 'BALL_POSITION_DESYNC',
        message: `Ball position difference: ${ballPosDiff.toFixed(2)} pixels`,
        field: 'ball.position',
        suggestion: 'Frontend may need position correction'
      });
    }
    
    // Compare paddle positions
    const paddle1Diff = Math.abs(frontendState.paddles.player1.y - backendState.paddles.player1.y);
    const paddle2Diff = Math.abs(frontendState.paddles.player2.y - backendState.paddles.player2.y);
    
    if (paddle1Diff > this.POSITION_TOLERANCE) {
      warnings.push({
        code: 'PADDLE1_POSITION_DESYNC',
        message: `Player 1 paddle position difference: ${paddle1Diff.toFixed(2)} pixels`,
        field: 'paddles.player1.y',
        suggestion: 'Sync paddle position'
      });
    }
    
    if (paddle2Diff > this.POSITION_TOLERANCE) {
      warnings.push({
        code: 'PADDLE2_POSITION_DESYNC',
        message: `Player 2 paddle position difference: ${paddle2Diff.toFixed(2)} pixels`,
        field: 'paddles.player2.y',
        suggestion: 'Sync paddle position'
      });
    }
    
    // Compare scores
    if (frontendState.score.player1 !== backendState.score.player1 ||
        frontendState.score.player2 !== backendState.score.player2) {
      errors.push({
        code: 'SCORE_DESYNC',
        message: 'Score mismatch between frontend and backend',
        severity: 'critical',
        field: 'score',
        expectedValue: backendState.score,
        actualValue: frontendState.score
      });
    }
    
    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Get validation statistics for a game
   */
  getValidationStats(gameId: string): { totalSnapshots: number; lastValidation: number; issues: number } {
    const snapshots = this.stateSnapshots.get(gameId) || [];
    const lastSnapshot = snapshots[snapshots.length - 1];
    
    return {
      totalSnapshots: snapshots.length,
      lastValidation: lastSnapshot?.timestamp || 0,
      issues: 0 // Could be calculated from stored validation results
    };
  }

  /**
   * Clean up validation data for ended games
   */
  cleanupGame(gameId: string): void {
    this.stateSnapshots.delete(gameId);
  }
}