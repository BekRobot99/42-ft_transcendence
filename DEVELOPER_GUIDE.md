# ft_transcendence Developer Guide

## Overview

This guide provides comprehensive information for developers working on the ft_transcendence project, covering architecture, APIs, performance monitoring, and development workflows.

## Project Architecture

### Backend Structure
```
backend/
├── src/
│   ├── server.ts           # Main server entry point
│   ├── websocket.ts        # WebSocket connection handling
│   ├── api/               # REST API endpoints
│   │   ├── auth.ts        # Authentication routes
│   │   ├── profile.ts     # User profile management
│   │   ├── tournament.ts  # Tournament system
│   │   └── ...
│   ├── services/          # Business logic services
│   │   ├── PerformanceMonitor.ts     # Performance tracking
│   │   ├── PerformanceDashboard.ts   # Real-time dashboard
│   │   ├── PerformanceAnalytics.ts   # Analytics engine
│   │   ├── 2fact.ts       # Two-factor authentication
│   │   └── validators.ts  # Input validation
│   ├── config/            # Configuration files
│   └── interfaces/        # TypeScript interfaces
└── database/              # SQLite database files
```

### Frontend Structure
```
frontend/
├── src/
│   ├── app.ts            # Main application entry
│   ├── ui/               # UI components
│   │   ├── ConnectForm.ts
│   │   ├── NavigationBar.ts
│   │   └── ...
│   └── views/            # Page components
│       ├── GamePage.ts
│       ├── ProfilePage.ts
│       └── ...
├── assets/               # Static assets
└── styles.css           # Global styles
```

## Performance Monitoring System

### Core Components

#### PerformanceMonitor
Main monitoring service that tracks system metrics in real-time.

**Key Features:**
- CPU usage monitoring
- Memory consumption tracking
- AI decision time analysis
- Game update performance
- Network latency measurement
- Bottleneck detection

**Usage Example:**
```typescript
import { PerformanceMonitor } from './services/PerformanceMonitor';

const monitor = new PerformanceMonitor({
  collectionInterval: 1000,
  enableBottleneckDetection: true
});

monitor.startMonitoring();

// Track AI decision
monitor.trackAIDecision(decisionTime, difficulty);

// Track game update
monitor.trackGameUpdate(updateTime, playerCount);
```

#### PerformanceDashboard
Real-time dashboard service for visualizing performance data.

**Features:**
- Live performance charts
- System health overview
- Performance widgets
- Real-time alerts

**Integration:**
```typescript
import { PerformanceDashboard } from './services/PerformanceDashboard';

const dashboard = new PerformanceDashboard(performanceMonitor);
dashboard.startDashboard();

// Get dashboard data
const dashboardData = dashboard.getDashboardData();
```

#### PerformanceAnalytics
Advanced analytics engine for pattern detection and optimization.

**Capabilities:**
- Performance pattern detection
- Regression analysis
- Optimization recommendations
- Statistical analysis

### Performance Metrics

The system tracks multiple categories of performance metrics:

#### CPU Metrics
- Usage percentage
- Process CPU time
- Thread utilization
- Load average

#### Memory Metrics
- Heap usage
- Process memory
- Memory leaks detection
- Garbage collection performance

#### Game Performance
- Frame rate (FPS)
- Game loop timing
- Physics calculation time
- Render performance

#### AI Performance
- Decision calculation time
- Algorithm complexity
- Prediction accuracy
- Learning efficiency

#### Network Performance
- WebSocket latency
- Message processing time
- Connection stability
- Bandwidth utilization

### Setting Up Performance Monitoring

1. **Initialize Monitor:**
```typescript
const performanceMonitor = new PerformanceMonitor({
  collectionInterval: 1000,
  enableProfiling: true,
  enableBottleneckDetection: true,
  alertThresholds: {
    cpu: { warning: 70, critical: 90 },
    memory: { warning: 500, critical: 1000 }
  }
});
```

2. **Start Monitoring:**
```typescript
performanceMonitor.startMonitoring();
```

3. **Track Custom Events:**
```typescript
// Track AI decision timing
const startTime = performance.now();
await makeAIDecision();
const endTime = performance.now();
performanceMonitor.trackAIDecision(endTime - startTime, 'hard');

// Track game update timing
performanceMonitor.trackGameUpdate(updateDuration, activePlayerCount);
```

4. **Listen for Alerts:**
```typescript
performanceMonitor.on('performanceAlert', (alert) => {
  console.log(`Performance Alert: ${alert.message}`);
  // Handle alert (notify admins, scale resources, etc.)
});
```

## WebSocket Integration

### Game WebSocket (`/api/ws/game`)

Handles real-time game communication between clients and server.

