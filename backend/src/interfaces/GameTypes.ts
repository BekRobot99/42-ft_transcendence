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
  | 'chat_message';

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