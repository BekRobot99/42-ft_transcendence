/**
 * Performance Dashboard Service
 * 
 * Real-time performance dashboard for ft_transcendence system monitoring.
 * Provides web-based interface for performance metrics, alerts, and optimization insights.
 * 
 * Features:
 * - Real-time performance charts and graphs
 * - Interactive bottleneck analysis
 * - Performance alert management
 * - System health overview
 * - Historical performance data visualization
 * - Performance optimization recommendations
 * 
 */

import { EventEmitter } from 'events';
import { PerformanceMonitor, PerformanceSummary, PerformanceAlert, PerformanceMetric } from './PerformanceMonitor';

export interface DashboardConfig {
  updateInterval: number; // milliseconds
  maxDataPoints: number;
  enableRealTimeCharts: boolean;
  enableAlertNotifications: boolean;
  chartRetentionTime: number; // milliseconds
}

export interface ChartDataPoint {
  timestamp: number;
  value: number;
  category: string;
  label: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'gauge' | 'counter' | 'status' | 'alert' | 'recommendation';
  category: PerformanceMetric['category'];
  data: any;
  config: {
    refreshRate: number;
    autoScale: boolean;
    threshold?: { warning: number; critical: number };
  };
}

export interface SystemHealthOverview {
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  uptime: number;
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  activeAlerts: number;
  lastUpdate: number;
}

export class PerformanceDashboard extends EventEmitter {
  private config: DashboardConfig;
  private performanceMonitor: PerformanceMonitor;
  private chartData: Map<string, ChartDataPoint[]> = new Map();
  private widgets: Map<string, DashboardWidget> = new Map();
  private isDashboardActive: boolean = false;
  private updateInterval?: NodeJS.Timeout;
  private systemStats = {
    totalRequests: 0,
    totalResponseTime: 0,
    errorCount: 0,
    connectionCount: 0
  };

  constructor(performanceMonitor: PerformanceMonitor, config?: Partial<DashboardConfig>) {
    super();
    
    this.performanceMonitor = performanceMonitor;
    this.config = {
      updateInterval: 2000, // 2 seconds
      maxDataPoints: 300, // 10 minutes at 2-second intervals
      enableRealTimeCharts: true,
      enableAlertNotifications: true,
      chartRetentionTime: 30 * 60 * 1000, // 30 minutes
      ...config
    };

    this.initializeWidgets();
    this.setupPerformanceMonitorListeners();
  }

  /**
   * Initialize dashboard widgets
   */
  private initializeWidgets(): void {
    // CPU Usage Chart Widget
    this.widgets.set('cpu-chart', {
      id: 'cpu-chart',
      title: 'CPU Usage (%)',
      type: 'chart',
      category: 'cpu',
      data: [],
      config: {
        refreshRate: 1000,
        autoScale: false,
        threshold: { warning: 70, critical: 90 }
      }
    });

    // Memory Usage Chart Widget
    this.widgets.set('memory-chart', {
      id: 'memory-chart',
      title: 'Memory Usage (MB)',
      type: 'chart',
      category: 'memory',
      data: [],
      config: {
        refreshRate: 2000,
        autoScale: true,
        threshold: { warning: 500, critical: 1000 }
      }
    });

    // AI Performance Gauge Widget
    this.widgets.set('ai-gauge', {
      id: 'ai-gauge',
      title: 'AI Decision Time (ms)',
      type: 'gauge',
      category: 'ai',
      data: { current: 0, average: 0, max: 200 },
      config: {
        refreshRate: 500,
        autoScale: false,
        threshold: { warning: 50, critical: 100 }
      }
    });

    // Game FPS Counter Widget
    this.widgets.set('fps-counter', {
      id: 'fps-counter',
      title: 'Game FPS',
      type: 'counter',
      category: 'game',
      data: { current: 60, target: 60 },
      config: {
        refreshRate: 100,
        autoScale: false,
        threshold: { warning: 45, critical: 30 }
      }
    });

    // System Status Widget
    this.widgets.set('system-status', {
      id: 'system-status',
      title: 'System Status',
      type: 'status',
      category: 'system',
      data: { status: 'healthy', details: {} },
      config: {
        refreshRate: 5000,
        autoScale: false
      }
    });

    // Active Alerts Widget
    this.widgets.set('alerts', {
      id: 'alerts',
      title: 'Active Alerts',
      type: 'alert',
      category: 'system',
      data: { alerts: [] },
      config: {
        refreshRate: 1000,
        autoScale: false
      }
    });

    // Recommendations Widget
    this.widgets.set('recommendations', {
      id: 'recommendations',
      title: 'Optimization Recommendations',
      type: 'recommendation',
      category: 'system',
      data: { recommendations: [] },
      config: {
        refreshRate: 10000,
        autoScale: false
      }
    });

    // Network Latency Chart Widget
    this.widgets.set('network-chart', {
      id: 'network-chart',
      title: 'Network Latency (ms)',
      type: 'chart',
      category: 'network',
      data: [],
      config: {
        refreshRate: 1000,
        autoScale: true,
        threshold: { warning: 100, critical: 200 }
      }
    });
  }