**Connection Flow:**
1. Client authenticates with JWT
2. Server validates 2FA completion
3. WebSocket connection established
4. Client joins game room
5. Real-time game events exchanged

**Event Types:**
```typescript
// Client to Server
interface PaddleMoveEvent {
  event: 'paddle_move';
  direction: 'up' | 'down' | 'stop';
  timestamp: number;
}

// Server to Client
interface GameStateEvent {
  type: 'game_state';
  gameId: string;
  state: GameSessionState;
}

interface AIMove {
  type: 'ai_move';
  gameId: string;
  move: 'up' | 'down' | 'stay';
  difficulty: string;
  timestamp: number;
}
```

### Performance WebSocket (`/api/ws/performance`)

Real-time performance data streaming for monitoring dashboards.

**Event Flow:**
```typescript
// Initial snapshot
{
  type: 'initialSnapshot',
  data: {
    widgets: [...],
    systemHealth: {...}
  }
}

// Periodic updates
{
  type: 'performanceUpdate', 
  data: {
    summary: {...},
    healthOverview: {...}
  }
}

// Performance alerts
{
  type: 'performanceAlert',
  data: {
    level: 'warning',
    category: 'cpu',
    message: 'CPU usage exceeded warning threshold'
  }
}
```

## API Development

### Adding New Endpoints

1. **Create Route Handler:**
```typescript
// In appropriate API file (e.g., api/game.ts)
export async function handleNewEndpoint(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Validate input
    const validation = validateInput(request.body);
    if (!validation.valid) {
      return reply.status(400).send({ error: validation.error });
    }

    // Business logic
    const result = await processRequest(request.body);
    
    // Return response
    return reply.send({ success: true, data: result });
  } catch (error) {
    console.error('API Error:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
}
```

2. **Register Route:**
```typescript
// In server.ts or relevant API file
server.post('/api/new-endpoint', handleNewEndpoint);
```

3. **Add Performance Tracking:**
```typescript
export async function handleNewEndpoint(request: FastifyRequest, reply: FastifyReply) {
  const startTime = performance.now();
  
  try {
    // Endpoint logic
    const result = await processRequest(request.body);
    
    // Track performance
    const endTime = performance.now();
    performanceMonitor.trackAPICall('/api/new-endpoint', endTime - startTime);
    
    return reply.send({ success: true, data: result });
  } catch (error) {
    // Error handling
  }
}
```

### Authentication Flow

All protected endpoints require JWT authentication with completed 2FA:

1. **User Login:** Client sends credentials to `/api/signin`
2. **2FA Challenge:** Server responds with 2FA requirement
3. **2FA Verification:** Client submits 2FA code to `/api/2fa/verify`
4. **JWT Token:** Server returns JWT token on successful 2FA
5. **Authenticated Requests:** Client includes JWT in cookies for protected endpoints

## Game System Architecture

### Core Game Loop

The game runs at 60 FPS with the following update cycle:

```typescript
function gameLoop() {
  // 1. Process player input
  processPlayerInput();
  
  // 2. Update AI decisions
  const aiDecision = aiPlayer.makeDecision(gameState);
  
  // 3. Update physics
  updateBallPhysics();
  updatePaddlePositions();
  
  // 4. Check collisions
  checkCollisions();
  
  // 5. Update score
  updateScore();
  
  // 6. Broadcast state
  broadcastGameState();
  
  // 7. Track performance
  trackFramePerformance();
}
```

### AI System

The AI opponent uses multiple difficulty levels with different behaviors:

#### Easy AI
- Simple position-based movement
- Delayed reactions
- Occasional misses

#### Medium AI  
- Predictive ball tracking
- Moderate reaction time
- Strategic positioning

#### Hard AI
- Advanced prediction algorithms
- Near-perfect reactions
- Adaptive strategy

**AI Decision Process:**
```typescript
class AIPlayer {
  makeDecision(gameState: GameSessionState): AIKeyboardEvent {
    const prediction = this.predictBallPath(gameState.ball);
    const strategy = this.selectStrategy(gameState);
    const decision = this.calculateOptimalMove(prediction, strategy);
    
    return {
      action: decision.action,
      timestamp: Date.now(),
      difficulty: this.difficulty,
      confidence: decision.confidence
    };
  }
}
```

## Testing Framework

### Performance Testing

Use the comprehensive test script to validate performance monitoring:

```bash
cd backend
npm test:performance
```

**Test Categories:**
1. **Performance Monitor Tests** - Core monitoring functionality
2. **Performance Dashboard Tests** - Dashboard data and widgets
3. **Performance Analytics Tests** - Pattern detection and analysis
4. **WebSocket Integration Tests** - Real-time data streaming
5. **API Endpoint Tests** - All performance API routes
6. **Alert System Tests** - Performance alert generation
7. **Bottleneck Detection Tests** - System bottleneck identification

