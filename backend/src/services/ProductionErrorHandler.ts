/**
 * @fileoverview Enhanced Error Handler for Production Deployment
 * 
 * Comprehensive error handling system for ft_transcendence with improved
 * resilience, logging, and recovery mechanisms for production environment.
 * 
 * @author ft_transcendence Team
 * @version 2.0.0
 */

import { EventEmitter } from 'events';

export interface ErrorContext {
  /** Error source component */
  source: 'websocket' | 'ai' | 'game' | 'performance' | 'auth' | 'database';
  /** Error severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** User ID if applicable */
  userId?: string;
  /** Game ID if applicable */
  gameId?: string;
  /** Additional context data */
  metadata?: Record<string, any>;
  /** Timestamp when error occurred */
  timestamp: number;
}

export interface ErrorRecoveryAction {
  /** Action type */
  type: 'retry' | 'fallback' | 'reset' | 'notify' | 'shutdown';
  /** Action parameters */
  params?: Record<string, any>;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Delay between retries (ms) */
  retryDelay?: number;
}

export interface ErrorPattern {
  /** Error pattern identifier */
  id: string;
  /** Pattern matching criteria */
  matcher: (error: Error, context: ErrorContext) => boolean;
  /** Recovery actions to take */
  actions: ErrorRecoveryAction[];
  /** Rate limiting (errors per minute) */
  rateLimit?: number;
  /** Whether to escalate after max retries */
  escalate?: boolean;
}

/**
 * Enhanced production-ready error handler with automatic recovery
 */
export class ProductionErrorHandler extends EventEmitter {
  /** Error patterns for automatic handling */
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  /** Error frequency tracking */
  private errorCounts: Map<string, number[]> = new Map();
  /** Active retry operations */
  private activeRetries: Map<string, number> = new Map();
  /** Error history for analysis */
  private errorHistory: Array<{error: Error, context: ErrorContext}> = [];
  /** Maximum error history length */
  private readonly maxHistoryLength = 1000;

  constructor() {
    super();
    this.initializeDefaultPatterns();
  }

  /**
   * Initialize default error handling patterns
   */
  private initializeDefaultPatterns(): void {
    // WebSocket connection errors
    this.addErrorPattern({
      id: 'websocket-connection',
      matcher: (error, context) => context.source === 'websocket' && 
                                   error.message.includes('connection'),
      actions: [
        { type: 'retry', maxRetries: 3, retryDelay: 1000 },
        { type: 'notify', params: { level: 'warning' } }
      ],
      rateLimit: 10 // Max 10 connection errors per minute
    });

    // AI decision timeout errors
    this.addErrorPattern({
      id: 'ai-timeout',
      matcher: (error, context) => context.source === 'ai' && 
                                   (error.message.includes('timeout') || 
                                    error.message.includes('decision')),
      actions: [
        { type: 'fallback', params: { useSimpleAI: true } },
        { type: 'notify', params: { level: 'medium' } }
      ],
      rateLimit: 5
    });

    // Performance monitoring errors
    this.addErrorPattern({
      id: 'performance-monitor',
      matcher: (error, context) => context.source === 'performance',
      actions: [
        { type: 'retry', maxRetries: 2, retryDelay: 500 },
        { type: 'fallback', params: { disableAdvancedMetrics: true } }
      ],
      rateLimit: 3
    });

    // Database errors
    this.addErrorPattern({
      id: 'database-error',
      matcher: (error, context) => context.source === 'database',
      actions: [
        { type: 'retry', maxRetries: 3, retryDelay: 2000 },
        { type: 'notify', params: { level: 'high' } }
      ],
      rateLimit: 2
    });

    // Critical game state errors
    this.addErrorPattern({
      id: 'game-state-critical',
      matcher: (error, context) => context.source === 'game' && 
                                   context.severity === 'critical',
      actions: [
        { type: 'reset', params: { resetGameState: true } },
        { type: 'notify', params: { level: 'critical' } }
      ],
      rateLimit: 1,
      escalate: true
    });
  }

  /**
   * Add custom error handling pattern
   */
  addErrorPattern(pattern: ErrorPattern): void {
    this.errorPatterns.set(pattern.id, pattern);
  }

