/**
 * Game Error Handler Service
 * 
 * Provides comprehensive error handling, logging, and recovery mechanisms
 * for WebSocket connections, AI failures, and game state issues
 */

import { GameRoom, Player } from '../interfaces/GameTypes';

export interface GameError {
  id: string;
  type: GameErrorType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: any;
  timestamp: number;
  gameId?: string;
  playerId?: string;
  stackTrace?: string;
  recoveryAction?: string;
}

export type GameErrorType = 
  | 'websocket_connection_lost'
  | 'websocket_send_failed'
  | 'websocket_message_invalid'
  | 'ai_player_crashed'
  | 'ai_decision_timeout'
  | 'ai_invalid_move'
  | 'game_state_corruption'
  | 'game_synchronization_failed'
  | 'validation_failure'
  | 'database_error'
  | 'resource_exhaustion'
  | 'timeout_error'
  | 'unknown_error';

export interface ErrorRecoveryStrategy {
  type: GameErrorType;
  maxRetries: number;
  retryDelay: number;
  recoveryActions: string[];
  escalationThreshold: number;
}

export interface GameHealthMetrics {
  activeConnections: number;
  activeGames: number;
  errorRate: number;
  averageLatency: number;
  memoryUsage: number;
  cpuUsage?: number;
  lastHealthCheck: number;
}

export class GameErrorHandler {
  private errors: Map<string, GameError[]> = new Map(); // gameId -> errors
  private globalErrors: GameError[] = [];
  private errorCounts: Map<GameErrorType, number> = new Map();
  private recoveryStrategies: Map<GameErrorType, ErrorRecoveryStrategy> = new Map();
  private healthMetrics: GameHealthMetrics = {
    activeConnections: 0,
    activeGames: 0,
    errorRate: 0,
    averageLatency: 0,
    memoryUsage: 0,
    lastHealthCheck: Date.now()
  };
  
  private readonly MAX_ERRORS_PER_GAME = 50;
  private readonly MAX_GLOBAL_ERRORS = 200;
  private readonly ERROR_RETENTION_TIME = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.initializeRecoveryStrategies();
    
