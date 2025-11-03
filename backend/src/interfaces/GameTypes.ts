/**
 * Game-related type definitions and interfaces
 * Used for multiplayer Pong games including AI opponents
 */

export interface Player {
  id: string;
  username: string;
  isAI: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  score: number;
  paddleY: number;
  ready: boolean;
}

export interface GameRoom {
  id: string;
  players: Player[];
  gameState: GameSessionState;
  createdAt: Date;
  lastActivity: Date;
  gameType: 'classic' | 'ai' | 'tournament';
  status: 'waiting' | 'starting' | 'playing' | 'paused' | 'finished';
}

export interface GameSessionState {
  ball: {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    speed: number;
  };
  canvas: {
    width: number;
    height: number;
  };
  paddles: {
    player1: PaddleState;
    player2: PaddleState;
  };
  score: {
    player1: number;
    player2: number;
  };
  gameActive: boolean;
  isPaused: boolean;
  winner?: string;
  startTime?: Date;
  lastUpdate: number;
}

export interface PaddleState {
  y: number;
  height: number;
  width: number;
  speed: number;
}

export interface GameControls {
  up: boolean;
  down: boolean;
  playerId: string;
}

export interface AIGameConfig {
  difficulty: 'easy' | 'medium' | 'hard';
  playerSide: 'left' | 'right';
  gameSpeed: number;
  paddleSize: 'small' | 'normal' | 'large';
  enablePowerUps: boolean;
}

export interface PowerUp {
  id: string;
  type: 'speed_boost' | 'paddle_size' | 'multi_ball' | 'slow_motion';
  x: number;
  y: number;
  active: boolean;
  duration: number;
  effect: {
    ballSpeed?: number;
    paddleHeight?: number;
    gameSpeed?: number;
  };
}

export interface GameEvent {
  type: 'game_start' | 'game_end' | 'score' | 'paddle_move' | 'ball_hit' | 'powerup_spawn' | 'powerup_collect';
  playerId?: string;
  timestamp: number;
  data: any;
}

export interface AIPlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  averageReactionTime: number;
  difficulty: string;
  totalPlayTime: number;
  lastPlayed: Date;
}

export interface GameResults {
  gameId: string;
  players: {
    player1: { id: string; score: number; isAI: boolean };
    player2: { id: string; score: number; isAI: boolean };
  };
  winner: string;
  duration: number;
  finalScore: { player1: number; player2: number };
  endReason: 'completed' | 'forfeit' | 'disconnected';
  timestamp: Date;
}

export interface AIDecisionContext {
  gameState: GameSessionState;
  playerSide: 'left' | 'right';
  difficulty: AIGameConfig['difficulty'];
  lastDecisionTime: number;
  reactionDelay: number;
}

export interface GameSettings {
  ballSpeed: number;
  paddleSpeed: number;
  winningScore: number;
  enableAI: boolean;
  aiDifficulty: 'easy' | 'medium' | 'hard';
  gameMode: 'classic' | 'powerups' | 'tournament';
  timeLimit?: number;
}

// WebSocket event types for real-time gameplay
export type GameSocketEvent = 
  | 'join_game'
  | 'leave_game' 
  | 'paddle_move'
  | 'game_state_update'
  | 'player_ready'
  | 'game_start'
  | 'game_pause'
  | 'game_resume'
  | 'game_end'
  | 'ai_move'
  | 'ai_performance_stats'
  | 'reset_ai_stats'
  | 'powerup_activate'
  | 'chat_message'
  | 'ai_keyboard'
  | 'ai_start'
  | 'ai_stop'
  | 'ai_difficulty'
  | 'ai_status_request'
  | 'physics_update'
  | 'score_update'
  | 'ball_scored'
  | 'thinking_started'
  | 'thinking_completed'
  | 'ai_reaction'
  | 'validate_state'
  | 'request_state_sync';

export interface GameSocketMessage {
  event: GameSocketEvent;
  gameId: string;
  playerId: string;
  timestamp: number;
  data: any;
}

// AI-specific event types
export interface AIKeyboardEvent {
  action: 'up' | 'down' | 'none';
  player: 'ai';
  timestamp: number;
  difficulty: string;
  inputType?: 'press' | 'hold' | 'release' | 'correction' | 'double_tap';
  holdDuration?: number;
  reactionDelay?: number;
}

export interface KeyboardSimulationMetrics {
  totalKeyPresses: number;
  averageHoldTime: number;
  jitterEvents: number;
  doubleTaps: number;
  correctionInputs: number;
  humanlikeScore: number; // 0-100 score of how human-like the input patterns are
}

export interface AIActivationEvent {
  difficulty: string;
  gameId: string;
  playerSide: 'left' | 'right';
}

export interface DifficultyChangeEvent {
  newDifficulty: 'easy' | 'medium' | 'hard';
  gameId: string;
  timestamp: number;
}

// Physics-related interfaces
export interface PhysicsUpdateEvent {
  ballPosition: { x: number; y: number };
  ballVelocity: { x: number; y: number };
  timestamp: number;
  collisionData?: {
    type: 'wall' | 'paddle' | 'none';
    point: { x: number; y: number };
    angle?: number;
  };
}

export interface GamePhysicsState {
  ballPhysics: {
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    radius: number;
    lastCollisionTime: number;
  };
  paddlePhysics: {
    player1: { x: number; y: number; width: number; height: number; velocity: { x: number; y: number } };
    player2: { x: number; y: number; width: number; height: number; velocity: { x: number; y: number } };
  };
  physicsConfig: {
    gravity: number;
    friction: number;
    maxSpeed: number;
    minSpeed: number;
    speedIncreaseFactor: number;
  };
}

// Scoring and game event interfaces
export interface ScoreUpdateEvent {
  scorer: 'human' | 'ai';
  newScore: { human: number; ai: number };
  scoringTime: number;
  gameId: string;
}

export interface BallScoredEvent {
  side: 'left' | 'right';
  ballPosition: { x: number; y: number };
  ballVelocity: { x: number; y: number };
  paddleState: {
    y: number;
    height: number;
    velocity: number;
  };
  gameContext: {
    score: { player1: number; player2: number };
    elapsedTime: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

export interface GameEndEvent {
  winner: 'human' | 'ai';
  finalScore: { player1: number; player2: number };
  gameDuration: number;
  totalRallies: number;
  averageRallyLength: number;
}

// AI Visual Indicator Events
export interface AIThinkingStartedEvent {
  gameId: string;
  timestamp: number;
  ballPosition: { x: number; y: number };
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AIThinkingCompletedEvent {
  gameId: string;
  timestamp: number;
  decision: 'up' | 'down' | 'none';
  targetPosition: number;
  confidence: number;
  processingTime: number;
}

export interface AIReactionEvent {
  gameId: string;
  reactionType: 'move_up' | 'move_down';
  intensity: 'active' | 'idle';
  reactionTime: number;
  timestamp: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// State Validation Events
export interface StateValidationRequest {
  gameId: string;
  gameState: GameSessionState;
  requestId?: string;
  timestamp: number;
}

export interface StateValidationResult {
  gameId: string;
  requestId?: string;
  isValid: boolean;
  errors: Array<{
    code: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    field: string;
  }>;
  warnings: Array<{
    code: string;
    message: string;
    field: string;
  }>;
  timestamp: number;
}

export interface StateSyncEvent {
  gameId: string;
  authoritativeState: GameSessionState;
  reason: 'desync_detected' | 'manual_request' | 'validation_failure';
  timestamp: number;
}