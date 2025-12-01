/**
 * @fileoverview Performance Monitor Service - Comprehensive performance monitoring system
 * 
 * Real-time performance monitoring for ft_transcendence game system.
 * Tracks CPU usage, memory consumption, response times, frame rates,
 * and identifies bottlenecks across all game systems.
 * 
 * Features:
 * - Real-time performance metrics collection
 * - Bottleneck detection and analysis  
 * - Performance optimization recommendations
 * - Historical performance data tracking
 * - Alert system for performance degradation
 * - Detailed performance reports
 * 
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

/**
 * Performance metric data structure for monitoring system health and performance
 * @interface PerformanceMetric
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

export interface PerformanceSummary {
  overall: {
    health: 'excellent' | 'good' | 'warning' | 'critical';
    score: number; // 0-100
    uptime: number;
    lastUpdate: number;
  };
  categories: {
    [key in PerformanceMetric['category']]: {
      average: number;
      peak: number;
      current: number;
      trend: 'improving' | 'stable' | 'degrading';
      status: 'healthy' | 'warning' | 'critical';
    };
  };
  alerts: PerformanceAlert[];
  recommendations: PerformanceRecommendation[];
}

export interface PerformanceAlert {
  id: string;
  level: 'info' | 'warning' | 'critical';
  category: PerformanceMetric['category'];
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  resolved: boolean;
}

export interface PerformanceRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high';
  category: PerformanceMetric['category'];
  title: string;
  description: string;
  impact: string;
  implementation: string;
  estimatedGain: number; // Percentage improvement
}

export interface BottleneckAnalysis {
  detected: boolean;
  location: string;
  severity: 'minor' | 'moderate' | 'severe';
  impact: number; // Performance impact percentage
  description: string;
  solution: string;
  priority: number; // 1-10
}

// Performance monitoring configuration
interface PerformanceConfig {
  collectionInterval: number; // milliseconds
  historyRetention: number; // milliseconds
  alertThresholds: {
    cpu: { warning: number; critical: number };
    memory: { warning: number; critical: number };
    latency: { warning: number; critical: number };
    fps: { warning: number; critical: number };
  };
  enableProfiling: boolean;
  enableBottleneckDetection: boolean;
  enableOptimizationSuggestions: boolean;
}

/**
 * Real-time performance monitoring system for game infrastructure
 * 
 * Provides comprehensive monitoring of system resources, game performance,
 * AI decision times, and network latency. Includes automatic bottleneck
 * detection, performance alerts, and optimization recommendations.
 * 
 * @extends EventEmitter
 * @fires PerformanceMonitor#performanceUpdate - Real-time metric updates
 * @fires PerformanceMonitor#performanceAlert - System performance alerts
 * @fires PerformanceMonitor#bottleneckDetected - Bottleneck detection events
 * @fires PerformanceMonitor#optimizationRecommendation - Performance improvement suggestions
 */
export class PerformanceMonitor extends EventEmitter {
  /** Configuration settings for performance monitoring */
  private config: PerformanceConfig;
  /** Storage for historical performance metrics by category */
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  /** Active performance alerts */
  private alerts: PerformanceAlert[] = [];
  /** Performance optimization recommendations */
  private recommendations: PerformanceRecommendation[] = [];
  /** Flag indicating if monitoring is currently active */
  private isMonitoring: boolean = false;
  /** Interval timer for periodic monitoring checks */
  private monitoringInterval?: NodeJS.Timeout;
  /** Monitoring start timestamp for uptime calculations */
  private startTime: number;
  /** Frame counter for FPS calculations */
  private frameCount: number = 0;
  /** Last frame timestamp for FPS calculations */
  private lastFrameTime: number = 0;
  
  /** AI decision timing history for performance analysis */
  private aiDecisionTimes: number[] = [];
  /** Game update timing history for performance analysis */
  private gameUpdateTimes: number[] = [];
  private networkLatencies: number[] = [];
  private validationTimes: number[] = [];
  
  // Bottleneck detection
  private bottlenecks: Map<string, BottleneckAnalysis> = new Map();
  private performanceMarks: Map<string, number> = new Map();