    // Start periodic cleanup
    setInterval(() => this.cleanupOldErrors(), 60 * 60 * 1000); // Every hour
    setInterval(() => this.updateHealthMetrics(), 30 * 1000); // Every 30 seconds
  }

  /**
   * Initialize recovery strategies for different error types
   */
  private initializeRecoveryStrategies(): void {
    const strategies: ErrorRecoveryStrategy[] = [
      {
        type: 'websocket_connection_lost',
        maxRetries: 3,
        retryDelay: 5000,
        recoveryActions: ['reconnect_websocket', 'notify_players', 'pause_game'],
        escalationThreshold: 5
      },
      {
        type: 'websocket_send_failed',
        maxRetries: 2,
        retryDelay: 1000,
        recoveryActions: ['retry_send', 'check_connection'],
        escalationThreshold: 10
      },
      {
        type: 'ai_player_crashed',
        maxRetries: 1,
        retryDelay: 3000,
        recoveryActions: ['restart_ai_player', 'reset_ai_state', 'notify_human_player'],
        escalationThreshold: 3
      },
      {
        type: 'ai_decision_timeout',
        maxRetries: 0,
        retryDelay: 0,
        recoveryActions: ['force_ai_move', 'log_timeout'],
        escalationThreshold: 20
      },
      {
        type: 'game_state_corruption',
        maxRetries: 0,
        retryDelay: 0,
        recoveryActions: ['restore_last_valid_state', 'force_game_restart', 'notify_all_players'],
        escalationThreshold: 1
      },
      {
        type: 'validation_failure',
        maxRetries: 1,
        retryDelay: 500,
        recoveryActions: ['resync_game_state', 'validate_again'],
        escalationThreshold: 5
      }
    ];

    strategies.forEach(strategy => {
      this.recoveryStrategies.set(strategy.type, strategy);
    });
  }



  /**
   * Log a new error with automatic recovery attempt
   */
  async logError(
    type: GameErrorType,
    message: string,
    details: any = {},
    gameId?: string,
    playerId?: string
  ): Promise<GameError> {
    const error: GameError = {
      id: this.generateErrorId(),
      type,
      severity: this.determineSeverity(type),
      message,
      details,
      timestamp: Date.now(),
      gameId,
      playerId,
      stackTrace: new Error().stack,
      recoveryAction: undefined
    };

    // Store the error
    this.storeError(error);

    // Update error counts
    const currentCount = this.errorCounts.get(type) || 0;
    this.errorCounts.set(type, currentCount + 1);

    // Log to console with appropriate level
    this.logToConsole(error);

    // Attempt automatic recovery
    await this.attemptRecovery(error);

    return error;
  }

  /**
   * Attempt automatic error recovery
   */
  private async attemptRecovery(error: GameError): Promise<void> {
    const strategy = this.recoveryStrategies.get(error.type);
    if (!strategy) {
      console.warn(`No recovery strategy found for error type: ${error.type}`);
      return;
    }

    const errorCount = this.errorCounts.get(error.type) || 0;
    if (errorCount >= strategy.escalationThreshold) {
      console.error(`Error escalation threshold reached for ${error.type}: ${errorCount}/${strategy.escalationThreshold}`);
      await this.escalateError(error);
      return;
    }

    for (const action of strategy.recoveryActions) {
      try {
        await this.executeRecoveryAction(action, error);
        error.recoveryAction = action;
        console.log(`Recovery action '${action}' executed for error ${error.id}`);
        break; // Success, stop trying other actions
      } catch (recoveryError) {
        console.error(`Recovery action '${action}' failed:`, recoveryError);
      }
    }
  }

  /**
   * Execute specific recovery action
   */
  private async executeRecoveryAction(action: string, error: GameError): Promise<void> {
    switch (action) {
      case 'reconnect_websocket':
        // Implemented by caller - return action needed
        console.log(`Action needed: Reconnect WebSocket for game ${error.gameId}`);
        break;

      case 'notify_players':
        console.log(`Action needed: Notify players of connection issue in game ${error.gameId}`);
        break;

      case 'pause_game':
        console.log(`Action needed: Pause game ${error.gameId} due to connection issues`);
        break;

      case 'restart_ai_player':
        console.log(`Action needed: Restart AI player in game ${error.gameId}`);
        break;

      case 'reset_ai_state':
        console.log(`Action needed: Reset AI state for game ${error.gameId}`);
        break;

      case 'force_ai_move':
        console.log(`Action needed: Force AI to make a default move in game ${error.gameId}`);
        break;

      case 'restore_last_valid_state':
        console.log(`Action needed: Restore last valid game state for game ${error.gameId}`);
        break;

      case 'resync_game_state':
        console.log(`Action needed: Resynchronize game state for game ${error.gameId}`);
        break;

      case 'retry_send':
        // This would be handled by the WebSocket service
        await new Promise(resolve => setTimeout(resolve, 100));
        break;

      default:
        console.warn(`Unknown recovery action: ${action}`);
    }
  }

  /**
   * Escalate critical errors
   */
  private async escalateError(error: GameError): Promise<void> {
    console.error(`CRITICAL ERROR ESCALATION: ${error.type}`, {
      errorId: error.id,
      gameId: error.gameId,
      message: error.message,
      count: this.errorCounts.get(error.type)
    });

    // In a production environment, this could:
    // - Send alerts to monitoring systems
    // - Notify administrators
    // - Trigger automatic failover procedures
    // - Scale resources automatically
  }

  /**
   * Store error in appropriate collection
   */
  private storeError(error: GameError): void {
    if (error.gameId) {
      // Game-specific error
      if (!this.errors.has(error.gameId)) {
        this.errors.set(error.gameId, []);
      }
      const gameErrors = this.errors.get(error.gameId)!;
      gameErrors.push(error);

      // Limit errors per game
      if (gameErrors.length > this.MAX_ERRORS_PER_GAME) {
        gameErrors.shift();
      }
    } else {
      // Global error
      this.globalErrors.push(error);

      // Limit global errors
      if (this.globalErrors.length > this.MAX_GLOBAL_ERRORS) {
        this.globalErrors.shift();
      }
    }
  }

  /**
   * Determine error severity based on type
   */
  private determineSeverity(type: GameErrorType): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<GameErrorType, 'low' | 'medium' | 'high' | 'critical'> = {
      'websocket_connection_lost': 'high',
      'websocket_send_failed': 'medium',
      'websocket_message_invalid': 'low',
      'ai_player_crashed': 'high',
      'ai_decision_timeout': 'medium',
      'ai_invalid_move': 'low',
      'game_state_corruption': 'critical',
      'game_synchronization_failed': 'high',
      'validation_failure': 'medium',
      'database_error': 'critical',
      'resource_exhaustion': 'critical',
      'timeout_error': 'medium',
      'unknown_error': 'medium'
    };

    return severityMap[type] || 'medium';
  }

  /**
   * Log error to console with appropriate level
   */
  private logToConsole(error: GameError): void {
    const logMessage = `[${error.severity.toUpperCase()}] ${error.type}: ${error.message}`;
    const logDetails = {
      id: error.id,
      gameId: error.gameId,
      playerId: error.playerId,
      details: error.details,
      timestamp: new Date(error.timestamp).toISOString()
    };

    switch (error.severity) {
      case 'critical':
        console.error(logMessage, logDetails);
        break;
      case 'high':
        console.error(logMessage, logDetails);
        break;
      case 'medium':
        console.warn(logMessage, logDetails);
        break;
      case 'low':
        console.info(logMessage, logDetails);
        break;
    }
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get errors for a specific game
   */
  getGameErrors(gameId: string): GameError[] {
    return this.errors.get(gameId) || [];
  }

  /**
   * Get recent errors across all games
   */
  getRecentErrors(limit: number = 50): GameError[] {
    const allErrors = [
      ...this.globalErrors,
      ...Array.from(this.errors.values()).flat()
    ];

    return allErrors
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): { [key in GameErrorType]?: number } {
    const stats: { [key in GameErrorType]?: number } = {};
    
    this.errorCounts.forEach((count, type) => {
      stats[type] = count;
    });

    return stats;
  }

  /**
   * Update system health metrics
   */
  private updateHealthMetrics(): void {
    this.healthMetrics.lastHealthCheck = Date.now();
    this.healthMetrics.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB

    // Calculate error rate (errors per minute)
    const recentErrors = this.getRecentErrors(100);
    const oneMinuteAgo = Date.now() - 60000;
    const recentErrorCount = recentErrors.filter(e => e.timestamp > oneMinuteAgo).length;
    this.healthMetrics.errorRate = recentErrorCount;
  }

  /**
   * Get current health metrics
   */
  getHealthMetrics(): GameHealthMetrics {
    return { ...this.healthMetrics };
  }

  /**
   * Update connection and game counts
   */
  updateHealthStats(activeConnections: number, activeGames: number, averageLatency?: number): void {
    this.healthMetrics.activeConnections = activeConnections;
    this.healthMetrics.activeGames = activeGames;
    if (averageLatency !== undefined) {
      this.healthMetrics.averageLatency = averageLatency;
    }
  }

  /**
   * Check if system is healthy
   */
  isSystemHealthy(): boolean {
    const metrics = this.getHealthMetrics();
    const criticalErrorCount = this.getRecentErrors(20).filter(e => e.severity === 'critical').length;
    
    return (
      metrics.errorRate < 10 && // Less than 10 errors per minute
      metrics.memoryUsage < 500 && // Less than 500MB memory usage
      criticalErrorCount === 0 && // No critical errors in recent history
      metrics.averageLatency < 1000 // Less than 1 second average latency
    );
  }

  /**
   * Clean up old errors to prevent memory leaks
   */
  private cleanupOldErrors(): void {
    const cutoff = Date.now() - this.ERROR_RETENTION_TIME;

    // Clean global errors
    this.globalErrors = this.globalErrors.filter(e => e.timestamp > cutoff);

    // Clean game-specific errors
    this.errors.forEach((gameErrors, gameId) => {
      const filteredErrors = gameErrors.filter(e => e.timestamp > cutoff);
      if (filteredErrors.length === 0) {
        this.errors.delete(gameId);
      } else {
        this.errors.set(gameId, filteredErrors);
      }
    });

    console.log(`Cleaned up errors older than ${new Date(cutoff).toISOString()}`);
  }

  /**
   * Clear all errors (for testing/debugging)
   */
  clearAllErrors(): void {
    this.errors.clear();
    this.globalErrors = [];
    this.errorCounts.clear();
    console.log('All errors cleared');
  }

  /**
   * Clean up resources when game ends
   */
  cleanupGame(gameId: string): void {
    this.errors.delete(gameId);
    console.log(`Cleaned up error tracking for game ${gameId}`);
  }
}