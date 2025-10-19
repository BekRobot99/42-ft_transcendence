# Performance Monitoring System

Real-time performance monitoring and analytics system for ft_transcendence game infrastructure.

## Overview

The Performance Monitoring System provides comprehensive real-time tracking of system resources, game performance, AI decision times, and network latency. It includes automated bottleneck detection, performance alerts, and optimization recommendations to ensure optimal gaming experience.

## Features

### 🔍 Real-Time Monitoring
- **CPU Usage Tracking:** Monitor processor utilization across game processes
- **Memory Consumption:** Track heap usage, memory leaks, and garbage collection
- **Frame Rate Monitoring:** Ensure consistent 60 FPS gameplay
- **Network Latency:** Monitor WebSocket connection performance
- **AI Performance:** Track AI decision times and algorithm efficiency

### 📊 Performance Dashboard
- **Live Performance Charts:** Real-time visualization of system metrics
- **System Health Overview:** Comprehensive health status at a glance
- **Performance Widgets:** Customizable monitoring widgets
- **Historical Trends:** Track performance patterns over time

### 🤖 Intelligent Analytics
- **Pattern Detection:** Automatically identify performance patterns
- **Bottleneck Analysis:** Detect and analyze system bottlenecks
- **Regression Detection:** Identify performance degradation
- **Optimization Recommendations:** AI-powered performance improvement suggestions

### 🚨 Alert System
- **Configurable Thresholds:** Set custom warning and critical levels
- **Real-Time Alerts:** Immediate notification of performance issues
- **Multi-Channel Notifications:** WebSocket, console, and event-based alerts
- **Alert Prioritization:** Classify alerts by severity and impact

## Quick Start

### Installation

The performance monitoring system is integrated into the main ft_transcendence application. No separate installation required.

### Basic Usage

```typescript
import { PerformanceMonitor } from './services/PerformanceMonitor';
import { PerformanceDashboard } from './services/PerformanceDashboard';
import { PerformanceAnalytics } from './services/PerformanceAnalytics';

// Initialize monitoring system
const monitor = new PerformanceMonitor({
  collectionInterval: 1000,
  enableBottleneckDetection: true,
  enableOptimizationSuggestions: true
});

// Start monitoring
monitor.startMonitoring();

// Initialize dashboard
const dashboard = new PerformanceDashboard(monitor);
dashboard.startDashboard();

// Initialize analytics
const analytics = new PerformanceAnalytics(monitor);
```

### Real-Time WebSocket Connection

```javascript
// Connect to performance monitoring WebSocket
const socket = new WebSocket('ws://localhost:3000/api/ws/performance');

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'performanceUpdate':
      updateDashboard(data.data);
      break;
    case 'performanceAlert':
      showAlert(data.data);
      break;
    case 'bottleneckDetected':
      handleBottleneck(data.data);
      break;
  }
};
```

## API Reference

### REST Endpoints

#### GET `/api/performance/metrics`
Get comprehensive performance metrics summary.

**Response:**
```json
{
  "summary": {
    "overall": {
      "health": "excellent",
      "score": 92,
      "uptime": 3600000
    },
    "categories": {
      "cpu": { "average": 35.2, "current": 32.1, "status": "healthy" },
      "memory": { "average": 245.8, "current": 235.2, "status": "healthy" },
      "ai": { "average": 28.5, "current": 25.8, "status": "healthy" }
    }
  }
}
```

#### GET `/api/performance/dashboard`
Get real-time dashboard data.

#### GET `/api/performance/analytics`
Get advanced performance analytics and insights.

#### GET `/api/performance/recommendations`
Get optimization recommendations.

#### GET `/api/performance/report`
Generate comprehensive performance report.

### WebSocket Events

#### `performanceUpdate`
Real-time performance metric updates.

#### `performanceAlert`
Performance threshold violations.

#### `bottleneckDetected`
System bottleneck notifications.

#### `optimizationRecommendation`
Performance improvement suggestions.

## Configuration

### Performance Monitor Configuration

```typescript
interface PerformanceConfig {
  /** Data collection interval in milliseconds */
  collectionInterval: number;
  
  /** Historical data retention period */
  historyRetention: number;
  
  /** Alert threshold configuration */
  alertThresholds: {
    cpu: { warning: number; critical: number };
    memory: { warning: number; critical: number };
    latency: { warning: number; critical: number };
    fps: { warning: number; critical: number };
  };
  
  /** Enable performance profiling */
  enableProfiling: boolean;
  
  /** Enable bottleneck detection */
  enableBottleneckDetection: boolean;
  
  /** Enable optimization suggestions */
  enableOptimizationSuggestions: boolean;
}
```

### Default Configuration

```typescript
const defaultConfig = {
  collectionInterval: 1000, // 1 second
  historyRetention: 24 * 60 * 60 * 1000, // 24 hours
  alertThresholds: {
    cpu: { warning: 70, critical: 90 },
    memory: { warning: 500, critical: 1000 }, // MB
    latency: { warning: 100, critical: 200 }, // ms
    fps: { warning: 45, critical: 30 }
  },
  enableProfiling: true,
  enableBottleneckDetection: true,
  enableOptimizationSuggestions: true
};
```

## Performance Metrics

### System Metrics
- **CPU Usage:** Percentage of CPU utilization
- **Memory Usage:** Current memory consumption in MB
- **Process Uptime:** Application uptime in milliseconds
- **Active Connections:** Number of WebSocket connections

### Game Metrics
- **Frame Rate:** Current FPS
- **Game Update Time:** Time spent updating game state
- **Active Games:** Number of concurrent game sessions
- **Player Count:** Total active players

