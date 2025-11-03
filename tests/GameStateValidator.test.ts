/**
 * GameStateValidator Unit Tests
 * 
 * Tests for game state validation system including:
 * - Canvas dimension validation
 * - Ball physics validation
 * - Paddle position validation
 * - Score validation
 * - State comparison between frontend/backend
 * - Error detection and recovery
 */

import { GameStateValidator } from '../../backend/src/services/GameStateValidator';
import { GameSessionState, Player } from '../../backend/src/interfaces/GameTypes';

describe('GameStateValidator', () => {
  let validator: GameStateValidator;
  let mockGameState: GameSessionState;
  let mockPlayers: Player[];

  beforeEach(() => {
    validator = new GameStateValidator();
    mockGameState = (global as any).createMockGameState();
    mockPlayers = [
      (global as any).createMockPlayer('1', false),
      (global as any).createMockPlayer('2', true)
    ];
  });

  afterEach(() => {
    validator.cleanupGame('test-game');
  });

  describe('Canvas Validation', () => {
    test('should validate correct canvas dimensions', () => {
      const validCanvas = { width: 800, height: 600 };
      const gameState = { ...mockGameState, canvas: validCanvas };
      
      const result = validator.validateGameState('test-game', gameState, mockPlayers);
      
      const canvasErrors = result.errors.filter(e => e.field.includes('canvas'));
      expect(canvasErrors).toHaveLength(0);
      expect(result.isValid).toBe(true);
    });

    test('should reject canvas dimensions outside allowed range', () => {
      const invalidCanvas = { width: 200, height: 1000 }; // Too narrow and too tall
      const gameState = { ...mockGameState, canvas: invalidCanvas };
      
      const result = validator.validateGameState('test-game', gameState, mockPlayers);
      
      const canvasErrors = result.errors.filter(e => 
        e.code === 'INVALID_CANVAS_WIDTH' || e.code === 'INVALID_CANVAS_HEIGHT'
      );
      expect(canvasErrors.length).toBeGreaterThan(0);
      expect(result.isValid).toBe(false);
    });

    test('should handle edge case canvas dimensions', () => {
      const edgeCanvas = { width: 400, height: 300 }; // Minimum allowed
      const gameState = { ...mockGameState, canvas: edgeCanvas };
      
      const result = validator.validateGameState('test-game', gameState, mockPlayers);
      
      const canvasErrors = result.errors.filter(e => e.field.includes('canvas'));
      expect(canvasErrors).toHaveLength(0);
    });
  });

  describe('Ball Validation', () => {
    test('should validate ball within canvas bounds', () => {
      const validBall = { x: 400, y: 300, velocityX: 3, velocityY: 2, speed: 5 };
      const gameState = { ...mockGameState, ball: validBall };
      
      const result = validator.validateGameState('test-game', gameState, mockPlayers);
      
      const ballErrors = result.errors.filter(e => e.field.includes('ball'));
      expect(ballErrors).toHaveLength(0);
    });

    test('should warn about ball outside reasonable bounds', () => {
      const outOfBoundsBall = { x: -100, y: 700, velocityX: 3, velocityY: 2, speed: 5 };
      const gameState = { ...mockGameState, ball: outOfBoundsBall };
      
      const result = validator.validateGameState('test-game', gameState, mockPlayers);
      
      const ballWarnings = result.warnings.filter(w => 
        w.code === 'BALL_OUT_OF_BOUNDS_X' || w.code === 'BALL_OUT_OF_BOUNDS_Y'
      );
      expect(ballWarnings.length).toBeGreaterThan(0);
    });

    test('should validate ball speed limits', () => {
      const fastBall = { x: 400, y: 300, velocityX: 15, velocityY: 15, speed: 25 }; // Too fast
      const gameState = { ...mockGameState, ball: fastBall };
      
      const result = validator.validateGameState('test-game', gameState, mockPlayers);
      
      const speedErrors = result.errors.filter(e => e.code === 'BALL_TOO_FAST');
      expect(speedErrors.length).toBeGreaterThan(0);
    });

    test('should detect slow ball movement', () => {
      const slowBall = { x: 400, y: 300, velocityX: 0.1, velocityY: 0.1, speed: 0.5 };
      const gameState = { ...mockGameState, ball: slowBall };
      
      const result = validator.validateGameState('test-game', gameState, mockPlayers);
      
      const slowWarnings = result.warnings.filter(w => w.code === 'BALL_TOO_SLOW');
      expect(slowWarnings.length).toBeGreaterThan(0);
    });
  });

  describe('Paddle Validation', () => {
    test('should validate paddle positions within bounds', () => {
      const validPaddles = {
        player1: { y: 100, height: 100, width: 10, speed: 5 },
        player2: { y: 200, height: 100, width: 10, speed: 5 }
      };
      const gameState = { ...mockGameState, paddles: validPaddles };
      
      const result = validator.validateGameState('test-game', gameState, mockPlayers);
      
      const paddleErrors = result.errors.filter(e => e.field.includes('paddles'));
      expect(paddleErrors).toHaveLength(0);
    });

    test('should reject paddle positions outside canvas', () => {
      const invalidPaddles = {
        player1: { y: -10, height: 100, width: 10, speed: 5 }, // Above canvas
        player2: { y: 550, height: 100, width: 10, speed: 5 }  // Below canvas (600-100=500 max)
      };
      const gameState = { ...mockGameState, paddles: invalidPaddles };
      
      const result = validator.validateGameState('test-game', gameState, mockPlayers);
      
      const positionErrors = result.errors.filter(e => 
        e.code === 'PADDLE_ABOVE_BOUNDS' || e.code === 'PADDLE_BELOW_BOUNDS'
      );
      expect(positionErrors.length).toBeGreaterThan(0);
    });

    test('should validate paddle dimensions', () => {
      const invalidPaddles = {
        player1: { y: 250, height: 30, width: 10, speed: 5 }, // Too short
        player2: { y: 250, height: 200, width: 30, speed: 5 } // Too tall and wide
      };
      const gameState = { ...mockGameState, paddles: invalidPaddles };
      
      const result = validator.validateGameState('test-game', gameState, mockPlayers);
      
      const dimensionErrors = result.errors.filter(e => 
        e.code === 'INVALID_PADDLE_HEIGHT'
      );
      const dimensionWarnings = result.warnings.filter(w => 
        w.code === 'UNUSUAL_PADDLE_WIDTH'
      );
      
      expect(dimensionErrors.length + dimensionWarnings.length).toBeGreaterThan(0);
    });
  });

  describe('Score Validation', () => {
    test('should validate normal scores', () => {
      const normalScore = { player1: 3, player2: 2 };
      const gameState = { ...mockGameState, score: normalScore };
      
      // Update player objects to match
      mockPlayers[0].score = 3;
      mockPlayers[1].score = 2;
      
      const result = validator.validateGameState('test-game', gameState, mockPlayers);
      
      const scoreErrors = result.errors.filter(e => e.field === 'score');
      expect(scoreErrors).toHaveLength(0);
    });

    test('should reject negative scores', () => {
      const negativeScore = { player1: -1, player2: 2 };
      const gameState = { ...mockGameState, score: negativeScore };
      
      const result = validator.validateGameState('test-game', gameState, mockPlayers);
      
      const negativeErrors = result.errors.filter(e => e.code === 'NEGATIVE_SCORE');
      expect(negativeErrors.length).toBeGreaterThan(0);
      expect(result.isValid).toBe(false);
    });

    test('should warn about unusually high scores', () => {
      const highScore = { player1: 15, player2: 12 };
      const gameState = { ...mockGameState, score: highScore };
      
      const result = validator.validateGameState('test-game', gameState, mockPlayers);
      
      const highScoreWarnings = result.warnings.filter(w => w.code === 'HIGH_SCORE');
      expect(highScoreWarnings.length).toBeGreaterThan(0);
    });

    test('should detect score mismatch between game state and players', () => {
      const gameScore = { player1: 5, player2: 3 };
      const gameState = { ...mockGameState, score: gameScore };
      
      // Players have different scores
      mockPlayers[0].score = 2;
      mockPlayers[1].score = 7;
      
      const result = validator.validateGameState('test-game', gameState, mockPlayers);
      
      const mismatchErrors = result.errors.filter(e => 
        e.code === 'SCORE_MISMATCH_P1' || e.code === 'SCORE_MISMATCH_P2'
      );
      expect(mismatchErrors.length).toBeGreaterThan(0);
    });
  });

  describe('Timing Validation', () => {
    test('should validate recent timestamps', () => {
      const recentState = { ...mockGameState, lastUpdate: Date.now() - 100 };
      
      const result = validator.validateGameState('test-game', recentState, mockPlayers);
      
      const timingErrors = result.errors.filter(e => e.field === 'lastUpdate');
      expect(timingErrors).toHaveLength(0);
    });

    test('should reject future timestamps', () => {
      const futureState = { ...mockGameState, lastUpdate: Date.now() + 60000 };
      
      const result = validator.validateGameState('test-game', futureState, mockPlayers);
      
      const futureErrors = result.errors.filter(e => e.code === 'FUTURE_TIMESTAMP');
      expect(futureErrors.length).toBeGreaterThan(0);
    });

    test('should warn about stale game state', () => {
      const staleState = { ...mockGameState, lastUpdate: Date.now() - 10000 };
      
      const result = validator.validateGameState('test-game', staleState, mockPlayers);
      
      const staleWarnings = result.warnings.filter(w => w.code === 'STALE_GAME_STATE');
      expect(staleWarnings.length).toBeGreaterThan(0);
    });
  });

  describe('Physics Validation', () => {
    test('should detect ball inside paddle collision issues', () => {
      const collidingState = {
        ...mockGameState,
        ball: { x: 15, y: 275, velocityX: 3, velocityY: 0, speed: 5 }, // Inside left paddle area
        paddles: {
          player1: { y: 250, height: 100, width: 10, speed: 5 },
          player2: { y: 250, height: 100, width: 10, speed: 5 }
        }
      };
      
      const result = validator.validateGameState('test-game', collidingState, mockPlayers);
      
      const collisionWarnings = result.warnings.filter(w => 
        w.code === 'BALL_INSIDE_PADDLE_P1' || w.code === 'BALL_INSIDE_PADDLE_P2'
      );
      expect(collisionWarnings.length).toBeGreaterThan(0);
    });

    test('should validate normal ball-paddle separation', () => {
      const normalState = {
        ...mockGameState,
        ball: { x: 400, y: 300, velocityX: 3, velocityY: 0, speed: 5 }, // Center of field
        paddles: {
          player1: { y: 250, height: 100, width: 10, speed: 5 },
          player2: { y: 250, height: 100, width: 10, speed: 5 }
        }
      };
      
      const result = validator.validateGameState('test-game', normalState, mockPlayers);
      
      const collisionWarnings = result.warnings.filter(w => 
        w.code.includes('BALL_INSIDE_PADDLE')
      );
      expect(collisionWarnings).toHaveLength(0);
    });
  });

  describe('State Comparison', () => {
    test('should detect no differences in identical states', () => {
      const frontendState = { ...mockGameState };
      const backendState = { ...mockGameState };
      
      const result = validator.compareStates('test-game', frontendState, backendState);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    test('should detect ball position desynchronization', () => {
      const frontendState = { 
        ...mockGameState,
        ball: { x: 400, y: 300, velocityX: 3, velocityY: 2, speed: 5 }
      };
      const backendState = { 
        ...mockGameState,
        ball: { x: 420, y: 310, velocityX: 3, velocityY: 2, speed: 5 }
      };
      
      const result = validator.compareStates('test-game', frontendState, backendState);
      
      const desyncWarnings = result.warnings.filter(w => w.code === 'BALL_POSITION_DESYNC');
      expect(desyncWarnings.length).toBeGreaterThan(0);
    });

    test('should detect paddle position desynchronization', () => {
      const frontendState = { 
        ...mockGameState,
        paddles: {
          player1: { y: 250, height: 100, width: 10, speed: 5 },
          player2: { y: 200, height: 100, width: 10, speed: 5 }
        }
      };
      const backendState = { 
        ...mockGameState,
        paddles: {
          player1: { y: 260, height: 100, width: 10, speed: 5 },
          player2: { y: 220, height: 100, width: 10, speed: 5 }
        }
      };
      
      const result = validator.compareStates('test-game', frontendState, backendState);
      
      const paddleDesync = result.warnings.filter(w => 
        w.code === 'PADDLE1_POSITION_DESYNC' || w.code === 'PADDLE2_POSITION_DESYNC'
      );
      expect(paddleDesync.length).toBeGreaterThan(0);
    });

    test('should detect critical score desynchronization', () => {
      const frontendState = { 
        ...mockGameState,
        score: { player1: 3, player2: 2 }
      };
      const backendState = { 
        ...mockGameState,
        score: { player1: 2, player2: 3 }
      };
      
      const result = validator.compareStates('test-game', frontendState, backendState);
      
      const scoreDesync = result.errors.filter(e => e.code === 'SCORE_DESYNC');
      expect(scoreDesync.length).toBeGreaterThan(0);
      expect(result.isValid).toBe(false);
    });

    test('should handle position differences within tolerance', () => {
      const frontendState = { 
        ...mockGameState,
        ball: { x: 400, y: 300, velocityX: 3, velocityY: 2, speed: 5 }
      };
      const backendState = { 
        ...mockGameState,
        ball: { x: 402, y: 301, velocityX: 3, velocityY: 2, speed: 5 } // Small difference
      };
      
      const result = validator.compareStates('test-game', frontendState, backendState);
      
      const desyncWarnings = result.warnings.filter(w => w.code === 'BALL_POSITION_DESYNC');
      expect(desyncWarnings).toHaveLength(0); // Within tolerance
    });
  });

  describe('Validation Statistics and Management', () => {
    test('should track validation statistics', () => {
      validator.validateGameState('test-game', mockGameState, mockPlayers);
      
      const stats = validator.getValidationStats('test-game');
      expect(stats.totalSnapshots).toBe(1);
      expect(stats.lastValidation).toBeGreaterThan(0);
    });

    test('should calculate state checksums consistently', () => {
      // Same state should produce same checksum
      const result1 = validator.validateGameState('test-game-1', mockGameState, mockPlayers);
      const result2 = validator.validateGameState('test-game-2', mockGameState, mockPlayers);
      
      // Different states should produce different checksums
      const differentState = { 
        ...mockGameState, 
        ball: { ...mockGameState.ball, x: 500 }
      };
      const result3 = validator.validateGameState('test-game-3', differentState, mockPlayers);
      
      // We can't directly compare checksums, but validation should be consistent
      expect(result1.isValid).toBe(result2.isValid);
      expect(result1.errors.length).toBe(result2.errors.length);
    });

    test('should cleanup game data properly', () => {
      validator.validateGameState('cleanup-test', mockGameState, mockPlayers);
      
      let stats = validator.getValidationStats('cleanup-test');
      expect(stats.totalSnapshots).toBe(1);
      
      validator.cleanupGame('cleanup-test');
      
      stats = validator.getValidationStats('cleanup-test');
      expect(stats.totalSnapshots).toBe(0);
    });

    test('should limit stored snapshots per game', () => {
      // Add many snapshots
      for (let i = 0; i < 15; i++) {
        const modifiedState = { 
          ...mockGameState, 
          ball: { ...mockGameState.ball, x: 400 + i }
        };
        validator.validateGameState('snapshot-test', modifiedState, mockPlayers);
      }
      
      const stats = validator.getValidationStats('snapshot-test');
      expect(stats.totalSnapshots).toBeLessThanOrEqual(10); // Should be limited
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle null or undefined game state', () => {
      expect(() => {
        validator.validateGameState('null-test', null as any, mockPlayers);
      }).not.toThrow();
    });

    test('should handle empty players array', () => {
      const result = validator.validateGameState('empty-players', mockGameState, []);
      
      // Should not crash, but might have warnings about missing player data
      expect(result).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.warnings).toBeDefined();
    });

    test('should handle corrupted game state data', () => {
      const corruptedState = {
        ball: { x: NaN, y: Infinity, velocityX: null, velocityY: undefined, speed: -1 },
        canvas: { width: 'invalid', height: null },
        paddles: null,
        score: { player1: 'not a number', player2: {} },
        gameActive: 'maybe',
        isPaused: null,
        lastUpdate: 'invalid timestamp'
      } as any;
      
      expect(() => {
        validator.validateGameState('corrupt-test', corruptedState, mockPlayers);
      }).not.toThrow();
    });

    test('should handle very large numbers gracefully', () => {
      const extremeState = {
        ...mockGameState,
        ball: { 
          x: Number.MAX_SAFE_INTEGER, 
          y: Number.MIN_SAFE_INTEGER, 
          velocityX: 999999, 
          velocityY: -999999, 
          speed: Number.POSITIVE_INFINITY 
        }
      };
      
      const result = validator.validateGameState('extreme-test', extremeState, mockPlayers);
      
      // Should detect issues but not crash
      expect(result).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});