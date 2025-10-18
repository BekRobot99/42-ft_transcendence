/**
 * Performance Analytics Service
 * 
 * Advanced performance analytics and optimization recommendations for ft_transcendence.
 * Provides deep insights into system performance, identifies optimization opportunities,
 * and generates actionable recommendations for performance improvements.
 * 
 * Features:
 * - Performance pattern analysis and trend detection
 * - Automated performance regression detection
 * - Resource utilization optimization
 * - Performance forecasting and capacity planning
 * - Automated performance tuning recommendations
 * - Performance benchmarking and comparison
 * 
 * @author ft_transcendence AI Development Team
 * @version 2.0.0
 */

import { EventEmitter } from 'events';
import { PerformanceMonitor, PerformanceMetric, PerformanceSummary } from './PerformanceMonitor';

export interface PerformancePattern {
  id: string;
  name: string;
  category: 'spike' | 'degradation' | 'oscillation' | 'baseline_shift' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: number;
  duration: number;
  impact: {
    performance: number; // Performance impact percentage
    users: number; // Number of users potentially affected
    systems: string[]; // Affected system components
  };
  rootCause: {
    likely: string;
    contributing: string[];
    confidence: number; // 0-100%
  };
  recommendation: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    priority: 'low' | 'medium' | 'high';
    estimatedEffort: 'minimal' | 'moderate' | 'significant';
  };
}

export interface PerformanceRegression {
  id: string;
  metric: string;
  category: PerformanceMetric['category'];
  baselineValue: number;
  currentValue: number;
  regressionPercent: number;
  detectedAt: number;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  status: 'detected' | 'investigating' | 'resolved' | 'false_positive';
  possibleCauses: string[];
}

export interface OptimizationOpportunity {
  id: string;
  area: string;
  category: PerformanceMetric['category'];
  currentPerformance: number;
  targetPerformance: number;
  potentialGain: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  priority: number; // 1-10
  description: string;
  implementation: {
    steps: string[];
    resources: string[];
    timeline: string;
    risks: string[];
  };
}

export interface CapacityForecast {
  metric: string;
  category: PerformanceMetric['category'];
  currentCapacity: number;
  projectedCapacity: {
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
  };
  recommendedActions: {
    immediate: string[];
    planned: string[];
  };
  confidence: number; // 0-100%
}

export interface PerformanceBenchmark {
  id: string;
  name: string;
  category: PerformanceMetric['category'];
  baseline: {
    value: number;
    timestamp: number;
    conditions: string[];
  };
  target: {
    value: number;
    description: string;
  };
  current: {
    value: number;
    trend: 'improving' | 'stable' | 'degrading';
    percentOfTarget: number;
  };
}

export class PerformanceAnalytics extends EventEmitter {
  private performanceMonitor: PerformanceMonitor;
  private patterns: Map<string, PerformancePattern> = new Map();
  private regressions: Map<string, PerformanceRegression> = new Map();
  private opportunities: Map<string, OptimizationOpportunity> = new Map();
  private benchmarks: Map<string, PerformanceBenchmark> = new Map();
  private analysisInterval?: NodeJS.Timeout;
  private isAnalyzing: boolean = false;
  
  // Analysis configuration
  private config = {
    analysisInterval: 30000, // 30 seconds
    regressionThreshold: 15, // 15% degradation
    patternDetectionWindow: 300000, // 5 minutes
    anomalyThreshold: 2.5, // Standard deviations
    forecastAccuracy: 0.85 // 85% confidence threshold
  };

  constructor(performanceMonitor: PerformanceMonitor) {
    super();
    this.performanceMonitor = performanceMonitor;
    this.initializeBenchmarks();
    this.setupPerformanceListeners();
  }

  /**
   * Start performance analytics
   */
  public startAnalytics(): void {
    if (this.isAnalyzing) {
      console.warn('Performance analytics is already running');
      return;
    }

    this.isAnalyzing = true;
    console.log('📈 Performance analytics started');

    // Start periodic analysis
    this.analysisInterval = setInterval(() => {
      this.performComprehensiveAnalysis();
    }, this.config.analysisInterval);

    // Initial analysis
    this.performComprehensiveAnalysis();
    this.emit('analyticsStarted');
  }