### AI Metrics
- **Decision Time:** Average AI decision calculation time
- **Algorithm Complexity:** Current AI algorithm complexity
- **Prediction Accuracy:** AI prediction success rate
- **Learning Efficiency:** AI learning algorithm performance

### Network Metrics
- **WebSocket Latency:** Real-time connection latency
- **Message Processing Time:** Time to process WebSocket messages
- **Connection Stability:** Connection drop rate
- **Bandwidth Usage:** Network throughput

## Dashboard Widgets

### CPU Chart
Real-time CPU usage visualization with historical trends.

```typescript
{
  id: 'cpu-chart',
  title: 'CPU Usage (%)',
  type: 'chart',
  category: 'cpu',
  config: {
    refreshRate: 1000,
    autoScale: false,
    threshold: { warning: 70, critical: 90 }
  }
}
```

### Memory Gauge
Memory usage indicator with threshold markers.

```typescript
{
  id: 'memory-gauge',
  title: 'Memory Usage (MB)',
  type: 'gauge',
  category: 'memory',
  config: {
    min: 0,
    max: 1000,
    threshold: { warning: 500, critical: 800 }
  }
}
```

### AI Performance Widget
AI decision time tracking and analysis.

```typescript
{
  id: 'ai-performance',
  title: 'AI Decision Time (ms)',
  type: 'metric',
  category: 'ai',
  config: {
    format: 'decimal',
    precision: 1
  }
}
```

## Analytics Engine

### Pattern Detection

The analytics engine automatically detects performance patterns:

- **Spike Patterns:** Sudden increases in resource usage
- **Degradation Patterns:** Gradual performance decline
- **Cyclical Patterns:** Recurring performance cycles
- **Anomaly Patterns:** Unusual performance behavior

### Bottleneck Analysis

Automated bottleneck detection identifies:

- **CPU Bottlenecks:** High CPU utilization points
- **Memory Bottlenecks:** Memory allocation issues
- **I/O Bottlenecks:** Database or network delays
- **Algorithm Bottlenecks:** Inefficient code paths

### Optimization Recommendations

AI-powered recommendations include:

- **Immediate Actions:** Quick fixes for current issues
- **Short-term Improvements:** Medium-term optimizations
- **Long-term Strategies:** Architectural improvements
- **Resource Scaling:** Infrastructure recommendations

## Troubleshooting

### Common Issues

#### High CPU Usage
1. Check AI decision complexity
2. Review game update algorithms
3. Analyze WebSocket message processing
4. Consider algorithm optimization

#### Memory Leaks
1. Monitor memory growth patterns
2. Check for uncleaned timers/intervals
3. Review WebSocket connection cleanup
4. Validate data retention policies

#### Performance Degradation
1. Analyze historical trends
2. Check for recent code changes
3. Review system resource limits
4. Validate monitoring thresholds

### Debug Mode

Enable detailed logging:

```typescript
const monitor = new PerformanceMonitor({
  enableProfiling: true,
  debugMode: true,
  verboseLogging: true
});
```

### Performance Testing

Run comprehensive performance tests:

```bash
cd backend
node test-performance-monitoring.js
```

**Test Results Example:**
```
✅ Performance Monitor - Basic functionality works
✅ Performance Dashboard - Dashboard data generation works  
✅ Performance Analytics - Pattern detection works
✅ WebSocket Integration - Real-time streaming works
✅ API Endpoints - All endpoints respond correctly
✅ Alert System - Alerts generated correctly
✅ Bottleneck Detection - Bottlenecks detected correctly

Overall System Performance Score: 85/100 - Good
```

## Best Practices

### Performance Monitoring
- Set appropriate alert thresholds for your environment
- Monitor trends rather than individual data points
- Use performance data to guide optimization efforts
- Regular review of performance patterns

### Resource Management
- Keep CPU usage below 70% under normal load
- Monitor memory growth patterns
- Optimize database queries and WebSocket processing
- Use performance profiling to identify bottlenecks

### Alert Configuration
- Configure multi-level alerts (warning/critical)
- Set up automated responses for critical alerts
- Regular review and adjustment of thresholds
- Document alert escalation procedures

## Integration Examples

### Game Performance Tracking

```typescript
// Track game loop performance
function gameLoop() {
  const startTime = performance.now();
  
  // Game logic
  updatePhysics();
  processAI();
  handleInput();
  
  const endTime = performance.now();
  monitor.trackGameUpdate(endTime - startTime, activePlayerCount);
}
```

### AI Performance Monitoring

```typescript
// Track AI decision performance
async function makeAIDecision(gameState: GameState) {
  const startTime = performance.now();
  
  const decision = await aiPlayer.calculateMove(gameState);
  
  const endTime = performance.now();
  monitor.trackAIDecision(endTime - startTime, aiPlayer.difficulty);
  
  return decision;
}
```

### WebSocket Performance Tracking

```typescript
// Track message processing performance
websocket.on('message', async (message) => {
  const startTime = performance.now();
  
  await processMessage(message);
  
  const endTime = performance.now();
  monitor.trackNetworkLatency(endTime - startTime);
});
```

## Contributing

1. Follow TypeScript coding standards
2. Add comprehensive JSDoc documentation
3. Include unit tests for new features
4. Update performance monitoring for new components
5. Validate performance impact of changes

## License

Part of the ft_transcendence project. See main project license for details.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review the [Developer Guide](./DEVELOPER_GUIDE.md)
- Consult the [API Documentation](./API_DOCUMENTATION.md)