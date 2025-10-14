/**
 * Ball Physics Engine for Pong Game
 * 
 * Handles ball movement, collision detection, and physics simulation
 * Designed to work with AI player predictions and realistic gameplay
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface PhysicsConfig {
  gravity: number;
  friction: number;
  maxSpeed: number;
  minSpeed: number;
  speedIncreaseFactor: number;
  wallBounceDamping: number;
  paddleBounceDamping: number;
}

export interface CollisionResult {
  hasCollision: boolean;
  newVelocity: Vector2D;
  collisionPoint: Vector2D;
  collisionType: 'wall' | 'paddle' | 'none';
  bounceAngle?: number;
}

export interface BallState {
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  lastCollisionTime: number;
}

export interface PaddlePhysics {
  x: number;
  y: number;
  width: number;
  height: number;
  velocity: Vector2D;
}

export class BallPhysicsEngine {
  private config: PhysicsConfig;
  
  constructor(config?: Partial<PhysicsConfig>) {
    this.config = {
      gravity: 0,           // No gravity in classic pong
      friction: 0.999,      // Very slight friction to prevent infinite acceleration
      maxSpeed: 12,         // Maximum ball speed
      minSpeed: 2,          // Minimum ball speed
      speedIncreaseFactor: 1.05, // Speed increase per paddle hit
      wallBounceDamping: 0.95,   // Energy loss on wall collision
      paddleBounceDamping: 1.02, // Energy gain on paddle collision
      ...config
    };
  }

  /**
   * Update ball physics for one frame
   */
  updateBallPhysics(ball: BallState, canvasWidth: number, canvasHeight: number, deltaTime: number): BallState {
    const updatedBall = { ...ball };
    
    // Apply physics forces
    updatedBall.velocity = this.applyPhysicsForces(updatedBall.velocity, deltaTime);
    
    // Update position based on velocity
    updatedBall.position.x += updatedBall.velocity.x * deltaTime;
    updatedBall.position.y += updatedBall.velocity.y * deltaTime;
    
    // Check and handle wall collisions
    const wallCollision = this.checkWallCollisions(updatedBall, canvasWidth, canvasHeight);
    if (wallCollision.hasCollision) {
      updatedBall.velocity = wallCollision.newVelocity;
      updatedBall.position = this.constrainBallPosition(updatedBall.position, updatedBall.radius, canvasWidth, canvasHeight);
      updatedBall.lastCollisionTime = Date.now();
    }
    
    return updatedBall;
  }

  /**
   * Check collision between ball and paddle
   */
  checkPaddleCollision(ball: BallState, paddle: PaddlePhysics): CollisionResult {
    const ballLeft = ball.position.x - ball.radius;
    const ballRight = ball.position.x + ball.radius;
    const ballTop = ball.position.y - ball.radius;
    const ballBottom = ball.position.y + ball.radius;
    
    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + paddle.width;
    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;
    
    // Check for overlap
    const hasOverlap = (ballRight > paddleLeft && ballLeft < paddleRight) &&
                      (ballBottom > paddleTop && ballTop < paddleBottom);
    
    if (!hasOverlap) {
      return { hasCollision: false, newVelocity: ball.velocity, collisionPoint: { x: 0, y: 0 }, collisionType: 'none' };
    }
    
    // Calculate collision point and new velocity
    const collisionY = Math.max(paddleTop, Math.min(paddleBottom, ball.position.y));
    const collisionPoint = { x: ball.position.x > paddle.x + paddle.width / 2 ? paddleRight : paddleLeft, y: collisionY };
    
    // Calculate bounce angle based on hit position
    const hitPosition = (collisionY - paddle.y) / paddle.height; // 0 to 1
    const normalizedHit = (hitPosition - 0.5) * 2; // -1 to 1
    const maxBounceAngle = Math.PI / 3; // 60 degrees max
    const bounceAngle = normalizedHit * maxBounceAngle;
    
    // Calculate new velocity with enhanced physics
    const speed = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);
    const newSpeed = Math.min(this.config.maxSpeed, speed * this.config.paddleBounceDamping);
    
    const direction = ball.position.x > paddle.x + paddle.width / 2 ? 1 : -1;
    const newVelocity: Vector2D = {
      x: direction * newSpeed * Math.cos(bounceAngle),
      y: newSpeed * Math.sin(bounceAngle)
    };
    
    // Add paddle velocity influence
    newVelocity.y += paddle.velocity.y * 0.3;
    
    return {
      hasCollision: true,
      newVelocity,
      collisionPoint,
      collisionType: 'paddle',
      bounceAngle: bounceAngle * (180 / Math.PI) // Convert to degrees
    };
  }

  /**
   * Apply physics forces like friction and speed limits
   */
  private applyPhysicsForces(velocity: Vector2D, deltaTime: number): Vector2D {
    let newVelocity = { ...velocity };
    
    // Apply friction
    newVelocity.x *= this.config.friction;
    newVelocity.y *= this.config.friction;
    
    // Apply gravity (usually 0 for pong)
    newVelocity.y += this.config.gravity * deltaTime;
    
    // Enforce speed limits
    const currentSpeed = Math.sqrt(newVelocity.x * newVelocity.x + newVelocity.y * newVelocity.y);
    
    if (currentSpeed > this.config.maxSpeed) {
      const scale = this.config.maxSpeed / currentSpeed;
      newVelocity.x *= scale;
      newVelocity.y *= scale;
    } else if (currentSpeed < this.config.minSpeed && currentSpeed > 0) {
      const scale = this.config.minSpeed / currentSpeed;
      newVelocity.x *= scale;
      newVelocity.y *= scale;
    }
    
    return newVelocity;
  }

  /**
   * Check for wall collisions and calculate bounce
   */
  private checkWallCollisions(ball: BallState, canvasWidth: number, canvasHeight: number): CollisionResult {
    const newVelocity = { ...ball.velocity };
    let hasCollision = false;
    let collisionType: 'wall' | 'paddle' | 'none' = 'none';
    const collisionPoint = { x: ball.position.x, y: ball.position.y };
    
    // Top wall collision
    if (ball.position.y - ball.radius <= 0) {
      newVelocity.y = Math.abs(newVelocity.y) * this.config.wallBounceDamping;
      collisionPoint.y = ball.radius;
      hasCollision = true;
      collisionType = 'wall';
    }
    
    // Bottom wall collision
    if (ball.position.y + ball.radius >= canvasHeight) {
      newVelocity.y = -Math.abs(newVelocity.y) * this.config.wallBounceDamping;
      collisionPoint.y = canvasHeight - ball.radius;
      hasCollision = true;
      collisionType = 'wall';
    }
    
    return { hasCollision, newVelocity, collisionPoint, collisionType };
  }

  /**
   * Constrain ball position within canvas bounds
   */
  private constrainBallPosition(position: Vector2D, radius: number, canvasWidth: number, canvasHeight: number): Vector2D {
    return {
      x: Math.max(radius, Math.min(canvasWidth - radius, position.x)),
      y: Math.max(radius, Math.min(canvasHeight - radius, position.y))
    };
  }

  /**
   * Predict ball trajectory for AI calculations
   */
  predictTrajectory(ball: BallState, canvasWidth: number, canvasHeight: number, timeSteps: number, deltaTime: number = 16.67): Vector2D[] {
    const trajectory: Vector2D[] = [];
    let currentBall = { ...ball };
    
    for (let i = 0; i < timeSteps; i++) {
      currentBall = this.updateBallPhysics(currentBall, canvasWidth, canvasHeight, deltaTime);
      trajectory.push({ ...currentBall.position });
      
      // Break if ball goes off screen (scored)
      if (currentBall.position.x < 0 || currentBall.position.x > canvasWidth) {
        break;
      }
    }
    
    return trajectory;
  }

  /**
   * Calculate optimal paddle position to intercept ball
   */
  calculateInterceptionPoint(ball: BallState, paddleX: number, canvasWidth: number, canvasHeight: number): { y: number; time: number; confidence: number } {
    const trajectory = this.predictTrajectory(ball, canvasWidth, canvasHeight, 100);
    
    for (let i = 0; i < trajectory.length; i++) {
      const point = trajectory[i];
      
      // Check if ball is near paddle X position
      if (Math.abs(point.x - paddleX) < 20) {
        const time = i * 16.67; // milliseconds
        const confidence = Math.max(0, 1 - (i / trajectory.length)); // Higher confidence for sooner predictions
        
        return { y: point.y, time, confidence };
      }
    }
    
    // Fallback: linear prediction
    const timeToReach = Math.abs(paddleX - ball.position.x) / Math.abs(ball.velocity.x);
    const predictedY = ball.position.y + (ball.velocity.y * timeToReach);
    
    return { y: predictedY, time: timeToReach, confidence: 0.5 };
  }

  /**
   * Get current physics configuration
   */
  getConfig(): PhysicsConfig {
    return { ...this.config };
  }

  /**
   * Update physics configuration
   */
  updateConfig(newConfig: Partial<PhysicsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}