  /**
   * Initialize performance monitoring system with configuration
   * @param config - Optional performance monitoring configuration
   */
  constructor(config?: Partial<PerformanceConfig>) {
    super();
    
    this.config = {
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
      enableOptimizationSuggestions: true,
      ...config
    };

    this.startTime = Date.now();
    this.initializeMetrics();
  }

  /**
   * Initialize performance metrics collection
   */
  private initializeMetrics(): void {
    // Initialize metric categories
    const categories: PerformanceMetric['category'][] = ['cpu', 'memory', 'network', 'ai', 'game', 'system'];
    categories.forEach(category => {
      this.metrics.set(category, []);
    });

    // Set up default recommendations
    this.setupDefaultRecommendations();
  }

  /**
   * Start performance monitoring
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      console.warn('Performance monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    this.startTime = Date.now();
    
    console.log(`🔍 Performance monitoring started (interval: ${this.config.collectionInterval}ms)`);

    // Start periodic metric collection
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
      this.analyzePerformance();
      this.detectBottlenecks();
      this.cleanupOldMetrics();
      this.emit('metricsUpdated', this.getPerformanceSummary());
    }, this.config.collectionInterval);

    // Emit monitoring started event
    this.emit('monitoringStarted');
  }

  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      console.warn('Performance monitoring is not running');
      return;
    }

    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    console.log('🛑 Performance monitoring stopped');
    this.emit('monitoringStopped');
  }

  /**
   * Collect system-level performance metrics
   */
  private collectSystemMetrics(): void {
    const now = Date.now();
    
    // Memory usage metrics
    const memoryUsage = process.memoryUsage();
    this.addMetric({
      id: `memory_${now}`,
      name: 'Memory Usage (Heap Used)',
      category: 'memory',
      value: Math.round(memoryUsage.heapUsed / 1024 / 1024), // Convert to MB
      unit: 'mb',
      timestamp: now,
      threshold: this.config.alertThresholds.memory
    });

    this.addMetric({
      id: `memory_total_${now}`,
      name: 'Memory Usage (Total)',
      category: 'memory',
      value: Math.round((memoryUsage.heapUsed + memoryUsage.external) / 1024 / 1024),
      unit: 'mb',
      timestamp: now
    });

    // CPU usage simulation (in real implementation, use actual CPU monitoring)
    const cpuUsage = this.calculateCPUUsage();
    this.addMetric({
      id: `cpu_${now}`,
      name: 'CPU Usage',
      category: 'cpu',
      value: cpuUsage,
      unit: 'percent',
      timestamp: now,
      threshold: this.config.alertThresholds.cpu
    });

    // Frame rate tracking
    if (this.lastFrameTime > 0) {
      const frameTime = now - this.lastFrameTime;
      const fps = frameTime > 0 ? Math.round(1000 / frameTime) : 60;
      
      this.addMetric({
        id: `fps_${now}`,
        name: 'Frame Rate',
        category: 'game',
        value: Math.min(fps, 60), // Cap at 60 FPS
        unit: 'fps',
        timestamp: now,
        threshold: this.config.alertThresholds.fps
      });
    }
    this.lastFrameTime = now;

    // System uptime
    const uptime = now - this.startTime;
    this.addMetric({
      id: `uptime_${now}`,
      name: 'System Uptime',
      category: 'system',
      value: uptime,
      unit: 'ms',
      timestamp: now
    });
  }

  /**
   * Calculate CPU usage (simplified implementation)
   */
  private calculateCPUUsage(): number {
    // In a real implementation, this would use actual CPU monitoring
    // For now, we'll simulate based on system load
    const loadFactors = [
      this.aiDecisionTimes.length > 0 ? Math.min(this.getAverage(this.aiDecisionTimes) / 10, 40) : 0,
      this.gameUpdateTimes.length > 0 ? Math.min(this.getAverage(this.gameUpdateTimes) / 5, 30) : 0,
      this.validationTimes.length > 0 ? Math.min(this.getAverage(this.validationTimes) / 2, 20) : 0,
      Math.random() * 10 // Base system load
    ];
    
    return Math.min(Math.round(loadFactors.reduce((sum, factor) => sum + factor, 0)), 100);
  }

  /**
   * Add a performance metric
   */
  public addMetric(metric: PerformanceMetric): void {
    const categoryMetrics = this.metrics.get(metric.category) || [];
    categoryMetrics.push(metric);
    this.metrics.set(metric.category, categoryMetrics);

    // Check for threshold violations
    if (metric.threshold) {
      this.checkThresholds(metric);
    }

    // Emit metric added event
    this.emit('metricAdded', metric);
  }

