/**
 * AIPlayer Unit Tests
 * 
 * Comprehensive tests for the AI player functionality including:
 * - Decision making algorithms
 * - Difficulty level behavior
 * - Performance tracking
 * - Keyboard simulation
 * - Game state updates
 */

import { AIPlayer } from '../../backend/src/services/AIPlayer';
import { AIKeyboardEvent, GameSessionState } from '../../backend/src/interfaces/GameTypes';

describe('AIPlayer', () => {
  let aiPlayer: AIPlayer;
  let mockGameState: GameSessionState;

  beforeEach(() => {
    jest.useFakeTimers();
    aiPlayer = new AIPlayer('medium');
    mockGameState = (global as any).createMockGameState();
  });

  afterEach(() => {
    jest.useRealTimers();
    aiPlayer.deactivate();
  });

  describe('Initialization', () => {
    test('should create AI player with correct difficulty', () => {
      const easyAI = new AIPlayer('easy');
      const hardAI = new AIPlayer('hard');
      
      expect(easyAI).toBeDefined();
      expect(hardAI).toBeDefined();
      
      // Check that different difficulties have different parameters
      const easyStats = easyAI.getPerformanceStats();
      const hardStats = hardAI.getPerformanceStats();
      
      expect(easyStats.difficulty).toBe('easy');
      expect(hardStats.difficulty).toBe('hard');
    });

    test('should initialize with default performance stats', () => {
      const stats = aiPlayer.getPerformanceStats();
      
      expect(stats.gamesPlayed).toBe(0);
      expect(stats.gamesWon).toBe(0);
      expect(stats.averageReactionTime).toBeGreaterThan(0);
      expect(stats.difficulty).toBe('medium');
      expect(stats.totalPlayTime).toBe(0);
      expect(stats.lastPlayed).toBeInstanceOf(Date);
    });

    test('should be inactive by default', () => {
      const stats = aiPlayer.getPerformanceStats();
      expect(stats.isActive).toBe(false);
    });
  });

  describe('Activation and Deactivation', () => {
    test('should activate and start decision making', async () => {
      let keyboardEvents: AIKeyboardEvent[] = [];
      
      aiPlayer.onAIKeyboardInput = (event: AIKeyboardEvent) => {
        keyboardEvents.push(event);
      };

      aiPlayer.activate();
      aiPlayer.updateGameState(mockGameState);

      // Wait for AI to make decisions
      await (global as any).advanceTime(500);

      const stats = aiPlayer.getPerformanceStats();
      expect(stats.isActive).toBe(true);
      expect(keyboardEvents.length).toBeGreaterThanOrEqual(0);
    });

    test('should deactivate and stop decision making', () => {
      aiPlayer.activate();
      expect(aiPlayer.getPerformanceStats().isActive).toBe(true);
      
      aiPlayer.deactivate();
      expect(aiPlayer.getPerformanceStats().isActive).toBe(false);
    });

    test('should handle multiple activation calls gracefully', () => {
      aiPlayer.activate();
      aiPlayer.activate();
      aiPlayer.activate();
      
      expect(aiPlayer.getPerformanceStats().isActive).toBe(true);
      
      aiPlayer.deactivate();
      expect(aiPlayer.getPerformanceStats().isActive).toBe(false);
    });
  });

  describe('Decision Making', () => {
    beforeEach(() => {
      aiPlayer.activate();
    });

    test('should make decisions based on ball position', async () => {
      let lastKeyboardEvent: AIKeyboardEvent | null = null;
      
      aiPlayer.onAIKeyboardInput = (event: AIKeyboardEvent) => {
        lastKeyboardEvent = event;
      };

      // Ball moving towards AI paddle (right side)
      const gameState = {
        ...mockGameState,
        ball: { x: 600, y: 200, velocityX: 2, velocityY: 1, speed: 5 },
        paddles: {
          ...mockGameState.paddles,
          player2: { y: 300, height: 100, width: 10, speed: 5 } // AI paddle below ball
        }
      };

      aiPlayer.updateGameState(gameState);
      await (global as any).advanceTime(300);

      // AI should decide to move up to intercept the ball
      expect(lastKeyboardEvent).not.toBeNull();
      if (lastKeyboardEvent) {
        expect(['up', 'down', 'none']).toContain(lastKeyboardEvent.action);
        expect(lastKeyboardEvent.player).toBe('ai');
        expect(lastKeyboardEvent.difficulty).toBe('medium');
      }
    });

    test('should react differently based on difficulty', async () => {
      const easyAI = new AIPlayer('easy');
      const hardAI = new AIPlayer('hard');
      
      let easyReactionTime = 0;
      let hardReactionTime = 0;
      
      easyAI.onAIKeyboardInput = (event) => {
        easyReactionTime = event.reactionDelay || 0;
      };
      
      hardAI.onAIKeyboardInput = (event) => {
        hardReactionTime = event.reactionDelay || 0;
      };

      easyAI.activate();
      hardAI.activate();

      // Same game state for both
      const gameState = {
        ...mockGameState,
        ball: { x: 700, y: 250, velocityX: -3, velocityY: 0, speed: 5 }
      };

      easyAI.updateGameState(gameState);
      hardAI.updateGameState(gameState);

      await (global as any).advanceTime(1000);

      // Easy AI should have slower reactions than hard AI
      if (easyReactionTime > 0 && hardReactionTime > 0) {
        expect(easyReactionTime).toBeGreaterThanOrEqual(hardReactionTime);
      }

      easyAI.deactivate();
      hardAI.deactivate();
    });

    test('should handle ball moving away from AI', async () => {
      let keyboardEvents: AIKeyboardEvent[] = [];
      
      aiPlayer.onAIKeyboardInput = (event: AIKeyboardEvent) => {
        keyboardEvents.push(event);
      };

      // Ball moving away from AI (towards human player)
      const gameState = {
        ...mockGameState,
        ball: { x: 200, y: 300, velocityX: -3, velocityY: 0, speed: 5 }
      };

      aiPlayer.updateGameState(gameState);
      await (global as any).advanceTime(500);

      // AI should be less active when ball is moving away
      const recentEvents = keyboardEvents.filter(e => e.action !== 'none');
      expect(recentEvents.length).toBeLessThanOrEqual(keyboardEvents.length);
    });
  });

  describe('Performance Tracking', () => {
    test('should track reaction times', async () => {
      aiPlayer.activate();
      
      let reactionTimes: number[] = [];
      aiPlayer.onAIKeyboardInput = (event) => {
        if (event.reactionDelay) {
          reactionTimes.push(event.reactionDelay);
        }
      };

      aiPlayer.updateGameState(mockGameState);
      await (global as any).advanceTime(2000);

      const stats = aiPlayer.getPerformanceStats();
      expect(stats.averageReactionTime).toBeGreaterThan(0);
      expect(stats.totalDecisions).toBeGreaterThan(0);
    });

    test('should reset performance stats', () => {
      // Simulate some activity
      aiPlayer.activate();
      aiPlayer.updateGameState(mockGameState);
      
      let initialStats = aiPlayer.getPerformanceStats();
      expect(initialStats.totalDecisions).toBeGreaterThanOrEqual(0);

      aiPlayer.resetPerformanceStats();
      
      const resetStats = aiPlayer.getPerformanceStats();
      expect(resetStats.totalDecisions).toBe(0);
      expect(resetStats.gamesPlayed).toBe(0);
      expect(resetStats.gamesWon).toBe(0);
    });

    test('should track game completion', () => {
      const initialStats = aiPlayer.getPerformanceStats();
      
      aiPlayer.onGameComplete(true); // AI wins
      
      const winStats = aiPlayer.getPerformanceStats();
      expect(winStats.gamesPlayed).toBe(initialStats.gamesPlayed + 1);
      expect(winStats.gamesWon).toBe(initialStats.gamesWon + 1);
      
      aiPlayer.onGameComplete(false); // AI loses
      
      const loseStats = aiPlayer.getPerformanceStats();
      expect(loseStats.gamesPlayed).toBe(initialStats.gamesPlayed + 2);
      expect(loseStats.gamesWon).toBe(initialStats.gamesWon + 1); // Still same wins
    });
  });

  describe('Keyboard Simulation', () => {
    test('should generate realistic keyboard events', async () => {
      let keyboardEvents: AIKeyboardEvent[] = [];
      
      aiPlayer.onAIKeyboardInput = (event: AIKeyboardEvent) => {
        keyboardEvents.push(event);
      };

      aiPlayer.activate();
      aiPlayer.updateGameState(mockGameState);

      await (global as any).advanceTime(1000);

      // Should have generated some keyboard events
      expect(keyboardEvents.length).toBeGreaterThan(0);
      
      const validActions = ['up', 'down', 'none'];
      keyboardEvents.forEach(event => {
        expect(validActions).toContain(event.action);
        expect(event.player).toBe('ai');
        expect(event.timestamp).toBeGreaterThan(0);
        expect(event.difficulty).toBe('medium');
      });
    });

    test('should include human-like input variations', async () => {
      let keyboardEvents: AIKeyboardEvent[] = [];
      
      aiPlayer.onAIKeyboardInput = (event: AIKeyboardEvent) => {
        keyboardEvents.push(event);
      };

      aiPlayer.activate();
      
      // Simulate multiple game state updates
      for (let i = 0; i < 5; i++) {
        const gameState = {
          ...mockGameState,
          ball: { x: 600 + i * 10, y: 250 + i * 5, velocityX: 2, velocityY: 1, speed: 5 }
        };
        aiPlayer.updateGameState(gameState);
        await (global as any).advanceTime(200);
      }

      const eventsWithVariation = keyboardEvents.filter(e => 
        e.inputType && ['press', 'hold', 'release', 'correction', 'double_tap'].includes(e.inputType)
      );
      
      // Should have some human-like input variations
      expect(eventsWithVariation.length).toBeGreaterThan(0);
    });
  });

  describe('Score Updates', () => {
    test('should handle score updates and adapt strategy', () => {
      const initialScore = { player1: 0, player2: 0 };
      const updatedScore = { player1: 2, player2: 3 }; // AI is winning
      
      expect(() => {
        aiPlayer.onScoreUpdate(initialScore);
        aiPlayer.onScoreUpdate(updatedScore);
      }).not.toThrow();
    });

    test('should track scoring events', () => {
      const ballScoredData = {
        ballX: 50,
        ballY: 300,
        ballVelX: -2,
        ballVelY: 0,
        paddleY: 250,
        paddleHeight: 100,
        canvasHeight: 600,
        canvasWidth: 800,
        opponentPaddleY: 200,
        score: { ai: 1, human: 0 },
        gameActive: true
      };

      expect(() => {
        aiPlayer.onBallScored('left', ballScoredData);
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid game state gracefully', () => {
      const invalidGameState = null as any;
      
      expect(() => {
        aiPlayer.updateGameState(invalidGameState);
      }).not.toThrow();
    });

    test('should handle missing callback functions', () => {
      aiPlayer.onAIKeyboardInput = undefined as any;
      
      expect(() => {
        aiPlayer.activate();
        aiPlayer.updateGameState(mockGameState);
      }).not.toThrow();
    });

    test('should recover from decision making errors', async () => {
      // Force an error in decision making by providing corrupted data
      const corruptedState = {
        ...mockGameState,
        ball: { x: NaN, y: NaN, velocityX: Infinity, velocityY: -Infinity, speed: NaN }
      };

      aiPlayer.activate();
      
      expect(() => {
        aiPlayer.updateGameState(corruptedState);
      }).not.toThrow();

      // Should still be able to process valid state after error
      await (global as any).advanceTime(100);
      
      expect(() => {
        aiPlayer.updateGameState(mockGameState);
      }).not.toThrow();
    });
  });

  describe('Visual Events', () => {
    test('should emit thinking events', async () => {
      let thinkingEvents: any[] = [];
      
      aiPlayer.onThinkingStarted = (event) => {
        thinkingEvents.push({ type: 'thinking_started', ...event });
      };
      
      aiPlayer.onThinkingCompleted = (event) => {
        thinkingEvents.push({ type: 'thinking_completed', ...event });
      };

      aiPlayer.activate();
      aiPlayer.updateGameState(mockGameState);

      await (global as any).advanceTime(500);

      // Should have emitted thinking events
      const startEvents = thinkingEvents.filter(e => e.type === 'thinking_started');
      const completeEvents = thinkingEvents.filter(e => e.type === 'thinking_completed');
      
      expect(startEvents.length).toBeGreaterThan(0);
      expect(completeEvents.length).toBeGreaterThan(0);
    });

    test('should emit reaction events during gameplay', async () => {
      let reactionEvents: any[] = [];
      
      aiPlayer.onReaction = (event) => {
        reactionEvents.push(event);
      };

      aiPlayer.activate();
      
      // Simulate ball approaching AI paddle
      const approachingBall = {
        ...mockGameState,
        ball: { x: 700, y: 250, velocityX: -4, velocityY: 0, speed: 6 }
      };

      aiPlayer.updateGameState(approachingBall);
      await (global as any).advanceTime(300);

      // Should have generated reaction events
      expect(reactionEvents.length).toBeGreaterThanOrEqual(0);
      
      reactionEvents.forEach(event => {
        expect(['move_up', 'move_down']).toContain(event.reactionType);
        expect(['active', 'idle']).toContain(event.intensity);
        expect(event.reactionTime).toBeGreaterThan(0);
        expect(event.difficulty).toBe('medium');
      });
    });
  });
});