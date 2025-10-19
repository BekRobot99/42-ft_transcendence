/**
 * @fileoverview Edge Case Handler for Game Physics and WebSocket Systems
 * 
 * Comprehensive edge case handling for production deployment including
 * boundary conditions, network issues, and unusual game states.
 * 
 * @author ft_transcendence Team
 * @version 2.0.0
 */

export interface EdgeCaseResult {
  /** Whether the edge case was handled successfully */
  handled: boolean;
  /** Corrective action taken */
  action?: string;
  /** New corrected value */
  correctedValue?: any;
  /** Whether to continue processing */
  shouldContinue: boolean;
  /** Warning message if applicable */
  warning?: string;
}

/**
 * Edge case handler for game physics and system boundaries
 */
export class EdgeCaseHandler {
  /** Game canvas dimensions for boundary checks */
  private canvasBounds = { width: 800, height: 400 };
  /** Physics constants for validation */
  private physicsLimits = {
    maxVelocity: 15,
    minVelocity: 0.1,
    maxPaddleSpeed: 8,
    ballRadius: 10,
    paddleHeight: 100,
    paddleWidth: 10
  };

  /**
   * Handle ball position edge cases
   */
  handleBallPosition(ball: { x: number; y: number; velocityX: number; velocityY: number }): EdgeCaseResult {
    let corrected = false;
    const originalBall = { ...ball };

    // Handle ball going out of bounds horizontally
    if (ball.x < 0 || ball.x > this.canvasBounds.width) {
      ball.x = Math.max(this.physicsLimits.ballRadius, 
                       Math.min(this.canvasBounds.width - this.physicsLimits.ballRadius, ball.x));
      ball.velocityX = -ball.velocityX * 0.8; // Reduce velocity on bounce
      corrected = true;
    }

    // Handle ball going out of bounds vertically
    if (ball.y < this.physicsLimits.ballRadius || ball.y > this.canvasBounds.height - this.physicsLimits.ballRadius) {
      ball.y = Math.max(this.physicsLimits.ballRadius, 
                       Math.min(this.canvasBounds.height - this.physicsLimits.ballRadius, ball.y));
      ball.velocityY = -ball.velocityY * 0.8;
      corrected = true;
    }

    // Handle extreme velocities
    const speed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2);
    if (speed > this.physicsLimits.maxVelocity) {
      const scale = this.physicsLimits.maxVelocity / speed;
      ball.velocityX *= scale;
      ball.velocityY *= scale;
      corrected = true;
    } else if (speed < this.physicsLimits.minVelocity && speed > 0) {
      const scale = this.physicsLimits.minVelocity / speed;
      ball.velocityX *= scale;
      ball.velocityY *= scale;
      corrected = true;
    }

    // Handle NaN or infinite values
    if (!isFinite(ball.x) || !isFinite(ball.y) || !isFinite(ball.velocityX) || !isFinite(ball.velocityY)) {
      console.error('[EdgeCaseHandler] Invalid ball physics detected, resetting to center');
      ball.x = this.canvasBounds.width / 2;
      ball.y = this.canvasBounds.height / 2;
      ball.velocityX = 3;
      ball.velocityY = 2;
      corrected = true;
      
      return {
        handled: true,
        action: 'Ball physics reset due to invalid values',
        correctedValue: ball,
        shouldContinue: true,
        warning: 'Ball position contained invalid values and was reset'
      };
    }

    if (corrected) {
      console.log(`[EdgeCaseHandler] Ball position corrected: ${JSON.stringify(originalBall)} -> ${JSON.stringify(ball)}`);
    }

