/**
 * GameErrorHandler Unit Tests
 * 
 * Tests for comprehensive error handling system including:
 * - Error logging and classification
 * - Recovery strategy execution
 * - Health metrics monitoring
 * - Error escalation
 * - Resource cleanup
 */

import { GameErrorHandler, GameErrorType } from '../../backend/src/services/GameErrorHandler';

describe('GameErrorHandler', () => {
  let errorHandler: GameErrorHandler;

  beforeEach(() => {
    jest.useFakeTimers();
    errorHandler = new GameErrorHandler();
  });

  afterEach(() => {
    jest.useRealTimers();
    errorHandler.clearAllErrors();
  });

  describe('Error Logging', () => {
    test('should log errors with correct classification', async () => {
      const error = await errorHandler.logError(
        'websocket_connection_lost',
        'Connection dropped unexpectedly',
        { reason: 'network_timeout' },
        'game-123',
        'player-456'
      );

      expect(error).toBeDefined();
      expect(error.type).toBe('websocket_connection_lost');
      expect(error.severity).toBe('high');
      expect(error.gameId).toBe('game-123');
      expect(error.playerId).toBe('player-456');
      expect(error.message).toBe('Connection dropped unexpectedly');
    });

    test('should assign correct severity levels', async () => {
      const criticalError = await errorHandler.logError(
        'game_state_corruption',
        'Game state is corrupted'
      );
      
      const mediumError = await errorHandler.logError(
        'ai_decision_timeout',
        'AI took too long to decide'
      );
      
      const lowError = await errorHandler.logError(
        'ai_invalid_move',
        'AI made an invalid move'
      );

      expect(criticalError.severity).toBe('critical');
      expect(mediumError.severity).toBe('medium');
      expect(lowError.severity).toBe('low');
    });

    test('should generate unique error IDs', async () => {
      const error1 = await errorHandler.logError('timeout_error', 'First timeout');
      const error2 = await errorHandler.logError('timeout_error', 'Second timeout');
      
      expect(error1.id).not.toBe(error2.id);
      expect(error1.id).toMatch(/^err_\d+_[a-z0-9]+$/);
      expect(error2.id).toMatch(/^err_\d+_[a-z0-9]+$/);
    });

    test('should include stack trace information', async () => {
      const error = await errorHandler.logError(
        'unknown_error',
        'Test error with stack trace'
      );

      expect(error.stackTrace).toBeDefined();
      expect(error.stackTrace).toContain('GameErrorHandler');
    });
  });

  describe('Error Retrieval and Statistics', () => {
    beforeEach(async () => {
      // Add some test errors
      await errorHandler.logError('websocket_send_failed', 'Send failed 1', {}, 'game-1');
      await errorHandler.logError('websocket_send_failed', 'Send failed 2', {}, 'game-1');
      await errorHandler.logError('ai_player_crashed', 'AI crashed', {}, 'game-2');
      await errorHandler.logError('validation_failure', 'Validation failed', {}, 'game-1');
    });

    test('should retrieve errors for specific game', () => {
      const game1Errors = errorHandler.getGameErrors('game-1');
      const game2Errors = errorHandler.getGameErrors('game-2');
      
      expect(game1Errors).toHaveLength(3);
      expect(game2Errors).toHaveLength(1);
      
      expect(game1Errors.every(e => e.gameId === 'game-1')).toBe(true);
      expect(game2Errors.every(e => e.gameId === 'game-2')).toBe(true);
    });

    test('should get recent errors across all games', () => {
      const recentErrors = errorHandler.getRecentErrors(10);
      
      expect(recentErrors).toHaveLength(4);
      
      // Should be sorted by timestamp (most recent first)
      for (let i = 1; i < recentErrors.length; i++) {
        expect(recentErrors[i-1].timestamp).toBeGreaterThanOrEqual(recentErrors[i].timestamp);
      }
    });

    test('should provide error statistics', () => {
      const stats = errorHandler.getErrorStats();
      
      expect(stats['websocket_send_failed']).toBe(2);
      expect(stats['ai_player_crashed']).toBe(1);
      expect(stats['validation_failure']).toBe(1);
    });

    test('should limit recent errors list', () => {
      const limitedErrors = errorHandler.getRecentErrors(2);
      expect(limitedErrors).toHaveLength(2);
    });
  });

  describe('Health Metrics', () => {
    test('should provide initial health metrics', () => {
      const metrics = errorHandler.getHealthMetrics();
      
      expect(metrics.activeConnections).toBe(0);
      expect(metrics.activeGames).toBe(0);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.averageLatency).toBe(0);
      expect(metrics.memoryUsage).toBeGreaterThan(0);
      expect(metrics.lastHealthCheck).toBeGreaterThan(0);
    });

    test('should update health statistics', () => {
      errorHandler.updateHealthStats(25, 5, 150);
      
      const metrics = errorHandler.getHealthMetrics();
      expect(metrics.activeConnections).toBe(25);
      expect(metrics.activeGames).toBe(5);
      expect(metrics.averageLatency).toBe(150);
    });

    test('should calculate error rate over time', async () => {
      // Add errors rapidly
      await errorHandler.logError('timeout_error', 'Error 1');
      await errorHandler.logError('timeout_error', 'Error 2');
      await errorHandler.logError('timeout_error', 'Error 3');

      // Advance time to trigger health metrics update
      jest.advanceTimersByTime(30000);

      const metrics = errorHandler.getHealthMetrics();
      expect(metrics.errorRate).toBeGreaterThan(0);
    });

    test('should assess system health correctly', async () => {
      // System should be healthy initially
      expect(errorHandler.isSystemHealthy()).toBe(true);
      
      // Add critical error
      await errorHandler.logError('database_error', 'Database connection failed');
      
      // System should be unhealthy with critical errors
      expect(errorHandler.isSystemHealthy()).toBe(false);
    });

    test('should consider error rate in health assessment', async () => {
      // Add many errors to increase error rate
      for (let i = 0; i < 15; i++) {
        await errorHandler.logError('websocket_send_failed', `Error ${i}`);
      }

      // Should be unhealthy due to high error rate
      expect(errorHandler.isSystemHealthy()).toBe(false);
    });
  });

  describe('Recovery Strategies', () => {
    test('should attempt recovery for known error types', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await errorHandler.logError(
        'websocket_connection_lost',
        'Connection lost',
        {},
        'game-123'
      );

      // Should have logged recovery actions
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Action needed: Reconnect WebSocket for game game-123')
      );

      consoleSpy.mockRestore();
    });

    test('should handle multiple recovery actions', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await errorHandler.logError(
        'ai_player_crashed',
        'AI system crashed',
        {},
        'game-456'
      );

      // Should attempt multiple recovery actions
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Action needed: Restart AI player in game game-456')
      );

      consoleSpy.mockRestore();
    });

    test('should escalate errors when threshold is reached', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Trigger same error type multiple times to reach escalation threshold
      for (let i = 0; i < 6; i++) {
        await errorHandler.logError(
          'websocket_connection_lost',
          `Connection lost ${i}`,
          {},
          `game-${i}`
        );
      }

      // Should have escalated the error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('CRITICAL ERROR ESCALATION'),
        expect.any(Object)
      );

      consoleErrorSpy.mockRestore();
    });

    test('should handle unknown error types gracefully', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      await errorHandler.logError(
        'unknown_custom_error' as GameErrorType,
        'Custom error with no recovery strategy'
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No recovery strategy found for error type: unknown_custom_error')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Resource Management', () => {
    test('should clean up game-specific errors', async () => {
      await errorHandler.logError('timeout_error', 'Test error', {}, 'cleanup-game');
      
      let gameErrors = errorHandler.getGameErrors('cleanup-game');
      expect(gameErrors).toHaveLength(1);
      
      errorHandler.cleanupGame('cleanup-game');
      
      gameErrors = errorHandler.getGameErrors('cleanup-game');
      expect(gameErrors).toHaveLength(0);
    });

    test('should limit errors per game to prevent memory leaks', async () => {
      // Add more errors than the limit
      for (let i = 0; i < 60; i++) {
        await errorHandler.logError(
          'websocket_send_failed',
          `Error ${i}`,
          {},
          'memory-test-game'
        );
      }

      const gameErrors = errorHandler.getGameErrors('memory-test-game');
      expect(gameErrors.length).toBeLessThanOrEqual(50); // Should be limited
    });

    test('should limit global errors to prevent memory leaks', async () => {
      // Add more global errors than the limit
      for (let i = 0; i < 250; i++) {
        await errorHandler.logError(
          'database_error',
          `Global error ${i}`
        );
      }

      const recentErrors = errorHandler.getRecentErrors(300);
      expect(recentErrors.length).toBeLessThanOrEqual(200); // Should be limited
    });

    test('should clear all errors on demand', async () => {
      await errorHandler.logError('timeout_error', 'Error 1', {}, 'game-1');
      await errorHandler.logError('timeout_error', 'Error 2', {}, 'game-2');
      await errorHandler.logError('database_error', 'Global error');

      let stats = errorHandler.getErrorStats();
      expect(Object.keys(stats).length).toBeGreaterThan(0);

      errorHandler.clearAllErrors();

      stats = errorHandler.getErrorStats();
      expect(Object.keys(stats).length).toBe(0);
    });
  });

  describe('Periodic Maintenance', () => {
    test('should clean up old errors automatically', async () => {
      // Mock Date.now to create old timestamps
      const originalNow = Date.now;
      const oldTime = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
      
      Date.now = jest.fn(() => oldTime);
      
      await errorHandler.logError('timeout_error', 'Old error');
      
      Date.now = originalNow;
      
      // Trigger cleanup by advancing time
      jest.advanceTimersByTime(60 * 60 * 1000 + 1000); // 1 hour + 1 second

      const recentErrors = errorHandler.getRecentErrors(10);
      expect(recentErrors).toHaveLength(0); // Old error should be cleaned up
    });

    test('should update health metrics periodically', () => {
      const initialMetrics = errorHandler.getHealthMetrics();
      const initialTime = initialMetrics.lastHealthCheck;
      
      // Advance time to trigger health update
      jest.advanceTimersByTime(30000 + 1000); // 30 seconds + 1 second
      
      const updatedMetrics = errorHandler.getHealthMetrics();
      expect(updatedMetrics.lastHealthCheck).toBeGreaterThan(initialTime);
    });
  });

  describe('Error Handling Edge Cases', () => {
    test('should handle error logging failures gracefully', async () => {
      // This test ensures the error handler itself doesn't crash
      expect(async () => {
        await errorHandler.logError(
          null as any,
          undefined as any,
          { circular: {} },
          '',
          null as any
        );
      }).not.toThrow();
    });

    test('should handle malformed error data', async () => {
      const error = await errorHandler.logError(
        'unknown_error',
        '',
        {
          nested: {
            deep: {
              object: 'with complex structure',
              array: [1, 2, 3, { more: 'data' }]
            }
          }
        }
      );

      expect(error).toBeDefined();
      expect(error.details).toBeDefined();
    });

    test('should handle concurrent error logging', async () => {
      const promises = [];
      
      // Log many errors concurrently
      for (let i = 0; i < 20; i++) {
        promises.push(
          errorHandler.logError(
            'websocket_send_failed',
            `Concurrent error ${i}`,
            {},
            `game-${i % 3}`
          )
        );
      }

      const errors = await Promise.all(promises);
      
      expect(errors).toHaveLength(20);
      expect(errors.every(e => e.id)).toBe(true);
      
      // All errors should have unique IDs
      const ids = errors.map(e => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('should maintain error order under load', async () => {
      const timestamps: number[] = [];
      
      for (let i = 0; i < 10; i++) {
        const error = await errorHandler.logError(
          'timeout_error',
          `Sequential error ${i}`
        );
        timestamps.push(error.timestamp);
        
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 1));
      }

      // Timestamps should be in ascending order
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i-1]);
      }
    });
  });
});