### Unit Testing

Run individual component tests:
```bash
# Test specific service
npm test PerformanceMonitor

# Test with coverage
npm test:coverage
```

### Integration Testing

Test full system integration:
```bash
npm run test:integration
```

## Database Schema

### Performance Metrics Table
```sql
CREATE TABLE performance_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  threshold_warning REAL,
  threshold_critical REAL
);

CREATE INDEX idx_metrics_category ON performance_metrics(category);
CREATE INDEX idx_metrics_timestamp ON performance_metrics(timestamp);
```

### Game Sessions Table
```sql
CREATE TABLE game_sessions (
  id TEXT PRIMARY KEY,
  player1_id INTEGER,
  player2_id INTEGER,
  ai_difficulty TEXT,
  start_time INTEGER,
  end_time INTEGER,
  final_score TEXT,
  performance_data TEXT
);
```

## Development Workflow

### Setting Up Development Environment

1. **Clone Repository:**
```bash
git clone <repository-url>
cd ft_transcendence
```

2. **Install Dependencies:**
```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

3. **Setup Database:**
```bash
cd backend
npm run setup:db
```

4. **Start Development Servers:**
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### Code Style Guidelines

- Use TypeScript for all new code
- Follow ESLint configuration
- Add JSDoc comments for public APIs
- Include unit tests for new features
- Update performance monitoring for new endpoints

### Performance Optimization Guidelines

1. **Monitor Resource Usage:**
   - Keep CPU usage below 70% under normal load
   - Memory usage should not exceed 500MB baseline
   - Game updates must maintain 60 FPS
   - AI decisions should complete within 50ms average

2. **Optimize Critical Paths:**
   - Game loop performance is priority #1
   - WebSocket message processing must be efficient
   - Database queries should be indexed and optimized

3. **Use Performance Monitoring:**
   - Add tracking to all new features
   - Monitor for performance regressions
   - Set appropriate alert thresholds
   - Regular performance reviews

## Debugging and Troubleshooting

### Common Issues

#### High CPU Usage
```typescript
// Check AI decision complexity
const bottlenecks = performanceMonitor.detectBottlenecks();
const aiBottlenecks = bottlenecks.filter(b => b.location.includes('AI'));

// Optimize AI algorithms if needed
if (aiBottlenecks.length > 0) {
  // Implement decision caching
  // Reduce prediction complexity
  // Optimize pathfinding algorithms
}
```

#### Memory Leaks
```typescript
// Monitor memory patterns
const memoryMetrics = performanceMonitor.getMetrics('memory');
const trend = performanceMonitor.analyzeMemoryTrend(memoryMetrics);

if (trend === 'increasing') {
  // Check for uncleaned intervals
  // Review WebSocket connection cleanup
  // Validate performance data retention
}
```

#### WebSocket Connection Issues
```typescript
// Monitor connection health
performanceMonitor.on('networkAlert', (alert) => {
  if (alert.category === 'websocket') {
    // Check connection pools
    // Review authentication flows  
    // Validate message processing
  }
});
```

### Performance Debugging Tools

1. **Performance Dashboard:** Real-time system monitoring
2. **Analytics Engine:** Pattern detection and analysis  
3. **Alert System:** Proactive issue detection
4. **Bottleneck Detection:** Automated performance analysis

### Logging and Monitoring

All services include comprehensive logging:

```typescript
// Performance events
console.log('[PerformanceMonitor] Bottleneck detected:', bottleneck);
console.log('[PerformanceDashboard] Dashboard updated');
console.log('[PerformanceAnalytics] Pattern detected:', pattern);

// Game events  
console.log('[GameSession] Player joined:', playerId);
console.log('[AIPlayer] Decision made:', decision);
console.log('[WebSocket] Connection established:', connectionId);
```

## Deployment Guide

### Production Deployment

1. **Build Application:**
```bash
npm run build:production
```

2. **Configure Environment:**
```bash
export NODE_ENV=production
export JWT_SECRET=<secure-secret>
export DATABASE_URL=<production-database>
```

3. **Start Production Server:**
```bash
npm start
```

### Performance Monitoring in Production

- Enable all monitoring features
- Set conservative alert thresholds
- Configure log aggregation
- Setup automated scaling triggers
- Monitor user experience metrics

## API Reference

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Contributing

1. Create feature branch from `main`
2. Implement feature with tests
3. Add performance monitoring if applicable
4. Update documentation
5. Submit pull request with performance validation

## Support and Resources

- **Documentation:** See `docs/` directory
- **API Reference:** `API_DOCUMENTATION.md`
- **Performance Guide:** This document
- **Troubleshooting:** See debugging section above