  /**
   * Track AI decision performance
   */
  public trackAIDecision(decisionTime: number, complexity: number = 1): void {
    this.aiDecisionTimes.push(decisionTime);
    
    // Keep only recent decisions for analysis
    if (this.aiDecisionTimes.length > 100) {
      this.aiDecisionTimes = this.aiDecisionTimes.slice(-100);
    }

    // Add metric
    this.addMetric({
      id: `ai_decision_${Date.now()}`,
      name: 'AI Decision Time',
      category: 'ai',
      value: decisionTime,
      unit: 'ms',
      timestamp: Date.now(),
      threshold: { warning: 50, critical: 100 }
    });

    // Track decision complexity
    this.addMetric({
      id: `ai_complexity_${Date.now()}`,
      name: 'AI Decision Complexity',
      category: 'ai',
      value: complexity,
      unit: 'count',
      timestamp: Date.now()
    });
  }

  /**
   * Track game update performance
   */
  public trackGameUpdate(updateTime: number): void {
    this.gameUpdateTimes.push(updateTime);
    
    if (this.gameUpdateTimes.length > 100) {
      this.gameUpdateTimes = this.gameUpdateTimes.slice(-100);
    }

    this.addMetric({
      id: `game_update_${Date.now()}`,
      name: 'Game Update Time',
      category: 'game',
      value: updateTime,
      unit: 'ms',
      timestamp: Date.now(),
      threshold: { warning: 16, critical: 33 } // 60fps = 16ms, 30fps = 33ms
    });
  }

  /**
   * Track network latency
   */
  public trackNetworkLatency(latency: number): void {
    this.networkLatencies.push(latency);
    
    if (this.networkLatencies.length > 50) {
      this.networkLatencies = this.networkLatencies.slice(-50);
    }

    this.addMetric({
      id: `network_latency_${Date.now()}`,
      name: 'Network Latency',
      category: 'network',
      value: latency,
      unit: 'ms',
      timestamp: Date.now(),
      threshold: this.config.alertThresholds.latency
    });
  }

  /**
   * Track validation performance
   */
  public trackValidation(validationTime: number, validationCount: number = 1): void {
    this.validationTimes.push(validationTime);
    
    if (this.validationTimes.length > 100) {
      this.validationTimes = this.validationTimes.slice(-100);
    }

    this.addMetric({
      id: `validation_${Date.now()}`,
      name: 'Validation Time',
      category: 'system',
      value: validationTime,
      unit: 'ms',
      timestamp: Date.now(),
      threshold: { warning: 10, critical: 25 }
    });

    this.addMetric({
      id: `validation_count_${Date.now()}`,
      name: 'Validations Per Second',
      category: 'system',
      value: validationCount,
      unit: 'count',
      timestamp: Date.now()
    });
  }

  /**
   * Performance profiling with marks and measures
   */
  public mark(name: string): void {
    if (!this.config.enableProfiling) return;
    
    this.performanceMarks.set(name, performance.now());
    performance.mark(name);
  }

  public measure(name: string, startMark: string, endMark?: string): number {
    if (!this.config.enableProfiling) return 0;
    
    try {
      if (!endMark) {
        this.mark(`${startMark}_end`);
        endMark = `${startMark}_end`;
      }
      
      performance.measure(name, startMark, endMark);
      
      const startTime = this.performanceMarks.get(startMark) || 0;
      const endTime = this.performanceMarks.get(endMark) || performance.now();
      const duration = endTime - startTime;

      // Add as metric
      this.addMetric({
        id: `profile_${name}_${Date.now()}`,
        name: `Profile: ${name}`,
        category: 'system',
        value: duration,
        unit: 'ms',
        timestamp: Date.now()
      });

      return duration;
    } catch (error) {
      console.warn(`Performance measurement failed for ${name}:`, error);
      return 0;
    }
  }