  /**
   * Set up listeners for performance monitor events
   */
  private setupPerformanceMonitorListeners(): void {
    this.performanceMonitor.on('metricAdded', (metric: PerformanceMetric) => {
      this.addChartDataPoint(metric);
      this.updateRelevantWidgets(metric);
    });

    this.performanceMonitor.on('performanceAlert', (alert: PerformanceAlert) => {
      this.handlePerformanceAlert(alert);
    });

    this.performanceMonitor.on('recommendationGenerated', (recommendation) => {
      this.updateRecommendationsWidget(recommendation);
    });

    this.performanceMonitor.on('bottlenecksDetected', (bottlenecks) => {
      this.handleBottleneckDetection(bottlenecks);
    });
  }

  /**
   * Start the performance dashboard
   */
  public startDashboard(): void {
    if (this.isDashboardActive) {
      console.warn('Performance dashboard is already running');
      return;
    }

    this.isDashboardActive = true;
    console.log(`📊 Performance dashboard started (update interval: ${this.config.updateInterval}ms)`);

    // Start periodic widget updates
    this.updateInterval = setInterval(() => {
      this.updateAllWidgets();
      this.cleanupOldChartData();
      this.emit('dashboardUpdated', this.getDashboardSnapshot());
    }, this.config.updateInterval);

    // Initial widget update
    this.updateAllWidgets();
    this.emit('dashboardStarted');
  }

  /**
   * Stop the performance dashboard
   */
  public stopDashboard(): void {
    if (!this.isDashboardActive) {
      console.warn('Performance dashboard is not running');
      return;
    }

    this.isDashboardActive = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }

    console.log('🛑 Performance dashboard stopped');
    this.emit('dashboardStopped');
  }

  /**
   * Add chart data point from performance metric
   */
  private addChartDataPoint(metric: PerformanceMetric): void {
    if (!this.config.enableRealTimeCharts) return;

    const chartKey = `${metric.category}-chart`;
    const dataPoint: ChartDataPoint = {
      timestamp: metric.timestamp,
      value: metric.value,
      category: metric.category,
      label: metric.name
    };

    let chartDataPoints = this.chartData.get(chartKey) || [];
    chartDataPoints.push(dataPoint);

    // Limit data points to prevent memory growth
    if (chartDataPoints.length > this.config.maxDataPoints) {
      chartDataPoints = chartDataPoints.slice(-this.config.maxDataPoints);
    }

    this.chartData.set(chartKey, chartDataPoints);
  }

  /**
   * Update widgets based on new performance metric
   */
  private updateRelevantWidgets(metric: PerformanceMetric): void {
    // Update chart widgets
    const chartWidget = this.widgets.get(`${metric.category}-chart`);
    if (chartWidget && chartWidget.type === 'chart') {
      const chartDataPoints = this.chartData.get(`${metric.category}-chart`) || [];
      chartWidget.data = chartDataPoints.slice(-50); // Last 50 points for chart display
    }

    // Update gauge widgets
    if (metric.category === 'ai') {
      const gaugeWidget = this.widgets.get('ai-gauge');
      if (gaugeWidget) {
        const recentMetrics = this.performanceMonitor.getRecentMetrics('ai', 30000);
        const values = recentMetrics.map(m => m.value);
        gaugeWidget.data = {
          current: metric.value,
          average: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
          max: gaugeWidget.data.max
        };
      }
    }

    // Update FPS counter
    if (metric.name === 'Frame Rate') {
      const fpsWidget = this.widgets.get('fps-counter');
      if (fpsWidget) {
        fpsWidget.data = {
          current: metric.value,
          target: fpsWidget.data.target
        };
      }
    }
  }

  /**
   * Handle performance alerts
   */
  private handlePerformanceAlert(alert: PerformanceAlert): void {
    const alertsWidget = this.widgets.get('alerts');
    if (alertsWidget) {
      const alerts = alertsWidget.data.alerts || [];
      alerts.unshift(alert); // Add to beginning
      
      // Keep only recent alerts
      alertsWidget.data.alerts = alerts.slice(0, 10);
    }

    if (this.config.enableAlertNotifications) {
      this.emit('alertNotification', {
        type: 'performance',
        level: alert.level,
        message: alert.message,
        timestamp: alert.timestamp
      });
    }
  }

  /**
   * Update recommendations widget
   */
  private updateRecommendationsWidget(recommendation: any): void {
    const recommendationsWidget = this.widgets.get('recommendations');
    if (recommendationsWidget) {
      const recommendations = recommendationsWidget.data.recommendations || [];
      recommendations.unshift(recommendation);
      
      // Keep only recent recommendations
      recommendationsWidget.data.recommendations = recommendations.slice(0, 5);
    }
  }

  /**
   * Handle bottleneck detection
   */
  private handleBottleneckDetection(bottlenecks: any[]): void {
    // Update system status widget with bottleneck information
    const statusWidget = this.widgets.get('system-status');
    if (statusWidget) {
      const severBottlenecks = bottlenecks.filter(b => b.severity === 'severe');
      const moderateBottlenecks = bottlenecks.filter(b => b.severity === 'moderate');
      
      let status = 'healthy';
      if (severBottlenecks.length > 0) {
        status = 'critical';
      } else if (moderateBottlenecks.length > 0) {
        status = 'warning';
      }

      statusWidget.data = {
        status,
        details: {
          bottlenecks: bottlenecks.length,
          severe: severBottlenecks.length,
          moderate: moderateBottlenecks.length,
          topBottleneck: bottlenecks[0]?.description || null
        }
      };
    }

    // Emit bottleneck notification
    this.emit('bottleneckNotification', {
      type: 'bottleneck',
      count: bottlenecks.length,
      severe: bottlenecks.filter(b => b.severity === 'severe').length,
      bottlenecks
    });
  }

  /**
   * Update all dashboard widgets
   */
  private updateAllWidgets(): void {
    const summary = this.performanceMonitor.getPerformanceSummary();
    
    // Update system status widget
    const statusWidget = this.widgets.get('system-status');
    if (statusWidget) {
      statusWidget.data = {
        status: summary.overall.health,
        details: {
          score: summary.overall.score,
          uptime: summary.overall.uptime,
          activeAlerts: summary.alerts.length,
          categories: summary.categories
        }
      };
    }

    // Update alerts widget with current alerts
    const alertsWidget = this.widgets.get('alerts');
    if (alertsWidget) {
      alertsWidget.data = {
        alerts: summary.alerts.slice(0, 10)
      };
    }

    // Update recommendations widget
    const recommendationsWidget = this.widgets.get('recommendations');
    if (recommendationsWidget) {
      recommendationsWidget.data = {
        recommendations: summary.recommendations
      };
    }

    // Emit widget updates
    this.emit('widgetsUpdated', Array.from(this.widgets.values()));
  }

  /**
   * Get system health overview
   */
  public getSystemHealthOverview(): SystemHealthOverview {
    const summary = this.performanceMonitor.getPerformanceSummary();
    
    return {
      status: this.mapHealthToStatus(summary.overall.health),
      uptime: summary.overall.uptime,
      totalRequests: this.systemStats.totalRequests,
      averageResponseTime: this.systemStats.totalRequests > 0 
        ? this.systemStats.totalResponseTime / this.systemStats.totalRequests 
        : 0,
      errorRate: this.systemStats.totalRequests > 0 
        ? (this.systemStats.errorCount / this.systemStats.totalRequests) * 100 
        : 0,
      activeConnections: this.systemStats.connectionCount,
      memoryUsage: summary.categories.memory?.current || 0,
      cpuUsage: summary.categories.cpu?.current || 0,
      activeAlerts: summary.alerts.length,
      lastUpdate: Date.now()
    };
  }

  /**
   * Map performance health to system status
   */
  private mapHealthToStatus(health: string): SystemHealthOverview['status'] {
    switch (health) {
      case 'excellent':
      case 'good':
        return 'healthy';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'critical';
      default:
        return 'maintenance';
    }
  }

  /**
   * Track request for dashboard statistics
   */
  public trackRequest(responseTime: number, isError: boolean = false): void {
    this.systemStats.totalRequests++;
    this.systemStats.totalResponseTime += responseTime;
    
    if (isError) {
      this.systemStats.errorCount++;
    }
  }

  /**
   * Update connection count
   */
  public updateConnectionCount(count: number): void {
    this.systemStats.connectionCount = count;
  }

  /**
   * Get complete dashboard snapshot
   */
  public getDashboardSnapshot(): any {
    return {
      widgets: Array.from(this.widgets.values()),
      chartData: Object.fromEntries(this.chartData),
      systemHealth: this.getSystemHealthOverview(),
      performanceSummary: this.performanceMonitor.getPerformanceSummary(),
      bottlenecks: this.performanceMonitor.getBottleneckAnalysis(),
      timestamp: Date.now(),
      config: this.config
    };
  }

  /**
   * Get specific widget data
   */
  public getWidget(widgetId: string): DashboardWidget | undefined {
    return this.widgets.get(widgetId);
  }

  /**
   * Update widget configuration
   */
  public updateWidgetConfig(widgetId: string, config: Partial<DashboardWidget['config']>): boolean {
    const widget = this.widgets.get(widgetId);
    if (!widget) return false;

    widget.config = { ...widget.config, ...config };
    this.emit('widgetConfigUpdated', widget);
    return true;
  }

  /**
   * Add custom widget
   */
  public addCustomWidget(widget: DashboardWidget): void {
    this.widgets.set(widget.id, widget);
    this.emit('customWidgetAdded', widget);
  }

  /**
   * Remove widget
   */
  public removeWidget(widgetId: string): boolean {
    const removed = this.widgets.delete(widgetId);
    if (removed) {
      this.chartData.delete(widgetId);
      this.emit('widgetRemoved', widgetId);
    }
    return removed;
  }

  /**
   * Get performance trends for analytics
   */
  public getPerformanceTrends(category: PerformanceMetric['category'], timeWindow: number = 300000): any {
    const chartKey = `${category}-chart`;
    const dataPoints = this.chartData.get(chartKey) || [];
    const cutoffTime = Date.now() - timeWindow;
    
    const recentPoints = dataPoints.filter(point => point.timestamp > cutoffTime);
    
    if (recentPoints.length < 2) {
      return {
        trend: 'stable',
        change: 0,
        average: 0,
        peak: 0,
        valley: 0
      };
    }

    const values = recentPoints.map(p => p.value);
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const changePercent = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
    
    return {
      trend: Math.abs(changePercent) < 5 ? 'stable' : (changePercent > 0 ? 'increasing' : 'decreasing'),
      change: changePercent,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      peak: Math.max(...values),
      valley: Math.min(...values),
      dataPoints: recentPoints.length
    };
  }

  /**
   * Export dashboard data for analysis
   */
  public exportDashboardData(): any {
    return {
      snapshot: this.getDashboardSnapshot(),
      trends: {
        cpu: this.getPerformanceTrends('cpu'),
        memory: this.getPerformanceTrends('memory'),
        ai: this.getPerformanceTrends('ai'),
        game: this.getPerformanceTrends('game'),
        network: this.getPerformanceTrends('network')
      },
      systemStats: this.systemStats,
      config: this.config,
      exportTimestamp: Date.now()
    };
  }

  /**
   * Clean up old chart data to prevent memory leaks
   */
  private cleanupOldChartData(): void {
    const cutoffTime = Date.now() - this.config.chartRetentionTime;
    
    this.chartData.forEach((dataPoints, key) => {
      const filteredPoints = dataPoints.filter(point => point.timestamp > cutoffTime);
      this.chartData.set(key, filteredPoints);
    });
  }

  /**
   * Reset dashboard data
   */
  public reset(): void {
    this.chartData.clear();
    this.systemStats = {
      totalRequests: 0,
      totalResponseTime: 0,
      errorCount: 0,
      connectionCount: 0
    };
    
    // Reset widgets to initial state
    this.initializeWidgets();
    
    console.log('🔄 Performance dashboard data reset');
    this.emit('dashboardReset');
  }

  /**
   * Generate performance report
   */
  public generatePerformanceReport(timeWindow: number = 3600000): any {
    const summary = this.performanceMonitor.getPerformanceSummary();
    const health = this.getSystemHealthOverview();
    
    return {
      reportId: `perf-report-${Date.now()}`,
      generatedAt: Date.now(),
      timeWindow,
      systemHealth: health,
      performanceSummary: summary,
      trends: {
        cpu: this.getPerformanceTrends('cpu', timeWindow),
        memory: this.getPerformanceTrends('memory', timeWindow),
        ai: this.getPerformanceTrends('ai', timeWindow),
        game: this.getPerformanceTrends('game', timeWindow),
        network: this.getPerformanceTrends('network', timeWindow)
      },
      bottlenecks: this.performanceMonitor.getBottleneckAnalysis(),
      recommendations: summary.recommendations,
      alerts: summary.alerts,
      systemStats: this.systemStats,
      keyMetrics: {
        averageAIDecisionTime: summary.categories.ai?.average || 0,
        averageMemoryUsage: summary.categories.memory?.average || 0,
        averageCpuUsage: summary.categories.cpu?.average || 0,
        averageFrameRate: summary.categories.game?.average || 0,
        uptime: health.uptime,
        totalRequests: health.totalRequests,
        errorRate: health.errorRate
      }
    };
  }
}
