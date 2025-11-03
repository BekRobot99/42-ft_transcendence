# ft_transcendence API Documentation

## Overview

The ft_transcendence API provides a comprehensive real-time multiplayer Pong game system with advanced AI capabilities, performance monitoring, and tournament management.

## Base URL
```
http://localhost:3000
```

## Authentication

All WebSocket connections require JWT authentication via cookies with completed 2FA.

## API Endpoints

### 🎮 Game Management

#### GET /api/game-health
Get comprehensive system health status including performance metrics.

**Response:**
```json
{
  "status": "healthy|unhealthy",
  "systemHealth": {
    "errors": {
      "healthy": true,
      "metrics": {
        "activeConnections": 25,
        "activeGames": 5,
        "errorRate": 0.1,
        "averageLatency": 45,
        "memoryUsage": 250.5,
        "lastHealthCheck": 1759273172943
      }
    },
    "performance": {
      "healthy": true,
      "overview": {
        "status": "healthy",
        "uptime": 3600000,
        "totalRequests": 1500,
        "averageResponseTime": 25.3,
        "errorRate": 0.8,
        "activeConnections": 25,
        "memoryUsage": 245,
        "cpuUsage": 35
      }
    },
    "games": {
      "activeGames": 5,
      "activeUsers": 12,
      "connections": 25
    }
  },
  "performance": {
    "cpu": 35,
    "memory": 245,
    "ai": 28,
    "game": 12,
    "network": 45
  },
  "alerts": [],
  "recommendations": [],
  "timestamp": 1759273172943
}
```

### 📊 Performance Monitoring

#### GET /api/performance/metrics
Get detailed performance metrics and system summary.

**Response:**
```json
{
  "summary": {
    "overall": {
      "health": "excellent|good|warning|critical",
      "score": 92,
      "uptime": 3600000,
      "lastUpdate": 1759273172943
    },
    "categories": {
      "cpu": {
        "average": 35.2,
        "peak": 65.8,
        "current": 32.1,
        "trend": "stable|improving|degrading",
        "status": "healthy|warning|critical"
      },
      "memory": {
        "average": 245.8,
        "peak": 380.5,
        "current": 235.2,
        "trend": "stable",
        "status": "healthy"
      },
      "ai": {
        "average": 28.5,
        "peak": 95.2,
        "current": 25.8,
        "trend": "improving",
        "status": "healthy"
      },
      "game": {
        "average": 12.3,
        "peak": 18.7,
        "current": 11.2,
        "trend": "stable",
        "status": "healthy"
      },
      "network": {
        "average": 45.2,
        "peak": 120.8,
        "current": 42.1,
        "trend": "improving",
        "status": "healthy"
      }
    },
    "alerts": [],
    "recommendations": []
  },
  "dashboard": {
    "widgets": [...],
    "chartData": {...},
    "systemHealth": {...},
    "timestamp": 1759273172943
  },
  "healthOverview": {...},
  "responseTime": 12.5,
  "timestamp": 1759273172943
}
```

#### GET /api/performance/dashboard
Get real-time dashboard data with performance trends.

**Response:**
```json
{
  "widgets": [
    {
      "id": "cpu-chart",
      "title": "CPU Usage (%)",
      "type": "chart",
      "category": "cpu",
      "data": [...],
      "config": {
        "refreshRate": 1000,
        "autoScale": false,
        "threshold": { "warning": 70, "critical": 90 }
      }
    }
  ],
  "chartData": {
    "cpu-chart": [...],
    "memory-chart": [...],
    "ai-gauge": [...]
  },
  "trends": {
    "cpu": {
      "trend": "stable",
      "change": 2.5,
      "average": 35.2,
      "peak": 65.8,
      "valley": 18.3,
      "dataPoints": 150
    }
  },
  "responseTime": 8.2
}
```

#### GET /api/performance/analytics
Get advanced performance analytics and optimization insights.

**Response:**
```json
{
  "summary": {
    "patterns": {
      "total": 3,
      "critical": 0,
      "active": 1
    },
    "regressions": {
      "total": 1,
      "unresolved": 0,
      "critical": 0
    },
    "opportunities": {
      "total": 2,
      "highPriority": 1,
      "totalPotentialGain": 25.5
    }
  },
  "report": {
    "reportId": "analytics-1759273172943",
    "patterns": [
      {
        "id": "pattern_123",
        "name": "AI Performance Spike",
        "category": "spike",
        "severity": "medium",
        "description": "AI decision times spiked to 85ms (168% above average)",
        "impact": {
          "performance": 68,
          "users": 35,
          "systems": ["AIPlayer", "GameSynchronizer"]
        },
        "recommendation": {
          "immediate": ["Monitor AI decision complexity"],
          "shortTerm": ["Optimize prediction algorithms"],
          "longTerm": ["Implement decision result caching"]
        }
      }
    ],
    "opportunities": [
      {
        "id": "opt_ai_123",
        "area": "AI Decision Making",
        "potentialGain": 15.5,
        "priority": 8,
        "effort": "medium",
        "implementation": {
          "steps": ["Implement caching", "Optimize algorithms"],
          "timeline": "2-3 weeks"
        }
      }
    ]
  }
}
```

