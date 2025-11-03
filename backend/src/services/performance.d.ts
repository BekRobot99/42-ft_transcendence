/**
 * @fileoverview TypeScript definitions for Performance Monitoring System
 * @version 2.0.0
 * @author ft_transcendence AI Development Team
 */

/**
 * Core performance metric interface
 */
export interface PerformanceMetric {
  /** Unique identifier for the metric */
  id: string;
  /** Human-readable metric name */
  name: string;
  /** Category classification for grouping metrics */
  category: 'cpu' | 'memory' | 'network' | 'ai' | 'game' | 'system';
  /** Current metric value */
  value: number;
  /** Unit of measurement */
  unit: 'ms' | 'mb' | 'fps' | 'percent' | 'count' | 'bytes';
  /** Timestamp when metric was recorded */
  timestamp: number;
  /** Optional alert thresholds */
  threshold?: {
    /** Warning level threshold */
    warning: number;
    /** Critical level threshold */
    critical: number;
  };
}

/**
 * Performance alert interface
 */
export interface PerformanceAlert {
  /** Unique alert identifier */
  id: string;
  /** Alert severity level */
  level: 'info' | 'warning' | 'critical';
  /** Performance category */
  category: 'cpu' | 'memory' | 'network' | 'ai' | 'game' | 'system';
  /** Alert message */
  message: string;
  /** Current metric value that triggered alert */
  value: number;
  /** Threshold that was exceeded */
  threshold: number;
  /** Alert creation timestamp */
  timestamp: number;
  /** Whether alert is resolved */
  resolved?: boolean;
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
  /** Data collection interval in milliseconds */
  collectionInterval: number;
  /** Historical data retention period in milliseconds */
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

/**
 * Performance summary interface
 */
export interface PerformanceSummary {
  /** Overall system health information */
  overall: {
    /** System health status */
    health: 'excellent' | 'good' | 'warning' | 'critical';
    /** Overall performance score (0-100) */
    score: number;
    /** System uptime in milliseconds */
    uptime: number;
    /** Last update timestamp */
    lastUpdate: number;
  };
  /** Performance metrics by category */
  categories: {
    [K in 'cpu' | 'memory' | 'ai' | 'game' | 'network']: {
      /** Average value over monitoring period */
      average: number;
      /** Peak value recorded */
      peak: number;
      /** Current value */
      current: number;
      /** Performance trend indicator */
      trend: 'stable' | 'improving' | 'degrading';
      /** Health status */
      status: 'healthy' | 'warning' | 'critical';
    };
  };
  /** Active performance alerts */
  alerts: PerformanceAlert[];
  /** Performance optimization recommendations */
  recommendations: PerformanceRecommendation[];
}

/**
 * Performance recommendation interface
 */
export interface PerformanceRecommendation {
  /** Unique recommendation identifier */
  id: string;
  /** Performance area */
  area: string;
  /** Potential performance gain percentage */
  potentialGain: number;
  /** Priority level (1-10) */
  priority: number;
  /** Implementation effort level */
  effort: 'low' | 'medium' | 'high';
  /** Detailed implementation information */
  implementation: {
    /** Implementation steps */
    steps: string[];
    /** Estimated timeline */
    timeline: string;
  };
}

/**
 * Bottleneck information interface
 */
export interface BottleneckInfo {
  /** Whether bottleneck was detected */
  detected: boolean;
  /** Location of bottleneck */
  location: string;
  /** Severity level */
  severity: 'low' | 'moderate' | 'high' | 'critical';
  /** Performance impact percentage */
  impact: number;
  /** Bottleneck description */
  description: string;
  /** Suggested solution */
  solution: string;
  /** Priority level (1-10) */
  priority: number;
}

/**
 * Dashboard widget configuration
 */
export interface DashboardWidget {
  /** Unique widget identifier */
  id: string;
  /** Widget display title */
  title: string;
  /** Widget type */
  type: 'chart' | 'gauge' | 'metric' | 'status' | 'table' | 'alert' | 'trend' | 'heatmap';
  /** Performance category */
  category: 'cpu' | 'memory' | 'network' | 'ai' | 'game' | 'system';
  /** Widget-specific configuration */
  config: {
    /** Refresh rate in milliseconds */
    refreshRate?: number;
    /** Auto-scaling enabled */
    autoScale?: boolean;
    /** Alert thresholds */
    threshold?: { warning: number; critical: number };
    /** Chart-specific options */
    chartOptions?: {
      /** Chart type */
      type?: 'line' | 'area' | 'bar' | 'scatter';
      /** Show grid lines */
      showGrid?: boolean;
      /** Animation enabled */
      animate?: boolean;
    };
    /** Gauge-specific options */
    gaugeOptions?: {
      /** Minimum value */
      min?: number;
      /** Maximum value */
      max?: number;
      /** Number of segments */
      segments?: number;
    };
  };
}

/**
 * Chart data point interface
 */
export interface ChartDataPoint {
  /** Data point timestamp */
  timestamp: number;
  /** Data point value */
  value: number;
  /** Optional metadata */
  metadata?: {
    /** Data quality indicator */
    quality?: 'good' | 'warning' | 'poor';
    /** Additional context */
    context?: string;
  };
}

/**
 * Dashboard data interface
 */
export interface DashboardData {
  /** Available dashboard widgets */
  widgets: DashboardWidget[];
  /** Chart data by widget ID */
  chartData: { [widgetId: string]: ChartDataPoint[] };
  /** Performance trends */
  trends: {
    [K in 'cpu' | 'memory' | 'ai' | 'game' | 'network']: {
      /** Trend direction */
      trend: 'stable' | 'improving' | 'degrading';
      /** Percentage change */
      change: number;
      /** Average value */
      average: number;
      /** Peak value */
      peak: number;
      /** Minimum value */
      valley: number;
      /** Number of data points */
      dataPoints: number;
    };
  };
  /** Response time for data generation */
  responseTime: number;
}

/**
 * System health overview interface
 */
export interface SystemHealthOverview {
  /** Overall system status */
  status: 'healthy' | 'degraded' | 'critical';
  /** System uptime in milliseconds */
  uptime: number;
  /** Total processed requests */
  totalRequests: number;
  /** Average response time in milliseconds */
  averageResponseTime: number;
  /** Error rate percentage */
  errorRate: number;
  /** Active WebSocket connections */
  activeConnections: number;
  /** Memory usage in MB */
  memoryUsage: number;
  /** CPU usage percentage */
  cpuUsage: number;
}

/**
 * Performance analytics report interface
 */
export interface AnalyticsReport {
  /** Report identifier */
  reportId: string;
  /** Report generation timestamp */
  generatedAt: number;
  /** Time window for analysis */
  timeWindow: number;
  /** Detected performance patterns */
  patterns: PerformancePattern[];
  /** Performance regressions */
  regressions: PerformanceRegression[];
  /** Optimization opportunities */
  opportunities: OptimizationOpportunity[];
}

/**
 * Performance pattern interface
 */
export interface PerformancePattern {
  /** Pattern identifier */
  id: string;
  /** Pattern name */
  name: string;
  /** Pattern category */
  category: 'spike' | 'degradation' | 'cyclical' | 'anomaly';
  /** Pattern severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Pattern description */
  description: string;
  /** Performance impact */
  impact: {
    /** Performance impact percentage */
    performance: number;
    /** Affected users */
    users: number;
    /** Affected systems */
    systems: string[];
  };
  /** Pattern recommendation */
  recommendation: {
    /** Immediate actions */
    immediate: string[];
    /** Short-term actions */
    shortTerm: string[];
    /** Long-term actions */
    longTerm: string[];
  };
}

/**
 * Performance regression interface
 */
export interface PerformanceRegression {
  /** Regression identifier */
  id: string;
  /** Affected metric */
  metric: string;
  /** Regression severity */
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  /** Performance degradation percentage */
  degradation: number;
  /** Detection timestamp */
  detectedAt: number;
  /** Whether regression is resolved */
  resolved: boolean;
  /** Affected time period */
  timePeriod: {
    /** Start timestamp */
    start: number;
    /** End timestamp */
    end: number;
  };
}

/**
 * Optimization opportunity interface
 */
export interface OptimizationOpportunity {
  /** Opportunity identifier */
  id: string;
  /** Optimization area */
  area: string;
  /** Potential performance gain percentage */
  potentialGain: number;
  /** Priority score (1-10) */
  priority: number;
  /** Implementation effort */
  effort: 'low' | 'medium' | 'high';
  /** Implementation details */
  implementation: {
    /** Implementation steps */
    steps: string[];
    /** Estimated timeline */
    timeline: string;
    /** Required resources */
    resources?: string[];
  };
}

/**
 * WebSocket performance event interfaces
 */
export interface PerformanceWebSocketEvent {
  /** Event type */
  type: 'initialSnapshot' | 'performanceUpdate' | 'performanceAlert' | 'bottleneckDetected' | 'optimizationRecommendation';
  /** Event data */
  data: any;
  /** Event timestamp */
  timestamp: number;
}

/**
 * Game session state interface
 */
export interface GameSessionState {
  /** Ball physics state */
  ball: {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    radius: number;
  };
  /** Paddle states */
  paddles: {
    player1: { y: number; height: number; speed: number };
    player2: { y: number; height: number; speed: number };
  };
  /** Game score */
  score: {
    player1: number;
    player2: number;
  };
  /** Canvas dimensions */
  canvas: {
    width: number;
    height: number;
  };
  /** Game active status */
  gameActive: boolean;
  /** Last update timestamp */
  lastUpdate: number;
}

/**
 * AI keyboard event interface
 */
export interface AIKeyboardEvent {
  /** AI action */
  action: 'up' | 'down' | 'stay';
  /** Event timestamp */
  timestamp: number;
  /** AI difficulty level */
  difficulty: 'easy' | 'medium' | 'hard';
  /** Decision confidence (0-1) */
  confidence: number;
  /** Action hold duration in milliseconds */
  holdDuration?: number;
}

/**
 * Performance monitoring method decorators
 */
export interface PerformanceDecorators {
  /** Method execution time tracking */
  trackExecutionTime(category: string): MethodDecorator;
  /** Memory usage tracking */
  trackMemoryUsage(): MethodDecorator;
  /** Performance profiling */
  profile(name: string): MethodDecorator;
}

/**
 * Performance monitoring events
 */
export interface PerformanceMonitorEvents {
  /** Performance update event */
  performanceUpdate: (summary: PerformanceSummary) => void;
  /** Performance alert event */
  performanceAlert: (alert: PerformanceAlert) => void;
  /** Bottleneck detected event */
  bottleneckDetected: (bottlenecks: BottleneckInfo[]) => void;
  /** Optimization recommendation event */
  optimizationRecommendation: (recommendation: PerformanceRecommendation) => void;
  /** Monitoring started event */
  monitoringStarted: () => void;
  /** Monitoring stopped event */
  monitoringStopped: () => void;
}

/**
 * Type guards for performance interfaces
 */
export namespace PerformanceTypeGuards {
  /**
   * Type guard for PerformanceMetric
   */
  export function isPerformanceMetric(obj: any): obj is PerformanceMetric {
    return obj && 
           typeof obj.id === 'string' &&
           typeof obj.name === 'string' &&
           typeof obj.category === 'string' &&
           typeof obj.value === 'number' &&
           typeof obj.unit === 'string' &&
           typeof obj.timestamp === 'number';
  }

  /**
   * Type guard for PerformanceAlert
   */
  export function isPerformanceAlert(obj: any): obj is PerformanceAlert {
    return obj &&
           typeof obj.id === 'string' &&
           ['info', 'warning', 'critical'].includes(obj.level) &&
           typeof obj.message === 'string' &&
           typeof obj.timestamp === 'number';
  }

  /**
   * Type guard for BottleneckInfo
   */
  export function isBottleneckInfo(obj: any): obj is BottleneckInfo {
    return obj &&
           typeof obj.detected === 'boolean' &&
           typeof obj.location === 'string' &&
           ['low', 'moderate', 'high', 'critical'].includes(obj.severity);
  }
}