  /**
   * Stop performance analytics
   */
  public stopAnalytics(): void {
    if (!this.isAnalyzing) return;

    this.isAnalyzing = false;
    
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = undefined;
    }

    console.log('📈 Performance analytics stopped');
    this.emit('analyticsStopped');
  }

  /**
   * Perform comprehensive performance analysis
   */
  private performComprehensiveAnalysis(): void {
    try {
      this.detectPerformancePatterns();
      this.detectRegressions();
      this.identifyOptimizationOpportunities();
      this.updateBenchmarks();
      this.generateCapacityForecasts();
      this.cleanupOldData();
      
      this.emit('analysisCompleted', {
        patterns: Array.from(this.patterns.values()),
        regressions: Array.from(this.regressions.values()),
        opportunities: Array.from(this.opportunities.values()),
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Performance analysis failed:', error);
      this.emit('analysisError', error);
    }
  }

  /**
   * Detect performance patterns and anomalies
   */
  private detectPerformancePatterns(): void {
    const categories: PerformanceMetric['category'][] = ['cpu', 'memory', 'ai', 'game', 'network'];
    
    categories.forEach(category => {
      const recentMetrics = this.performanceMonitor.getRecentMetrics(
        category, 
        this.config.patternDetectionWindow
      );
      
      if (recentMetrics.length < 10) return; // Need sufficient data

      const values = recentMetrics.map(m => m.value);
      
      // Detect performance spikes
      const spikes = this.detectSpikes(values, category);
      spikes.forEach(spike => this.patterns.set(spike.id, spike));
      
      // Detect performance degradation
      const degradation = this.detectDegradation(values, category);
      if (degradation) this.patterns.set(degradation.id, degradation);
      
      // Detect oscillation patterns
      const oscillation = this.detectOscillation(values, category);
      if (oscillation) this.patterns.set(oscillation.id, oscillation);
      
      // Detect anomalies
      const anomalies = this.detectAnomalies(values, category);
      anomalies.forEach(anomaly => this.patterns.set(anomaly.id, anomaly));
    });
  }

  /**
   * Detect performance spikes
   */
  private detectSpikes(values: number[], category: PerformanceMetric['category']): PerformancePattern[] {
    const spikes: PerformancePattern[] = [];
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const threshold = mean * 2; // Spike if value is 2x average
    
    for (let i = 0; i < values.length; i++) {
      if (values[i] > threshold) {
        const spike: PerformancePattern = {
          id: `spike_${category}_${Date.now()}_${i}`,
          name: `Performance Spike in ${category}`,
          category: 'spike',
          severity: values[i] > mean * 3 ? 'critical' : values[i] > mean * 2.5 ? 'high' : 'medium',
          description: `Detected performance spike: ${values[i]} (${((values[i] / mean - 1) * 100).toFixed(1)}% above average)`,
          detectedAt: Date.now(),
          duration: 1000, // Approximate duration
          impact: {
            performance: Math.min((values[i] / mean - 1) * 100, 100),
            users: this.estimateUserImpact(category, values[i] / mean),
            systems: this.getAffectedSystems(category)
          },
          rootCause: {
            likely: this.inferSpikeRootCause(category, values[i]),
            contributing: this.getContributingFactors(category),
            confidence: 70
          },
          recommendation: this.generateSpikeRecommendation(category, values[i] / mean)
        };
        spikes.push(spike);
      }
    }
    
    return spikes;
  }

  /**
   * Detect performance degradation
   */
  private detectDegradation(values: number[], category: PerformanceMetric['category']): PerformancePattern | null {
    if (values.length < 6) return null;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const degradationPercent = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (degradationPercent > this.config.regressionThreshold) {
      return {
        id: `degradation_${category}_${Date.now()}`,
        name: `Performance Degradation in ${category}`,
        category: 'degradation',
        severity: degradationPercent > 50 ? 'critical' : degradationPercent > 30 ? 'high' : 'medium',
        description: `Detected ${degradationPercent.toFixed(1)}% performance degradation`,
        detectedAt: Date.now(),
        duration: this.config.patternDetectionWindow,
        impact: {
          performance: degradationPercent,
          users: this.estimateUserImpact(category, secondAvg / firstAvg),
          systems: this.getAffectedSystems(category)
        },
        rootCause: {
          likely: this.inferDegradationRootCause(category),
          contributing: ['Resource exhaustion', 'Memory leaks', 'Inefficient algorithms'],
          confidence: 65
        },
        recommendation: this.generateDegradationRecommendation(category, degradationPercent)
      };
    }
    
    return null;
  }

  /**
   * Detect oscillation patterns
   */
  private detectOscillation(values: number[], category: PerformanceMetric['category']): PerformancePattern | null {
    if (values.length < 8) return null;
    
    // Simple oscillation detection: count direction changes
    let directionChanges = 0;
    for (let i = 2; i < values.length; i++) {
      const prev = values[i - 1] - values[i - 2];
      const current = values[i] - values[i - 1];
      if ((prev > 0 && current < 0) || (prev < 0 && current > 0)) {
        directionChanges++;
      }
    }
    
    const oscillationRatio = directionChanges / (values.length - 2);
    
    if (oscillationRatio > 0.6) { // High frequency of direction changes
      return {
        id: `oscillation_${category}_${Date.now()}`,
        name: `Performance Oscillation in ${category}`,
        category: 'oscillation',
        severity: oscillationRatio > 0.8 ? 'high' : 'medium',
        description: `Detected unstable performance with ${directionChanges} direction changes`,
        detectedAt: Date.now(),
        duration: this.config.patternDetectionWindow,
        impact: {
          performance: oscillationRatio * 50,
          users: this.estimateUserImpact(category, 1.2),
          systems: this.getAffectedSystems(category)
        },
        rootCause: {
          likely: 'Resource contention or inefficient scheduling',
          contributing: ['Thread contention', 'I/O blocking', 'Memory pressure'],
          confidence: 60
        },
        recommendation: {
          immediate: ['Monitor resource usage', 'Check for blocking operations'],
          shortTerm: ['Optimize critical sections', 'Implement better scheduling'],
          longTerm: ['Redesign resource management', 'Add performance buffers'],
          priority: 'medium',
          estimatedEffort: 'moderate'
        }
      };
    }
    
    return null;
  }

  /**
   * Detect statistical anomalies
   */
  private detectAnomalies(values: number[], category: PerformanceMetric['category']): PerformancePattern[] {
    const anomalies: PerformancePattern[] = [];
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    values.forEach((value, index) => {
      const zScore = Math.abs((value - mean) / stdDev);
      
      if (zScore > this.config.anomalyThreshold) {
        anomalies.push({
          id: `anomaly_${category}_${Date.now()}_${index}`,
          name: `Performance Anomaly in ${category}`,
          category: 'anomaly',
          severity: zScore > 4 ? 'critical' : zScore > 3 ? 'high' : 'medium',
          description: `Statistical anomaly detected (Z-score: ${zScore.toFixed(2)})`,
          detectedAt: Date.now(),
          duration: 1000,
          impact: {
            performance: Math.min(zScore * 20, 100),
            users: this.estimateUserImpact(category, value / mean),
            systems: this.getAffectedSystems(category)
          },
          rootCause: {
            likely: 'Unexpected system behavior or external factor',
            contributing: ['Resource spikes', 'External system latency', 'Configuration changes'],
            confidence: 50
          },
          recommendation: {
            immediate: ['Investigate root cause', 'Monitor system logs'],
            shortTerm: ['Add alerting for similar patterns', 'Implement circuit breakers'],
            longTerm: ['Improve system resilience', 'Add predictive monitoring'],
            priority: 'high',
            estimatedEffort: 'moderate'
          }
        });
      }
    });
    
    return anomalies;
  }

  /**
   * Detect performance regressions
   */
  private detectRegressions(): void {
    const summary = this.performanceMonitor.getPerformanceSummary();
    
    Object.entries(summary.categories).forEach(([category, data]) => {
      const categoryKey = category as PerformanceMetric['category'];
      const benchmark = this.benchmarks.get(categoryKey);
      
      if (benchmark && data.current > 0) {
        const regressionPercent = ((data.current - benchmark.baseline.value) / benchmark.baseline.value) * 100;
        
        if (regressionPercent > this.config.regressionThreshold) {
          const regression: PerformanceRegression = {
            id: `regression_${categoryKey}_${Date.now()}`,
            metric: benchmark.name,
            category: categoryKey,
            baselineValue: benchmark.baseline.value,
            currentValue: data.current,
            regressionPercent,
            detectedAt: Date.now(),
            severity: this.classifyRegressionSeverity(regressionPercent),
            status: 'detected',
            possibleCauses: this.identifyRegressionCauses(categoryKey, regressionPercent)
          };
          
          this.regressions.set(regression.id, regression);
          this.emit('regressionDetected', regression);
        }
      }
    });
  }

  /**
   * Identify optimization opportunities
   */
  private identifyOptimizationOpportunities(): void {
    const summary = this.performanceMonitor.getPerformanceSummary();
    
    // AI optimization opportunities
    if (summary.categories.ai?.average > 50) {
      const opportunity: OptimizationOpportunity = {
        id: `opt_ai_${Date.now()}`,
        area: 'AI Decision Making',
        category: 'ai',
        currentPerformance: summary.categories.ai.average,
        targetPerformance: 30,
        potentialGain: ((summary.categories.ai.average - 30) / summary.categories.ai.average) * 100,
        effort: 'medium',
        impact: 'high',
        priority: 8,
        description: 'AI decision times can be optimized through caching and algorithm improvements',
        implementation: {
          steps: [
            'Implement decision result caching',
            'Optimize prediction algorithms',
            'Add parallel processing for complex decisions',
            'Implement adaptive decision complexity'
          ],
          resources: ['AI Engineer', 'Performance Engineer'],
          timeline: '2-3 weeks',
          risks: ['Potential accuracy trade-offs', 'Increased complexity']
        }
      };
      
      this.opportunities.set(opportunity.id, opportunity);
    }

    // Memory optimization opportunities
    if (summary.categories.memory?.average > 400) {
      const opportunity: OptimizationOpportunity = {
        id: `opt_memory_${Date.now()}`,
        area: 'Memory Management',
        category: 'memory',
        currentPerformance: summary.categories.memory.average,
        targetPerformance: 300,
        potentialGain: ((summary.categories.memory.average - 300) / summary.categories.memory.average) * 100,
        effort: 'high',
        impact: 'medium',
        priority: 6,
        description: 'Memory usage can be reduced through better object lifecycle management',
        implementation: {
          steps: [
            'Implement object pooling',
            'Optimize data structures',
            'Add garbage collection tuning',
            'Implement memory profiling'
          ],
          resources: ['Backend Engineer', 'DevOps Engineer'],
          timeline: '3-4 weeks',
          risks: ['Complexity increase', 'Potential stability issues']
        }
      };
      
      this.opportunities.set(opportunity.id, opportunity);
    }
  }

  /**
   * Generate capacity forecasts
   */
  private generateCapacityForecasts(): CapacityForecast[] {
    const forecasts: CapacityForecast[] = [];
    const summary = this.performanceMonitor.getPerformanceSummary();
    
    Object.entries(summary.categories).forEach(([category, data]) => {
      const categoryKey = category as PerformanceMetric['category'];
      
      if (data.trend === 'degrading' && data.average > 0) {
        const forecast: CapacityForecast = {
          metric: category,
          category: categoryKey,
          currentCapacity: data.current,
          projectedCapacity: {
            nextWeek: data.current * 1.1,
            nextMonth: data.current * 1.3,
            nextQuarter: data.current * 1.8
          },
          recommendedActions: {
            immediate: [`Monitor ${category} usage closely`, 'Set up alerting'],
            planned: [`Optimize ${category} performance`, 'Scale resources if needed']
          },
          confidence: this.config.forecastAccuracy
        };
        
        forecasts.push(forecast);
      }
    });
    
    return forecasts;
  }

  /**
   * Initialize performance benchmarks
   */
  private initializeBenchmarks(): void {
    const benchmarks = [
      {
        id: 'ai',
        name: 'AI Decision Time',
        category: 'ai' as const,
        baseline: { value: 30, timestamp: Date.now(), conditions: ['Normal load'] },
        target: { value: 25, description: 'Optimal AI response time' }
      },
      {
        id: 'memory',
        name: 'Memory Usage',
        category: 'memory' as const,
        baseline: { value: 200, timestamp: Date.now(), conditions: ['Normal load'] },
        target: { value: 300, description: 'Acceptable memory usage' }
      },
      {
        id: 'game',
        name: 'Game Update Time',
        category: 'game' as const,
        baseline: { value: 8, timestamp: Date.now(), conditions: ['60 FPS target'] },
        target: { value: 16, description: 'Maximum frame time for 60 FPS' }
      }
    ];
    
    benchmarks.forEach(benchmark => {
      this.benchmarks.set(benchmark.category, {
        ...benchmark,
        current: {
          value: benchmark.baseline.value,
          trend: 'stable',
          percentOfTarget: (benchmark.baseline.value / benchmark.target.value) * 100
        }
      });
    });
  }

  /**
   * Update performance benchmarks
   */
  private updateBenchmarks(): void {
    const summary = this.performanceMonitor.getPerformanceSummary();
    
    this.benchmarks.forEach((benchmark, category) => {
      const categoryData = summary.categories[category as keyof typeof summary.categories];
      if (categoryData) {
        benchmark.current = {
          value: categoryData.current,
          trend: categoryData.trend,
          percentOfTarget: (categoryData.current / benchmark.target.value) * 100
        };
      }
    });
  }

  /**
   * Setup performance monitor event listeners
   */
  private setupPerformanceListeners(): void {
    this.performanceMonitor.on('performanceAlert', (alert) => {
      // Correlate alerts with patterns for better insights
      this.correlateAlertWithPatterns(alert);
    });
  }

  /**
   * Helper methods for pattern analysis
   */
  private estimateUserImpact(category: PerformanceMetric['category'], multiplier: number): number {
    const baseImpact = {
      ai: 30,
      game: 50,
      memory: 20,
      cpu: 40,
      network: 35,
      system: 25
    };
    
    return Math.min(Math.round(baseImpact[category] * multiplier), 100);
  }

  private getAffectedSystems(category: PerformanceMetric['category']): string[] {
    const systemMap = {
      ai: ['AIPlayer', 'GameSynchronizer'],
      game: ['GameLoop', 'Collision Detection', 'State Management'],
      memory: ['Object Allocation', 'Garbage Collection'],
      cpu: ['All Systems'],
      network: ['WebSocket', 'Message Processing'],
      system: ['Core Infrastructure']
    };
    
    return systemMap[category] || ['Unknown'];
  }

  private inferSpikeRootCause(category: PerformanceMetric['category'], value: number): string {
    const causeMap = {
      ai: 'Complex decision scenario or algorithm inefficiency',
      game: 'Collision detection overhead or state synchronization',
      memory: 'Memory allocation spike or garbage collection',
      cpu: 'CPU-intensive operation or resource contention',
      network: 'Network congestion or message queue backup',
      system: 'System resource exhaustion or external dependency'
    };
    
    return causeMap[category] || 'Unknown performance bottleneck';
  }

  private getContributingFactors(category: PerformanceMetric['category']): string[] {
    return [
      'Increased system load',
      'Resource contention',
      'External dependencies',
      'Configuration changes'
    ];
  }

  private generateSpikeRecommendation(category: PerformanceMetric['category'], multiplier: number): PerformancePattern['recommendation'] {
    return {
      immediate: ['Monitor system resources', 'Check for blocking operations'],
      shortTerm: [`Optimize ${category} performance`, 'Add performance buffers'],
      longTerm: ['Implement predictive scaling', 'Redesign architecture if needed'],
      priority: multiplier > 3 ? 'high' : 'medium',
      estimatedEffort: multiplier > 3 ? 'significant' : 'moderate'
    };
  }

  private inferDegradationRootCause(category: PerformanceMetric['category']): string {
    return `Gradual performance degradation in ${category} - likely memory leak, resource exhaustion, or algorithmic inefficiency`;
  }

  private generateDegradationRecommendation(category: PerformanceMetric['category'], percent: number): PerformancePattern['recommendation'] {
    return {
      immediate: ['Profile system performance', 'Check for memory leaks'],
      shortTerm: [`Optimize ${category} algorithms`, 'Implement performance monitoring'],
      longTerm: ['Refactor performance-critical code', 'Add automated optimization'],
      priority: percent > 30 ? 'high' : 'medium',
      estimatedEffort: percent > 30 ? 'significant' : 'moderate'
    };
  }

  private classifyRegressionSeverity(percent: number): PerformanceRegression['severity'] {
    if (percent > 50) return 'critical';
    if (percent > 30) return 'major';
    if (percent > 15) return 'moderate';
    return 'minor';
  }

  private identifyRegressionCauses(category: PerformanceMetric['category'], percent: number): string[] {
    const commonCauses = [
      'Recent code changes',
      'Configuration updates',
      'Increased system load',
      'Resource exhaustion'
    ];
    
    const categorySpecificCauses = {
      ai: ['Algorithm changes', 'Model complexity increase'],
      memory: ['Memory leaks', 'Object lifecycle issues'],
      game: ['Physics calculation changes', 'Rendering updates'],
      cpu: ['Inefficient algorithms', 'Blocking operations'],
      network: ['Network configuration', 'Message size increase'],
      system: ['Infrastructure changes', 'Dependency updates']
    };
    
    return [...commonCauses, ...(categorySpecificCauses[category] || [])];
  }

  private correlateAlertWithPatterns(alert: any): void {
    // Find related patterns for better alert context
    const relatedPatterns = Array.from(this.patterns.values())
      .filter(pattern => 
        pattern.category === alert.category && 
        Math.abs(pattern.detectedAt - alert.timestamp) < 60000 // Within 1 minute
      );
    
    if (relatedPatterns.length > 0) {
      this.emit('correlatedAlert', {
        alert,
        patterns: relatedPatterns
      });
    }
  }

  private cleanupOldData(): void {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    // Clean up old patterns
    this.patterns.forEach((pattern, id) => {
      if (pattern.detectedAt < cutoffTime) {
        this.patterns.delete(id);
      }
    });
    
    // Clean up old regressions
    this.regressions.forEach((regression, id) => {
      if (regression.detectedAt < cutoffTime && regression.status === 'resolved') {
        this.regressions.delete(id);
      }
    });
    
    // Clean up old opportunities (keep active ones)
    this.opportunities.forEach((opportunity, id) => {
      const opportunityTime = parseInt(id.split('_')[2]);
      if (opportunityTime < cutoffTime) {
        this.opportunities.delete(id);
      }
    });
  }

  /**
   * Get analytics summary
   */
  public getAnalyticsSummary(): any {
    return {
      patterns: {
        total: this.patterns.size,
        critical: Array.from(this.patterns.values()).filter(p => p.severity === 'critical').length,
        active: Array.from(this.patterns.values()).filter(p => 
          Date.now() - p.detectedAt < 300000 // Last 5 minutes
        ).length
      },
      regressions: {
        total: this.regressions.size,
        unresolved: Array.from(this.regressions.values()).filter(r => r.status !== 'resolved').length,
        critical: Array.from(this.regressions.values()).filter(r => r.severity === 'critical').length
      },
      opportunities: {
        total: this.opportunities.size,
        highPriority: Array.from(this.opportunities.values()).filter(o => o.priority >= 7).length,
        totalPotentialGain: Array.from(this.opportunities.values())
          .reduce((sum, o) => sum + o.potentialGain, 0)
      },
      benchmarks: Object.fromEntries(this.benchmarks),
      lastAnalysis: Date.now()
    };
  }

  /**
   * Get detailed analytics report
   */
  public generateAnalyticsReport(): any {
    return {
      reportId: `analytics-${Date.now()}`,
      timestamp: Date.now(),
      summary: this.getAnalyticsSummary(),
      patterns: Array.from(this.patterns.values()),
      regressions: Array.from(this.regressions.values()),
      opportunities: Array.from(this.opportunities.values()),
      benchmarks: Array.from(this.benchmarks.values()),
      forecasts: this.generateCapacityForecasts(),
      recommendations: this.generateTopRecommendations()
    };
  }

  private generateTopRecommendations(): any[] {
    const allRecommendations = [
      ...Array.from(this.patterns.values()).map(p => ({
        source: 'pattern',
        priority: p.recommendation.priority,
        category: p.category,
        recommendations: p.recommendation
      })),
      ...Array.from(this.opportunities.values())
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 5)
        .map(o => ({
          source: 'optimization',
          priority: o.priority >= 7 ? 'high' : o.priority >= 4 ? 'medium' : 'low',
          category: o.category,
          recommendations: {
            immediate: o.implementation.steps.slice(0, 2),
            shortTerm: o.implementation.steps.slice(2),
            longTerm: [`Complete ${o.area} optimization`],
            priority: o.impact,
            estimatedEffort: o.effort
          }
        }))
    ];
    
    return allRecommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      })
      .slice(0, 10);
  }
}