#### GET /api/performance/recommendations
Get top optimization recommendations.

**Query Parameters:**
- `limit` (optional): Maximum number of recommendations (default: 10)

**Response:**
```json
{
  "recommendations": [
    {
      "source": "optimization",
      "priority": "high",
      "category": "ai",
      "recommendations": {
        "immediate": ["Implement decision caching"],
        "shortTerm": ["Optimize prediction algorithms"],
        "longTerm": ["Complete AI Decision Making optimization"],
        "estimatedEffort": "medium"
      }
    }
  ],
  "opportunities": [
    {
      "area": "AI Decision Making",
      "potentialGain": 15.5,
      "priority": 8,
      "impact": "high"
    }
  ],
  "summary": {
    "totalRecommendations": 5,
    "highPriorityCount": 2,
    "estimatedTotalGain": 42.3
  }
}
```

#### GET /api/performance/report
Generate comprehensive performance report.

**Query Parameters:**
- `timeWindow` (optional): Time window in milliseconds (default: 3600000 - 1 hour)

**Response:**
```json
{
  "reportId": "perf-report-1759273172943",
  "generatedAt": 1759273172943,
  "timeWindow": 3600000,
  "systemHealth": {...},
  "performanceSummary": {...},
  "trends": {...},
  "bottlenecks": [
    {
      "detected": true,
      "location": "AIPlayer.makeDecision()",
      "severity": "moderate",
      "impact": 25,
      "description": "AI decision making is taking 75.2ms on average",
      "solution": "Optimize decision algorithms, reduce prediction complexity",
      "priority": 7
    }
  ],
  "keyMetrics": {
    "averageAIDecisionTime": 28.5,
    "averageMemoryUsage": 245.8,
    "averageCpuUsage": 35.2,
    "averageFrameRate": 58.3,
    "uptime": 3600000,
    "totalRequests": 1500,
    "errorRate": 0.8
  },
  "generationTime": 15.3
}
```

### 🌐 WebSocket Endpoints

#### WS /api/ws/status
User status and presence WebSocket connection.

**Authentication:** Required (JWT + 2FA)

**Events Sent:**
```json
{
  "type": "user_status",
  "userId": 123,
  "status": "online|offline|in_game",
  "timestamp": 1759273172943
}
```

#### WS /api/ws/game
Main game WebSocket connection for real-time gameplay.

**Authentication:** Required (JWT + 2FA)

**Events Received:**
```json
{
  "event": "paddle_move",
  "direction": "up|down|stop",
  "timestamp": 1759273172943
}

{
  "event": "game_ready",
  "timestamp": 1759273172943
}
```

**Events Sent:**
```json
{
  "type": "game_state",
  "gameId": "game_123",
  "state": {
    "ball": { "x": 400, "y": 300, "velocityX": 5, "velocityY": 3 },
    "paddles": {
      "player1": { "y": 250, "height": 100 },
      "player2": { "y": 250, "height": 100 }
    },
    "score": { "player1": 2, "player2": 1 },
    "gameActive": true,
    "lastUpdate": 1759273172943
  }
}

{
  "type": "ai_move",
  "gameId": "game_123",
  "move": "up|down|stay",
  "difficulty": "easy|medium|hard",
  "timestamp": 1759273172943
}
```

#### WS /api/ws/performance
Real-time performance monitoring WebSocket.

**Events Sent:**
```json
{
  "type": "initialSnapshot",
  "data": {
    "widgets": [...],
    "systemHealth": {...}
  }
}

{
  "type": "performanceUpdate",
  "data": {
    "summary": {...},
    "healthOverview": {...},
    "connectionCount": 25,
    "gameCount": 5
  }
}

{
  "type": "performanceAlert",
  "data": {
    "level": "warning|critical",
    "category": "cpu|memory|ai|game|network",
    "message": "CPU usage exceeded warning threshold: 75%",
    "value": 75,
    "threshold": 70
  }
}

{
  "type": "bottleneckDetected",
  "data": {
    "count": 2,
    "severe": 0,
    "bottlenecks": [...]
  }
}

{
  "type": "optimizationRecommendation",
  "data": {
    "priority": "high",
    "area": "AI Decision Making",
    "potentialGain": 15.5
  }
}
```