  /**
   * Handle error with automatic pattern matching and recovery
   */
  async handleError(error: Error, context: ErrorContext): Promise<boolean> {
    try {
      // Add to error history
      this.errorHistory.push({ error, context });
      if (this.errorHistory.length > this.maxHistoryLength) {
        this.errorHistory.shift();
      }

      // Enhanced logging
      this.logError(error, context);

      // Find matching pattern
      const pattern = this.findMatchingPattern(error, context);
      if (!pattern) {
        return this.handleUnknownError(error, context);
      }

      // Check rate limiting
      if (!this.checkRateLimit(pattern, context)) {
        console.warn(`[ErrorHandler] Rate limit exceeded for pattern: ${pattern.id}`);
        return false;
      }

      // Execute recovery actions
      return await this.executeRecoveryActions(pattern, error, context);

    } catch (recoveryError) {
      console.error('[ErrorHandler] Recovery failed:', recoveryError);
      this.emit('recoveryFailed', { originalError: error, recoveryError, context });
      return false;
    }
  }

  /**
   * Enhanced error logging with context
   */
  private logError(error: Error, context: ErrorContext): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      severity: context.severity
    };

    // Different log levels based on severity
    switch (context.severity) {
      case 'critical':
        console.error('🚨 CRITICAL ERROR:', JSON.stringify(logEntry, null, 2));
        break;
      case 'high':
        console.error('❗ HIGH PRIORITY ERROR:', JSON.stringify(logEntry, null, 2));
        break;
      case 'medium':
        console.warn('⚠️  MEDIUM PRIORITY ERROR:', JSON.stringify(logEntry, null, 2));
        break;
      case 'low':
        console.log('ℹ️  LOW PRIORITY ERROR:', JSON.stringify(logEntry, null, 2));
        break;
    }

    // Emit error event for external handling
    this.emit('error', { error, context, logEntry });
  }

  /**
   * Find matching error pattern
   */
  private findMatchingPattern(error: Error, context: ErrorContext): ErrorPattern | null {
    for (const [id, pattern] of this.errorPatterns) {
      if (pattern.matcher(error, context)) {
        return pattern;
      }
    }
    return null;
  }

  /**
   * Check if error rate is within limits
   */
  private checkRateLimit(pattern: ErrorPattern, context: ErrorContext): boolean {
    if (!pattern.rateLimit) return true;

    const key = `${pattern.id}-${context.source}`;
    const now = Date.now();
    const minute = 60 * 1000;

    if (!this.errorCounts.has(key)) {
      this.errorCounts.set(key, []);
    }

    const counts = this.errorCounts.get(key)!;
    
    // Remove old entries (older than 1 minute)
    while (counts.length > 0 && now - counts[0] > minute) {
      counts.shift();
    }

    // Check if under rate limit
    if (counts.length >= pattern.rateLimit) {
      return false;
    }

    // Add current error
    counts.push(now);
    return true;
  }

  /**
   * Execute recovery actions for matched pattern
   */
  private async executeRecoveryActions(
    pattern: ErrorPattern, 
    error: Error, 
    context: ErrorContext
  ): Promise<boolean> {
    let recovered = false;

    for (const action of pattern.actions) {
      try {
        const success = await this.executeAction(action, error, context);
        if (success) {
          recovered = true;
          console.log(`[ErrorHandler] Recovery action '${action.type}' succeeded for pattern: ${pattern.id}`);
        }
      } catch (actionError) {
        console.error(`[ErrorHandler] Recovery action '${action.type}' failed:`, actionError);
      }
    }

    // Escalate if configured and recovery failed
    if (!recovered && pattern.escalate) {
      this.escalateError(error, context, pattern);
    }

    return recovered;
  }

  /**
   * Execute individual recovery action
   */
  private async executeAction(
    action: ErrorRecoveryAction, 
    error: Error, 
    context: ErrorContext
  ): Promise<boolean> {
    switch (action.type) {
      case 'retry':
        return await this.handleRetryAction(action, error, context);
      
      case 'fallback':
        return await this.handleFallbackAction(action, error, context);
      
      case 'reset':
        return await this.handleResetAction(action, error, context);
      
      case 'notify':
        return await this.handleNotifyAction(action, error, context);
      
      case 'shutdown':
        return await this.handleShutdownAction(action, error, context);
      
      default:
        console.warn(`[ErrorHandler] Unknown action type: ${action.type}`);
        return false;
    }
  }

  /**
   * Handle retry action with exponential backoff
   */
  private async handleRetryAction(
    action: ErrorRecoveryAction,
    error: Error,
    context: ErrorContext
  ): Promise<boolean> {
    const key = `${context.source}-${context.gameId || context.userId || 'global'}`;
    const currentRetries = this.activeRetries.get(key) || 0;
    
    if (currentRetries >= (action.maxRetries || 3)) {
      this.activeRetries.delete(key);
      return false;
    }

    this.activeRetries.set(key, currentRetries + 1);
    
    // Exponential backoff
    const delay = (action.retryDelay || 1000) * Math.pow(2, currentRetries);
    
    console.log(`[ErrorHandler] Retrying in ${delay}ms (attempt ${currentRetries + 1})`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        this.emit('retry', { error, context, attempt: currentRetries + 1 });
        resolve(true);
      }, delay);
    });
  }

  /**
   * Handle fallback action
   */
  private async handleFallbackAction(
    action: ErrorRecoveryAction,
    error: Error,
    context: ErrorContext
  ): Promise<boolean> {
    console.log(`[ErrorHandler] Executing fallback for ${context.source}`);
    
    this.emit('fallback', { error, context, params: action.params });
    
    // Implement specific fallback logic based on source
    switch (context.source) {
      case 'ai':
        if (action.params?.useSimpleAI) {
          console.log('[ErrorHandler] Switching to simple AI mode');
          return true;
        }
        break;
      
      case 'performance':
        if (action.params?.disableAdvancedMetrics) {
          console.log('[ErrorHandler] Disabling advanced performance metrics');
          return true;
        }
        break;
    }
    
    return false;
  }

  /**
   * Handle reset action
   */
  private async handleResetAction(
    action: ErrorRecoveryAction,
    error: Error,
    context: ErrorContext
  ): Promise<boolean> {
    console.log(`[ErrorHandler] Executing reset for ${context.source}`);
    
    this.emit('reset', { error, context, params: action.params });
    
    if (action.params?.resetGameState && context.gameId) {
      console.log(`[ErrorHandler] Resetting game state for game: ${context.gameId}`);
      return true;
    }
    
    return true;
  }

  /**
   * Handle notification action
   */
  private async handleNotifyAction(
    action: ErrorRecoveryAction,
    error: Error,
    context: ErrorContext
  ): Promise<boolean> {
    const level = action.params?.level || 'medium';
    
    console.log(`[ErrorHandler] Sending ${level} level notification`);
    
    this.emit('notification', {
      level,
      message: `Error in ${context.source}: ${error.message}`,
      error,
      context,
      timestamp: Date.now()
    });
    
    return true;
  }

  /**
   * Handle shutdown action (for critical errors)
   */
  private async handleShutdownAction(
    action: ErrorRecoveryAction,
    error: Error,
    context: ErrorContext
  ): Promise<boolean> {
    console.error('[ErrorHandler] CRITICAL: Initiating graceful shutdown');
    
    this.emit('shutdown', { error, context, reason: 'Critical error recovery' });
    
    // Allow time for cleanup
    setTimeout(() => {
      process.exit(1);
    }, 5000);
    
    return true;
  }

  /**
   * Handle unknown errors without patterns
   */
  private handleUnknownError(error: Error, context: ErrorContext): boolean {
    console.warn(`[ErrorHandler] No pattern found for error in ${context.source}`);
    
    // Default handling based on severity
    if (context.severity === 'critical') {
      this.emit('criticalUnknownError', { error, context });
      return false;
    }
    
    // Log and continue for non-critical unknown errors
    this.emit('unknownError', { error, context });
    return true;
  }

  /**
   * Escalate error to higher level handling
   */
  private escalateError(error: Error, context: ErrorContext, pattern: ErrorPattern): void {
    console.error(`[ErrorHandler] ESCALATING: Pattern ${pattern.id} failed recovery`);
    
    this.emit('escalation', {
      error,
      context,
      pattern: pattern.id,
      timestamp: Date.now(),
      errorHistory: this.getRecentErrors(context.source, 10)
    });
  }

  /**
   * Get recent errors for a specific source
   */
  getRecentErrors(source: string, limit: number = 50): Array<{error: Error, context: ErrorContext}> {
    return this.errorHistory
      .filter(entry => entry.context.source === source)
      .slice(-limit);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    bySource: Record<string, number>;
    recentErrors: number;
  } {
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    
    const bySeverity = { low: 0, medium: 0, high: 0, critical: 0 };
    const bySource = { websocket: 0, ai: 0, game: 0, performance: 0, auth: 0, database: 0 };
    let recentErrors = 0;
    
    for (const entry of this.errorHistory) {
      bySeverity[entry.context.severity]++;
      bySource[entry.context.source]++;
      
      if (now - entry.context.timestamp < hour) {
        recentErrors++;
      }
    }
    
    return {
      total: this.errorHistory.length,
      bySeverity,
      bySource,
      recentErrors
    };
  }

  /**
   * Clear error history (for testing or maintenance)
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
    this.errorCounts.clear();
    this.activeRetries.clear();
    console.log('[ErrorHandler] Error history cleared');
  }
}