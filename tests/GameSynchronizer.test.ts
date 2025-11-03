/**
 * GameSynchronizer Unit Tests
 * 
 * Tests for the game synchronization system including:
 * - Player input buffering
 * - Paddle position updates
 * - Velocity calculations
 * - Synchronization loop
 * - Multi-player coordination
 */

import { GameSynchronizer, PlayerInput } from '../../backend/src/services/GameSynchronizer';

describe('GameSynchronizer', () => {
  let synchronizer: GameSynchronizer;

  beforeEach(() => {
    jest.useFakeTimers();
    synchronizer = new GameSynchronizer();
  });

  afterEach(() => {
    jest.useRealTimers();
    synchronizer.stopSync();
  });

  describe('Initialization', () => {
    test('should create synchronizer with default state', () => {
      expect(synchronizer).toBeDefined();
      
      const gameState = synchronizer.getGameState();
      expect(gameState.players.player1.paddlePosition.y).toBe(250);
      expect(gameState.players.player2.paddlePosition.y).toBe(250);
      expect(gameState.players.player1.velocity).toBe(0);
      expect(gameState.players.player2.velocity).toBe(0);
    });

    test('should initialize input buffers for both players', () => {
      const player1Input: PlayerInput = {
        action: 'up',
        timestamp: Date.now(),
        source: 'human',
        intensity: 1,
        duration: 16
      };

      const player2Input: PlayerInput = {
        action: 'down',
        timestamp: Date.now(),
        source: 'ai',
        intensity: 0.8,
        duration: 20
      };

      expect(() => {
        synchronizer.addPlayerInput('player1', player1Input);
        synchronizer.addPlayerInput('player2', player2Input);
      }).not.toThrow();
    });
  });

  describe('Input Handling', () => {
    test('should buffer player inputs correctly', () => {
      const input1: PlayerInput = {
        action: 'up',
        timestamp: Date.now(),
        source: 'human',
        intensity: 1,
        duration: 16
      };

      const input2: PlayerInput = {
        action: 'down',
        timestamp: Date.now() + 100,
        source: 'human',
        intensity: 1,
        duration: 16
      };

      synchronizer.addPlayerInput('player1', input1);
      synchronizer.addPlayerInput('player1', input2);

      const gameState = synchronizer.getGameState();
      expect(gameState.inputBuffer.player1.length).toBe(2);
    });

    test('should handle rapid input sequences', () => {
      const inputs: PlayerInput[] = [];
      
      for (let i = 0; i < 10; i++) {
        inputs.push({
          action: i % 2 === 0 ? 'up' : 'down',
          timestamp: Date.now() + i * 10,
          source: 'human',
          intensity: 1,
          duration: 16
        });
      }

      inputs.forEach(input => {
        synchronizer.addPlayerInput('player1', input);
      });

      const gameState = synchronizer.getGameState();
      expect(gameState.inputBuffer.player1.length).toBeLessThanOrEqual(10);
    });

    test('should differentiate between human and AI inputs', () => {
      const humanInput: PlayerInput = {
        action: 'up',
        timestamp: Date.now(),
        source: 'human',
        intensity: 1,
        duration: 16
      };

      const aiInput: PlayerInput = {
        action: 'down',
        timestamp: Date.now(),
        source: 'ai',
        intensity: 0.85,
        duration: 22
      };

      synchronizer.addPlayerInput('player1', humanInput);
      synchronizer.addPlayerInput('player2', aiInput);

      const gameState = synchronizer.getGameState();
      expect(gameState.inputBuffer.player1[0].source).toBe('human');
      expect(gameState.inputBuffer.player2[0].source).toBe('ai');
    });
  });

  describe('Paddle Position Updates', () => {
    test('should update paddle positions correctly', () => {
      const initialState = synchronizer.getGameState();
      const initialY = initialState.players.player1.paddlePosition.y;

      synchronizer.updatePaddlePosition('player1', initialY - 50);

      const updatedState = synchronizer.getGameState();
      expect(updatedState.players.player1.paddlePosition.y).toBe(initialY - 50);
    });

    test('should enforce canvas boundaries', () => {
      // Try to move paddle above canvas
      synchronizer.updatePaddlePosition('player1', -10);
      
      let gameState = synchronizer.getGameState();
      expect(gameState.players.player1.paddlePosition.y).toBeGreaterThanOrEqual(0);

      // Try to move paddle below canvas (assuming 600px height and 100px paddle)
      synchronizer.updatePaddlePosition('player1', 550);
      
      gameState = synchronizer.getGameState();
      expect(gameState.players.player1.paddlePosition.y).toBeLessThanOrEqual(500);
    });

    test('should calculate velocity based on position changes', () => {
      const initialState = synchronizer.getGameState();
      const initialY = initialState.players.player1.paddlePosition.y;

      // Move paddle down quickly
      synchronizer.updatePaddlePosition('player1', initialY + 30);

      const updatedState = synchronizer.getGameState();
      expect(Math.abs(updatedState.players.player1.velocity)).toBeGreaterThan(0);
    });

    test('should smooth velocity changes over time', async () => {
      const velocities: number[] = [];
      
      // Simulate gradual movement
      for (let i = 0; i < 5; i++) {
        synchronizer.updatePaddlePosition('player1', 250 + i * 10);
        await (global as any).advanceTime(16); // 60 FPS
        
        const state = synchronizer.getGameState();
        velocities.push(state.players.player1.velocity);
      }

      // Velocity should change gradually, not abruptly
      expect(velocities.length).toBe(5);
      const maxVelocityChange = Math.max(...velocities.slice(1).map((v, i) => 
        Math.abs(v - velocities[i])
      ));
      expect(maxVelocityChange).toBeLessThan(100); // Reasonable limit
    });
  });

  describe('Synchronization Loop', () => {
    test('should start and stop sync loop', () => {
      let broadcastCount = 0;
      
      synchronizer.startSync((gameState) => {
        broadcastCount++;
      });

      expect(() => synchronizer.stopSync()).not.toThrow();
    });

    test('should broadcast at 60 FPS when active', async () => {
      let broadcastCount = 0;
      
      synchronizer.startSync((gameState) => {
        broadcastCount++;
      });

      // Wait for several frames
      await (global as any).advanceTime(200); // ~12 frames at 60 FPS

      synchronizer.stopSync();

      expect(broadcastCount).toBeGreaterThan(5);
      expect(broadcastCount).toBeLessThan(20); // Reasonable range
    });

    test('should process input buffer during sync', async () => {
      let lastBroadcastState: any = null;
      
      synchronizer.startSync((gameState) => {
        lastBroadcastState = gameState;
      });

      // Add input while sync is running
      const input: PlayerInput = {
        action: 'up',
        timestamp: Date.now(),
        source: 'human',
        intensity: 1,
        duration: 16
      };

      synchronizer.addPlayerInput('player1', input);

      // Wait for sync to process input
      await (global as any).advanceTime(100);

      synchronizer.stopSync();

      expect(lastBroadcastState).not.toBeNull();
      if (lastBroadcastState) {
        expect(lastBroadcastState.inputBuffer).toBeDefined();
      }
    });
  });

  describe('Multi-Player Coordination', () => {
    test('should handle simultaneous player inputs', () => {
      const player1Input: PlayerInput = {
        action: 'up',
        timestamp: Date.now(),
        source: 'human',
        intensity: 1,
        duration: 16
      };

      const player2Input: PlayerInput = {
        action: 'down',
        timestamp: Date.now(),
        source: 'ai',
        intensity: 0.9,
        duration: 18
      };

      synchronizer.addPlayerInput('player1', player1Input);
      synchronizer.addPlayerInput('player2', player2Input);

      const gameState = synchronizer.getGameState();
      expect(gameState.inputBuffer.player1.length).toBe(1);
      expect(gameState.inputBuffer.player2.length).toBe(1);
    });

    test('should maintain independent paddle positions', () => {
      synchronizer.updatePaddlePosition('player1', 100);
      synchronizer.updatePaddlePosition('player2', 400);

      const gameState = synchronizer.getGameState();
      expect(gameState.players.player1.paddlePosition.y).toBe(100);
      expect(gameState.players.player2.paddlePosition.y).toBe(400);
    });

    test('should calculate independent velocities', () => {
      // Move player1 up quickly
      synchronizer.updatePaddlePosition('player1', 200);
      
      // Move player2 down slowly
      synchronizer.updatePaddlePosition('player2', 255);

      const gameState = synchronizer.getGameState();
      
      // Velocities should be different and appropriate
      expect(gameState.players.player1.velocity).not.toBe(gameState.players.player2.velocity);
    });
  });

  describe('Performance and Cleanup', () => {
    test('should handle high-frequency inputs without performance degradation', () => {
      const startTime = Date.now();
      
      // Add many inputs rapidly
      for (let i = 0; i < 100; i++) {
        const input: PlayerInput = {
          action: i % 3 === 0 ? 'up' : i % 3 === 1 ? 'down' : 'none',
          timestamp: Date.now() + i,
          source: 'human',
          intensity: Math.random(),
          duration: 16
        };
        synchronizer.addPlayerInput('player1', input);
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    test('should clean up resources on stop', () => {
      let broadcastCount = 0;
      
      synchronizer.startSync((gameState) => {
        broadcastCount++;
      });

      synchronizer.stopSync();

      const initialBroadcastCount = broadcastCount;
      
      // Wait and verify no more broadcasts
      setTimeout(() => {
        expect(broadcastCount).toBe(initialBroadcastCount);
      }, 100);
    });

    test('should handle multiple start/stop cycles', () => {
      for (let i = 0; i < 3; i++) {
        synchronizer.startSync(() => {});
        synchronizer.stopSync();
      }

      // Should still be functional
      const input: PlayerInput = {
        action: 'up',
        timestamp: Date.now(),
        source: 'human',
        intensity: 1,
        duration: 16
      };

      expect(() => {
        synchronizer.addPlayerInput('player1', input);
      }).not.toThrow();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle invalid player IDs gracefully', () => {
      const input: PlayerInput = {
        action: 'up',
        timestamp: Date.now(),
        source: 'human',
        intensity: 1,
        duration: 16
      };

      expect(() => {
        synchronizer.addPlayerInput('invalidPlayer' as any, input);
      }).not.toThrow();
    });

    test('should handle corrupted input data', () => {
      const corruptedInput = {
        action: 'invalid_action',
        timestamp: NaN,
        source: null,
        intensity: Infinity,
        duration: -1
      } as any;

      expect(() => {
        synchronizer.addPlayerInput('player1', corruptedInput);
      }).not.toThrow();
    });

    test('should handle extremely large position values', () => {
      expect(() => {
        synchronizer.updatePaddlePosition('player1', 999999);
        synchronizer.updatePaddlePosition('player1', -999999);
      }).not.toThrow();

      const gameState = synchronizer.getGameState();
      expect(gameState.players.player1.paddlePosition.y).toBeGreaterThanOrEqual(0);
      expect(gameState.players.player1.paddlePosition.y).toBeLessThanOrEqual(500);
    });

    test('should recover from sync callback errors', () => {
      const faultyCallback = () => {
        throw new Error('Callback error');
      };

      expect(() => {
        synchronizer.startSync(faultyCallback);
      }).not.toThrow();

      // Should still be able to stop
      expect(() => {
        synchronizer.stopSync();
      }).not.toThrow();
    });
  });
});