    return {
      handled: corrected,
      action: corrected ? 'Ball position and velocity corrected' : undefined,
      correctedValue: corrected ? ball : undefined,
      shouldContinue: true
    };
  }

  /**
   * Handle paddle position edge cases
   */
  handlePaddlePosition(paddle: { y: number; height?: number; speed?: number }, playerId: string): EdgeCaseResult {
    let corrected = false;
    const originalY = paddle.y;
    const height = paddle.height || this.physicsLimits.paddleHeight;

    // Handle paddle going out of bounds
    if (paddle.y < 0) {
      paddle.y = 0;
      corrected = true;
    } else if (paddle.y + height > this.canvasBounds.height) {
      paddle.y = this.canvasBounds.height - height;
      corrected = true;
    }

    // Handle NaN or infinite values
    if (!isFinite(paddle.y)) {
      console.error(`[EdgeCaseHandler] Invalid paddle position for player ${playerId}, resetting`);
      paddle.y = (this.canvasBounds.height - height) / 2;
      corrected = true;
      
      return {
        handled: true,
        action: 'Paddle position reset due to invalid value',
        correctedValue: paddle,
        shouldContinue: true,
        warning: `Paddle position for player ${playerId} contained invalid value and was reset`
      };
    }

    // Handle extreme speed values
    if (paddle.speed !== undefined) {
      if (Math.abs(paddle.speed) > this.physicsLimits.maxPaddleSpeed) {
        paddle.speed = Math.sign(paddle.speed) * this.physicsLimits.maxPaddleSpeed;
        corrected = true;
      }
    }

    if (corrected) {
      console.log(`[EdgeCaseHandler] Paddle ${playerId} position corrected: ${originalY} -> ${paddle.y}`);
    }

    return {
      handled: corrected,
      action: corrected ? `Paddle ${playerId} position corrected` : undefined,
      correctedValue: corrected ? paddle : undefined,
      shouldContinue: true
    };
  }

  /**
   * Handle AI decision edge cases
   */
  handleAIDecision(decision: { action: string; timestamp: number; confidence?: number }, gameState: any): EdgeCaseResult {
    // Handle invalid action types
    const validActions = ['up', 'down', 'stay'];
    if (!validActions.includes(decision.action)) {
      console.warn(`[EdgeCaseHandler] Invalid AI action: ${decision.action}, defaulting to 'stay'`);
      decision.action = 'stay';
      
      return {
        handled: true,
        action: 'AI decision corrected to valid action',
        correctedValue: decision,
        shouldContinue: true,
        warning: 'Invalid AI action was corrected'
      };
    }

    // Handle stale decisions (older than 100ms)
    const age = Date.now() - decision.timestamp;
    if (age > 100) {
      console.warn(`[EdgeCaseHandler] Stale AI decision detected (age: ${age}ms), ignoring`);
      
      return {
        handled: true,
        action: 'Stale AI decision ignored',
        shouldContinue: false,
        warning: 'AI decision was too old and was ignored'
      };
    }

    // Handle invalid confidence values
    if (decision.confidence !== undefined) {
      if (!isFinite(decision.confidence) || decision.confidence < 0 || decision.confidence > 1) {
        decision.confidence = 0.5; // Default confidence
        
        return {
          handled: true,
          action: 'AI confidence corrected to default value',
          correctedValue: decision,
          shouldContinue: true,
          warning: 'Invalid AI confidence was corrected'
        };
      }
    }

    return { handled: false, shouldContinue: true };
  }

  /**
   * Handle WebSocket message edge cases
   */
  handleWebSocketMessage(message: any, connectionId: string): EdgeCaseResult {
    // Handle malformed JSON
    if (typeof message === 'string') {
      try {
        message = JSON.parse(message);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown JSON parsing error';
        console.error(`[EdgeCaseHandler] Malformed JSON from connection ${connectionId}: ${errorMessage}`);
        
        return {
          handled: true,
          action: 'Malformed message rejected',
          shouldContinue: false,
          warning: 'Message contained invalid JSON'
        };
      }
    }

    // Handle missing required fields
    if (!message.event && !message.type) {
      console.warn(`[EdgeCaseHandler] Message missing event/type from connection ${connectionId}`);
      
      return {
        handled: true,
        action: 'Message missing required fields',
        shouldContinue: false,
        warning: 'Message missing event or type field'
      };
    }

    // Handle oversized messages
    const messageSize = JSON.stringify(message).length;
    if (messageSize > 10000) { // 10KB limit
      console.warn(`[EdgeCaseHandler] Oversized message from connection ${connectionId}: ${messageSize} bytes`);
      
      return {
        handled: true,
        action: 'Oversized message rejected',
        shouldContinue: false,
        warning: 'Message exceeded size limit'
      };
    }

    // Handle invalid timestamp
    if (message.timestamp && (!isFinite(message.timestamp) || message.timestamp < 0)) {
      message.timestamp = Date.now();
      
      return {
        handled: true,
        action: 'Invalid timestamp corrected',
        correctedValue: message,
        shouldContinue: true,
        warning: 'Invalid timestamp was corrected to current time'
      };
    }

    return { handled: false, shouldContinue: true };
  }

  /**
   * Handle game state validation edge cases
   */
  handleGameState(gameState: any): EdgeCaseResult {
    let corrected = false;
    const corrections: string[] = [];

    // Validate and correct ball state
    if (gameState.ball) {
      const ballResult = this.handleBallPosition(gameState.ball);
      if (ballResult.handled) {
        corrected = true;
        corrections.push('ball position');
      }
    }

    // Validate and correct paddle states
    if (gameState.paddles) {
      for (const [playerId, paddle] of Object.entries(gameState.paddles)) {
        const paddleResult = this.handlePaddlePosition(paddle as any, playerId);
        if (paddleResult.handled) {
          corrected = true;
          corrections.push(`${playerId} paddle`);
        }
      }
    }

    // Validate score
    if (gameState.score) {
      for (const [player, score] of Object.entries(gameState.score)) {
        if (!isFinite(score as number) || (score as number) < 0) {
          (gameState.score as any)[player] = 0;
          corrected = true;
          corrections.push(`${player} score`);
        }
      }
    }

    // Validate game timing
    if (gameState.lastUpdate && (!isFinite(gameState.lastUpdate) || gameState.lastUpdate < 0)) {
      gameState.lastUpdate = Date.now();
      corrected = true;
      corrections.push('last update timestamp');
    }

    if (corrected) {
      console.log(`[EdgeCaseHandler] Game state corrected: ${corrections.join(', ')}`);
    }

    return {
      handled: corrected,
      action: corrected ? `Corrected: ${corrections.join(', ')}` : undefined,
      correctedValue: corrected ? gameState : undefined,
      shouldContinue: true
    };
  }

  /**
   * Handle performance monitoring edge cases
   */
  handlePerformanceMetric(metric: { value: number; timestamp: number; category?: string }): EdgeCaseResult {
    let corrected = false;
    const originalValue = metric.value;

    // Handle invalid values
    if (!isFinite(metric.value) || metric.value < 0) {
      console.warn(`[EdgeCaseHandler] Invalid performance metric value: ${originalValue}`);
      
      return {
        handled: true,
        action: 'Invalid performance metric rejected',
        shouldContinue: false,
        warning: 'Performance metric contained invalid value'
      };
    }

    // Handle extreme values based on category
    if (metric.category) {
      switch (metric.category) {
        case 'cpu':
          if (metric.value > 100) {
            metric.value = 100;
            corrected = true;
          }
          break;
        case 'memory':
          if (metric.value > 16 * 1024) { // 16GB limit
            metric.value = 16 * 1024;
            corrected = true;
          }
          break;
        case 'fps':
          if (metric.value > 120 || metric.value < 0) {
            metric.value = Math.max(0, Math.min(120, metric.value));
            corrected = true;
          }
          break;
      }
    }

    // Handle invalid timestamps
    if (!isFinite(metric.timestamp) || metric.timestamp < 0) {
      metric.timestamp = Date.now();
      corrected = true;
    }

    if (corrected) {
      console.log(`[EdgeCaseHandler] Performance metric corrected: ${originalValue} -> ${metric.value}`);
    }

    return {
      handled: corrected,
      action: corrected ? 'Performance metric value corrected' : undefined,
      correctedValue: corrected ? metric : undefined,
      shouldContinue: true
    };
  }

  /**
   * Handle connection timeout edge cases
   */
  handleConnectionTimeout(connectionId: string, lastActivity: number): EdgeCaseResult {
    const now = Date.now();
    const inactiveTime = now - lastActivity;
    const timeoutThreshold = 30000; // 30 seconds

    if (inactiveTime > timeoutThreshold) {
      console.log(`[EdgeCaseHandler] Connection ${connectionId} timed out after ${inactiveTime}ms`);
      
      return {
        handled: true,
        action: 'Connection timeout detected',
        shouldContinue: false,
        warning: 'Connection exceeded timeout threshold'
      };
    }

    return { handled: false, shouldContinue: true };
  }

  /**
   * Handle memory usage edge cases
   */
  handleMemoryUsage(): EdgeCaseResult {
    const memUsage = process.memoryUsage();
    const maxMemory = 1024 * 1024 * 1024; // 1GB limit
    
    if (memUsage.heapUsed > maxMemory) {
      console.warn(`[EdgeCaseHandler] High memory usage detected: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('[EdgeCaseHandler] Forced garbage collection');
      }
      
      return {
        handled: true,
        action: 'Memory cleanup initiated',
        shouldContinue: true,
        warning: 'High memory usage detected and cleanup initiated'
      };
    }

    return { handled: false, shouldContinue: true };
  }

  /**
   * Update canvas bounds (for dynamic resizing)
   */
  updateCanvasBounds(width: number, height: number): void {
    if (width > 0 && height > 0 && isFinite(width) && isFinite(height)) {
      this.canvasBounds = { width, height };
      console.log(`[EdgeCaseHandler] Canvas bounds updated: ${width}x${height}`);
    } else {
      console.warn('[EdgeCaseHandler] Invalid canvas bounds provided, keeping current values');
    }
  }

  /**
   * Update physics limits (for game balance adjustments)
   */
  updatePhysicsLimits(limits: Partial<typeof EdgeCaseHandler.prototype.physicsLimits>): void {
    for (const [key, value] of Object.entries(limits)) {
      if (typeof value === 'number' && isFinite(value) && value > 0) {
        (this.physicsLimits as any)[key] = value;
      }
    }
    console.log('[EdgeCaseHandler] Physics limits updated:', this.physicsLimits);
  }
}