## Error Responses

All API endpoints return standardized error responses:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "timestamp": 1759273172943,
  "details": {
    "field": "specific field if applicable",
    "validation": "validation error details"
  }
}
```

### Common Error Codes:
- `AUTHENTICATION_REQUIRED` - JWT token missing or invalid
- `2FA_INCOMPLETE` - Two-factor authentication not completed  
- `GAME_NOT_FOUND` - Requested game session not found
- `PLAYER_NOT_IN_GAME` - Player not currently in any game
- `VALIDATION_FAILED` - Input validation failed
- `PERFORMANCE_ERROR` - Performance monitoring system error
- `INTERNAL_ERROR` - Internal server error

## Rate Limiting

- **WebSocket connections:** 5 per user
- **API endpoints:** 100 requests per minute per IP
- **Performance endpoints:** 30 requests per minute per IP

## Data Types

### GameSessionState
```typescript
interface GameSessionState {
  ball: {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    radius: number;
  };
  paddles: {
    player1: { y: number; height: number; speed: number };
    player2: { y: number; height: number; speed: number };
  };
  score: {
    player1: number;
    player2: number;
  };
  canvas: {
    width: number;
    height: number;
  };
  gameActive: boolean;
  lastUpdate: number;
}
```

### AIKeyboardEvent  
```typescript
interface AIKeyboardEvent {
  action: 'up' | 'down' | 'stay';
  timestamp: number;
  difficulty: 'easy' | 'medium' | 'hard';
  confidence: number;
  holdDuration?: number;
}
```

### PerformanceMetric
```typescript
interface PerformanceMetric {
  id: string;
  name: string;
  category: 'cpu' | 'memory' | 'network' | 'ai' | 'game' | 'system';
  value: number;
  unit: 'ms' | 'mb' | 'fps' | 'percent' | 'count' | 'bytes';
  timestamp: number;
  threshold?: {
    warning: number;
    critical: number;
  };
}
```

## WebSocket Message Flow

### Game Connection Flow:
1. Client connects to `/api/ws/game` with JWT
2. Server authenticates and adds to game room
3. Server sends initial game state
4. Client sends paddle movement events
5. Server processes AI decisions and physics
6. Server broadcasts updated game state
7. Process repeats at 60fps

### Performance Monitoring Flow:
1. Client connects to `/api/ws/performance`
2. Server sends initial dashboard snapshot
3. Server sends real-time performance updates every 2 seconds
4. Server sends alerts and recommendations as they occur
5. Client receives live performance data for dashboard

## Examples

### Creating a Game Session
```javascript
// Connect to game WebSocket
const gameSocket = new WebSocket('ws://localhost:3000/api/ws/game');

gameSocket.onopen = () => {
  console.log('Connected to game');
};

gameSocket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'game_state') {
    // Update game display with new state
    updateGameDisplay(data.state);
  } else if (data.type === 'ai_move') {
    // Handle AI movement
    console.log(`AI moved: ${data.move}`);
  }
};

// Send paddle movement
function movePaddle(direction) {
  gameSocket.send(JSON.stringify({
    event: 'paddle_move',
    direction: direction,
    timestamp: Date.now()
  }));
}
```

### Monitoring Performance
```javascript
// Connect to performance monitoring
const perfSocket = new WebSocket('ws://localhost:3000/api/ws/performance');

perfSocket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'initialSnapshot':
      initializeDashboard(data.data);
      break;
    case 'performanceUpdate':
      updateMetrics(data.data);
      break;
    case 'performanceAlert':
      showAlert(data.data);
      break;
  }
};

// Get performance report
fetch('/api/performance/report?timeWindow=3600000')
  .then(response => response.json())
  .then(report => {
    console.log('Performance Report:', report);
    displayBottlenecks(report.bottlenecks);
    showRecommendations(report.recommendations);
  });
```

## Security Considerations

- All WebSocket connections require JWT authentication
- 2FA must be completed before game access
- Rate limiting prevents abuse
- Input validation on all game events
- Performance monitoring data is sanitized
- CORS headers configured for security

## Performance Optimization

- WebSocket connections are efficiently managed
- Game state updates optimized for 60fps
- Performance monitoring has minimal overhead (<1% CPU)
- Database queries are optimized with indexing
- Memory usage is actively monitored and managed