  /**
   * Check metric thresholds and generate alerts
   */
  private checkThresholds(metric: PerformanceMetric): void {
    if (!metric.threshold) return;

    const { warning, critical } = metric.threshold;
    let alertLevel: PerformanceAlert['level'] | null = null;

    if (metric.value >= critical) {
      alertLevel = 'critical';
    } else if (metric.value >= warning) {
      alertLevel = 'warning';
    }

    if (alertLevel) {
      const alert: PerformanceAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        level: alertLevel,
        category: metric.category,
        message: `${metric.name} exceeded ${alertLevel} threshold: ${metric.value}${metric.unit}`,
        metric: metric.name,
        value: metric.value,
        threshold: alertLevel === 'critical' ? critical : warning,
        timestamp: Date.now(),
        resolved: false
      };

      this.alerts.push(alert);
      this.emit('performanceAlert', alert);

      // Auto-resolve old alerts for the same metric
      this.resolveOldAlerts(metric.name);
    }
  }

  /**
   * Resolve old alerts for the same metric type
   */
  private resolveOldAlerts(metricName: string): void {
    const oldAlerts = this.alerts.filter(alert => 
      alert.metric === metricName && 
      !alert.resolved && 
      Date.now() - alert.timestamp > 30000 // 30 seconds old
    );

    oldAlerts.forEach(alert => {
      alert.resolved = true;
    });
  }

  /**
   * Analyze performance trends and patterns
   */
  private analyzePerformance(): void {
    const categories: PerformanceMetric['category'][] = ['cpu', 'memory', 'network', 'ai', 'game'];
    
    categories.forEach(category => {
      const metrics = this.getRecentMetrics(category, 60000); // Last minute
      if (metrics.length < 3) return; // Need at least 3 data points

      const trend = this.calculateTrend(metrics.map(m => m.value));
      const average = this.getAverage(metrics.map(m => m.value));
      
      // Generate recommendations based on trends
      if (trend === 'degrading' && average > 0) {
        this.generateOptimizationRecommendation(category, average);
      }
    });
  }

  /**
   * Detect performance bottlenecks
   */
  private detectBottlenecks(): void {
    if (!this.config.enableBottleneckDetection) return;

    // AI decision bottlenecks
    if (this.aiDecisionTimes.length >= 10) {
      const avgDecisionTime = this.getAverage(this.aiDecisionTimes);
      if (avgDecisionTime > 75) {
        this.bottlenecks.set('ai_decisions', {
          detected: true,
          location: 'AIPlayer.makeDecision()',
          severity: avgDecisionTime > 150 ? 'severe' : avgDecisionTime > 100 ? 'moderate' : 'minor',
          impact: Math.min((avgDecisionTime - 50) / 50 * 100, 100),
          description: `AI decision making is taking ${avgDecisionTime.toFixed(1)}ms on average`,
          solution: 'Optimize decision algorithms, reduce prediction complexity, or implement decision caching',
          priority: avgDecisionTime > 150 ? 10 : avgDecisionTime > 100 ? 7 : 5
        });
      }
    }

    // Game update bottlenecks
    if (this.gameUpdateTimes.length >= 10) {
      const avgUpdateTime = this.getAverage(this.gameUpdateTimes);
      if (avgUpdateTime > 20) {
        this.bottlenecks.set('game_updates', {
          detected: true,
          location: 'GameSynchronizer.updateGame()',
          severity: avgUpdateTime > 40 ? 'severe' : avgUpdateTime > 25 ? 'moderate' : 'minor',
          impact: Math.min((avgUpdateTime - 16) / 16 * 100, 100),
          description: `Game updates are taking ${avgUpdateTime.toFixed(1)}ms on average (target: <16ms)`,
          solution: 'Optimize game logic, reduce validation overhead, or implement frame skipping',
          priority: avgUpdateTime > 40 ? 9 : avgUpdateTime > 25 ? 6 : 4
        });
      }
    }

    // Memory bottlenecks
    const recentMemoryMetrics = this.getRecentMetrics('memory', 30000);
    if (recentMemoryMetrics.length > 0) {
      const avgMemory = this.getAverage(recentMemoryMetrics.map(m => m.value));
      if (avgMemory > 400) {
        this.bottlenecks.set('memory_usage', {
          detected: true,
          location: 'System-wide memory allocation',
          severity: avgMemory > 800 ? 'severe' : avgMemory > 600 ? 'moderate' : 'minor',
          impact: Math.min((avgMemory - 200) / 200 * 100, 100),
          description: `Memory usage is ${avgMemory.toFixed(1)}MB on average`,
          solution: 'Implement garbage collection optimization, reduce object creation, or add memory pooling',
          priority: avgMemory > 800 ? 8 : avgMemory > 600 ? 5 : 3
        });
      }
    }

    // Emit bottlenecks detected event
    const activeBottlenecks = Array.from(this.bottlenecks.values()).filter(b => b.detected);
    if (activeBottlenecks.length > 0) {
      this.emit('bottlenecksDetected', activeBottlenecks);
    }
  }

  /**
   * Generate optimization recommendations
   */
  private generateOptimizationRecommendation(category: PerformanceMetric['category'], currentValue: number): void {
    if (!this.config.enableOptimizationSuggestions) return;

    // Check if we already have a recent recommendation for this category
    const existingRec = this.recommendations.find(r => 
      r.category === category && 
      Date.now() - parseInt(r.id.split('_')[1]) < 300000 // 5 minutes
    );
    
    if (existingRec) return;

    let recommendation: PerformanceRecommendation;

    switch (category) {
      case 'ai':
        recommendation = {
          id: `rec_${Date.now()}_ai`,
          priority: currentValue > 100 ? 'high' : 'medium',
          category,
          title: 'Optimize AI Decision Making',
          description: 'AI decision times are above optimal thresholds',
          impact: 'Improved game responsiveness and smoother gameplay',
          implementation: 'Implement decision caching, reduce prediction depth, or parallelize calculations',
          estimatedGain: Math.min((currentValue - 30) / 30 * 50, 70)
        };
        break;
        
      case 'game':
        recommendation = {
          id: `rec_${Date.now()}_game`,
          priority: currentValue > 25 ? 'high' : 'medium',
          category,
          title: 'Optimize Game Loop Performance',
          description: 'Game update cycles are taking longer than ideal',
          impact: 'Higher frame rates and smoother animations',
          implementation: 'Optimize collision detection, reduce state validation frequency, or implement delta timing',
          estimatedGain: Math.min((currentValue - 16) / 16 * 40, 60)
        };
        break;
        
      case 'memory':
        recommendation = {
          id: `rec_${Date.now()}_memory`,
          priority: currentValue > 600 ? 'high' : 'medium',
          category,
          title: 'Reduce Memory Consumption',
          description: 'Memory usage is higher than recommended',
          impact: 'Reduced system load and improved stability',
          implementation: 'Implement object pooling, optimize data structures, or add garbage collection tuning',
          estimatedGain: Math.min((currentValue - 200) / 200 * 30, 50)
        };
        break;
        
      default:
        return;
    }

    this.recommendations.push(recommendation);
    this.emit('recommendationGenerated', recommendation);
  }

  /**
   * Set up default optimization recommendations
   */
  private setupDefaultRecommendations(): void {
    this.recommendations.push(
      {
        id: 'rec_default_ai_caching',
        priority: 'medium',
        category: 'ai',
        title: 'Implement AI Decision Caching',
        description: 'Cache similar game state decisions to reduce computation time',
        impact: 'Faster AI responses and reduced CPU usage',
        implementation: 'Add LRU cache for game state decisions with configurable size limits',
        estimatedGain: 25
      },
      {
        id: 'rec_default_validation_batching',
        priority: 'low',
        category: 'system',
        title: 'Batch Validation Operations',
        description: 'Group validation checks to reduce overhead',
        impact: 'Improved validation performance and reduced system load',
        implementation: 'Collect validation requests and process in batches every few milliseconds',
        estimatedGain: 15
      }
    );
  }

  /**
   * Get recent metrics for a category
   */
  public getRecentMetrics(category: PerformanceMetric['category'], timeWindow: number = 60000): PerformanceMetric[] {
    const categoryMetrics = this.metrics.get(category) || [];
    const cutoffTime = Date.now() - timeWindow;
    return categoryMetrics.filter(metric => metric.timestamp > cutoffTime);
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): PerformanceSummary {
    const categories: PerformanceMetric['category'][] = ['cpu', 'memory', 'network', 'ai', 'game', 'system'];
    const categorySummary: any = {};
    
    let overallScore = 100;
    let overallHealth: PerformanceSummary['overall']['health'] = 'excellent';

    categories.forEach(category => {
      const recentMetrics = this.getRecentMetrics(category, 60000);
      const values = recentMetrics.map(m => m.value).filter(v => v !== undefined);
      
      if (values.length > 0) {
        const average = this.getAverage(values);
        const peak = Math.max(...values);
        const current = values[values.length - 1] || 0;
        const trend = this.calculateTrend(values.slice(-10)); // Last 10 values
        
        // Determine status based on category and values
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        let categoryScore = 100;
        
        if (category === 'ai' && average > 75) {
          status = average > 150 ? 'critical' : 'warning';
          categoryScore = Math.max(0, 100 - (average - 50) / 50 * 50);
        } else if (category === 'memory' && average > 400) {
          status = average > 800 ? 'critical' : 'warning';
          categoryScore = Math.max(0, 100 - (average - 200) / 200 * 40);
        } else if (category === 'game' && average > 20) {
          status = average > 40 ? 'critical' : 'warning';
          categoryScore = Math.max(0, 100 - (average - 16) / 16 * 60);
        }
        
        categorySummary[category] = {
          average,
          peak,
          current,
          trend,
          status
        };
        
        overallScore = Math.min(overallScore, categoryScore);
      } else {
        categorySummary[category] = {
          average: 0,
          peak: 0,
          current: 0,
          trend: 'stable' as const,
          status: 'healthy' as const
        };
      }
    });

    // Determine overall health
    if (overallScore >= 90) {
      overallHealth = 'excellent';
    } else if (overallScore >= 75) {
      overallHealth = 'good';
    } else if (overallScore >= 50) {
      overallHealth = 'warning';
    } else {
      overallHealth = 'critical';
    }

    return {
      overall: {
        health: overallHealth,
        score: Math.round(overallScore),
        uptime: Date.now() - this.startTime,
        lastUpdate: Date.now()
      },
      categories: categorySummary,
      alerts: this.alerts.filter(alert => !alert.resolved).slice(-10), // Last 10 unresolved
      recommendations: this.recommendations.slice(-5) // Last 5 recommendations
    };
  }

  /**
   * Get bottleneck analysis
   */
  public getBottleneckAnalysis(): BottleneckAnalysis[] {
    return Array.from(this.bottlenecks.values())
      .filter(bottleneck => bottleneck.detected)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Clean up old metrics to prevent memory leaks
   */
  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - this.config.historyRetention;
    
    this.metrics.forEach((categoryMetrics, category) => {
      const filteredMetrics = categoryMetrics.filter(metric => metric.timestamp > cutoffTime);
      this.metrics.set(category, filteredMetrics);
    });

    // Clean up old alerts
    this.alerts = this.alerts.filter(alert => Date.now() - alert.timestamp < this.config.historyRetention);
    
    // Clean up old recommendations
    this.recommendations = this.recommendations.filter(rec => {
      const recTime = parseInt(rec.id.split('_')[1]);
      return Date.now() - recTime < this.config.historyRetention;
    });
  }

  /**
   * Utility method to calculate average
   */
  private getAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Utility method to calculate trend
   */
  private calculateTrend(values: number[]): 'improving' | 'stable' | 'degrading' {
    if (values.length < 3) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = this.getAverage(firstHalf);
    const secondAvg = this.getAverage(secondHalf);
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (Math.abs(change) < 5) return 'stable';
    return change > 0 ? 'degrading' : 'improving';
  }

  /**
   * Export performance data for analysis
   */
  public exportPerformanceData(): any {
    return {
      config: this.config,
      metrics: Object.fromEntries(this.metrics),
      alerts: this.alerts,
      recommendations: this.recommendations,
      bottlenecks: Object.fromEntries(this.bottlenecks),
      summary: this.getPerformanceSummary(),
      exportTimestamp: Date.now()
    };
  }

  /**
   * Reset all performance data
   */
  public reset(): void {
    this.metrics.clear();
    this.alerts = [];
    this.recommendations = [];
    this.bottlenecks.clear();
    this.performanceMarks.clear();
    this.aiDecisionTimes = [];
    this.gameUpdateTimes = [];
    this.networkLatencies = [];
    this.validationTimes = [];
    this.frameCount = 0;
    this.startTime = Date.now();
    
    this.initializeMetrics();
    console.log('🔄 Performance monitoring data reset');
    this.emit('dataReset');
  }
}
