/**
 * Game State Synchronizer Service
 * 
 * Manages synchronization between human player controls and AI paddle movements
 * Ensures smooth gameplay and prevents control conflicts
 */

export interface PlayerState {
  id: string;
  type: 'human' | 'ai';
  paddlePosition: { x: number; y: number };
  velocity: { x: number; y: number };
  inputBuffer: PlayerInput[];
  lastInputTime: number;
  side: 'left' | 'right';
}

export interface PlayerInput {
  action: 'up' | 'down' | 'none';
  timestamp: number;
  source: 'keyboard' | 'ai';
  intensity?: number; // For smooth movement
  duration?: number; // Input hold time
}

export interface SynchronizedGameState {
  players: {
    player1: PlayerState;
    player2: PlayerState;
  };
  ball: {
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    lastUpdate: number;
  };
  canvas: {
    width: number;
    height: number;
  };
  gameActive: boolean;
  syncTimestamp: number;
}

export class GameSynchronizer {
  private gameState: SynchronizedGameState;
  private readonly INPUT_BUFFER_SIZE = 10;
  private readonly SYNC_INTERVAL = 16; // 60 FPS sync
  private readonly MAX_VELOCITY = 8; // Max paddle velocity
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.gameState = {
      players: {
        player1: {
          id: 'human',
          type: 'human',
          paddlePosition: { x: 10, y: canvasHeight / 2 - 50 },
          velocity: { x: 0, y: 0 },
          inputBuffer: [],
          lastInputTime: 0,
          side: 'left'
        },
        player2: {
          id: 'ai',
          type: 'ai',
          paddlePosition: { x: canvasWidth - 20, y: canvasHeight / 2 - 50 },
          velocity: { x: 0, y: 0 },
          inputBuffer: [],
          lastInputTime: 0,
          side: 'right'
        }
      },
      ball: {
        position: { x: canvasWidth / 2, y: canvasHeight / 2 },
        velocity: { x: 3, y: 3 },
        lastUpdate: Date.now()
      },
      canvas: {
        width: canvasWidth,
        height: canvasHeight
      },
      gameActive: true,
      syncTimestamp: Date.now()
    };
  }

  /**
   * Start synchronization loop for smooth gameplay
   */
  startSync(onSync: (state: SynchronizedGameState) => void): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.updateGameState();
      onSync(this.gameState);
    }, this.SYNC_INTERVAL);

    console.log('Game synchronizer started');
  }

  /**
   * Stop synchronization
   */
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log('Game synchronizer stopped');
  }

  /**
   * Add player input to buffer for smooth processing
   */
  addPlayerInput(playerId: 'player1' | 'player2', input: PlayerInput): void {
    const player = this.gameState.players[playerId];
    
    // Add to input buffer
    player.inputBuffer.push(input);
    
    // Keep buffer size manageable
    if (player.inputBuffer.length > this.INPUT_BUFFER_SIZE) {
      player.inputBuffer.shift();
    }
    
    player.lastInputTime = input.timestamp;
  }

  /**
   * Update paddle position based on input
   */
  updatePaddlePosition(playerId: 'player1' | 'player2', newY: number): void {
    const player = this.gameState.players[playerId];
    const paddleHeight = 100; // Standard paddle height
    
    // Smooth position interpolation
    const targetY = Math.max(0, Math.min(this.gameState.canvas.height - paddleHeight, newY));
    const currentY = player.paddlePosition.y;
    
    // Calculate smooth movement
    const deltaY = targetY - currentY;
    const maxMove = this.MAX_VELOCITY;
    
    if (Math.abs(deltaY) > maxMove) {
      player.paddlePosition.y = currentY + (deltaY > 0 ? maxMove : -maxMove);
      player.velocity.y = deltaY > 0 ? maxMove : -maxMove;
    } else {
      player.paddlePosition.y = targetY;
      player.velocity.y = deltaY;
    }
  }

  /**
   * Process input buffer for smooth movement
   */
  private updateGameState(): void {
    const now = Date.now();
    const deltaTime = (now - this.gameState.syncTimestamp) / 1000;
    
    // Process both players
    ['player1', 'player2'].forEach(playerId => {
      const player = this.gameState.players[playerId as keyof typeof this.gameState.players];
      
      // Process input buffer
      const activeInputs = player.inputBuffer.filter(input => 
        now - input.timestamp < 100 // Only consider recent inputs
      );
      
      if (activeInputs.length > 0) {
        // Apply most recent input
        const latestInput = activeInputs[activeInputs.length - 1];
        this.processPlayerInput(playerId as 'player1' | 'player2', latestInput, deltaTime);
      } else {
        // Apply velocity decay when no input
        player.velocity.y *= 0.8; // Smooth deceleration
        if (Math.abs(player.velocity.y) < 0.1) {
          player.velocity.y = 0;
        }
      }
      
      // Update position based on velocity
      player.paddlePosition.y += player.velocity.y;
      
      // Ensure paddle stays within bounds
      const paddleHeight = 100;
      player.paddlePosition.y = Math.max(0, 
        Math.min(this.gameState.canvas.height - paddleHeight, player.paddlePosition.y)
      );
      
      // Clear old inputs from buffer
      player.inputBuffer = player.inputBuffer.filter(input => 
        now - input.timestamp < 200
      );
    });
    
    this.gameState.syncTimestamp = now;
  }

  /**
   * Process individual player input for movement
   */
  private processPlayerInput(playerId: 'player1' | 'player2', input: PlayerInput, deltaTime: number): void {
    const player = this.gameState.players[playerId];
    const speed = this.MAX_VELOCITY;
    
    switch (input.action) {
      case 'up':
        player.velocity.y = Math.max(player.velocity.y - (speed * deltaTime * 60), -speed);
        break;
      case 'down':
        player.velocity.y = Math.min(player.velocity.y + (speed * deltaTime * 60), speed);
        break;
      case 'none':
        // Gradual deceleration
        player.velocity.y *= 0.9;
        break;
    }
  }

  /**
   * Get current game state
   */
  getGameState(): SynchronizedGameState {
    return { ...this.gameState };
  }

  /**
   * Update ball position (called from game logic)
   */
  updateBallPosition(position: { x: number; y: number }, velocity: { x: number; y: number }): void {
    this.gameState.ball.position = { ...position };
    this.gameState.ball.velocity = { ...velocity };
    this.gameState.ball.lastUpdate = Date.now();
  }

  /**
   * Get interpolated player position for smooth rendering
   */
  getInterpolatedPlayerState(playerId: 'player1' | 'player2', clientTime: number): PlayerState {
    const player = this.gameState.players[playerId];
    const timeDiff = (clientTime - this.gameState.syncTimestamp) / 1000;
    
    // Predict position based on velocity
    const predictedY = player.paddlePosition.y + (player.velocity.y * timeDiff);
    const paddleHeight = 100;
    const clampedY = Math.max(0, Math.min(this.gameState.canvas.height - paddleHeight, predictedY));
    
    return {
      ...player,
      paddlePosition: {
        ...player.paddlePosition,
        y: clampedY
      }
    };
  }

  /**
   * Reset game state
   */
  reset(): void {
    const { width, height } = this.gameState.canvas;
    
    this.gameState.players.player1.paddlePosition.y = height / 2 - 50;
    this.gameState.players.player2.paddlePosition.y = height / 2 - 50;
    this.gameState.players.player1.velocity = { x: 0, y: 0 };
    this.gameState.players.player2.velocity = { x: 0, y: 0 };
    this.gameState.ball.position = { x: width / 2, y: height / 2 };
    this.gameState.ball.velocity = { x: 3, y: 3 };
    
    // Clear input buffers
    this.gameState.players.player1.inputBuffer = [];
    this.gameState.players.player2.inputBuffer = [];
  }
}