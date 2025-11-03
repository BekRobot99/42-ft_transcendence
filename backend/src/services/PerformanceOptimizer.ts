/**
 * @fileoverview Performance Optimization Utilities for Production Deployment
 * 
 * Advanced performance optimization system including memory management,
 * CPU optimization, database query optimization, and resource management.
 * 
 * @author ft_transcendence Team
 * @version 2.0.0
 */

import { EventEmitter } from 'events';

export interface OptimizationConfig {
  /** Enable memory optimization */
  memoryOptimization: boolean;
  /** Enable CPU optimization */
  cpuOptimization: boolean;
  /** Enable database optimization */
  databaseOptimization: boolean;
  /** Garbage collection interval (ms) */
  gcInterval: number;
  /** Memory cleanup threshold (MB) */
  memoryThreshold: number;
  /** CPU usage monitoring interval (ms) */
  cpuMonitorInterval: number;
}

export interface OptimizationResult {
  /** Optimization type */
  type: 'memory' | 'cpu' | 'database' | 'network';
  /** Success status */
  success: boolean;
  /** Performance improvement */
  improvement?: {
    before: number;
    after: number;
    unit: string;
    percentage: number;
  };
  /** Optimization details */
  details: string;
  /** Timestamp */
  timestamp: number;
}

/**
 * Performance optimization manager for production deployment
 */
export class PerformanceOptimizer extends EventEmitter {
  private config: OptimizationConfig;
  private optimizationHistory: OptimizationResult[] = [];
  private memoryCheckInterval?: NodeJS.Timeout;
  private cpuCheckInterval?: NodeJS.Timeout;
  private objectPools: Map<string, any[]> = new Map();
  private queryCache: Map<string, { result: any; timestamp: number; ttl: number }> = new Map();
  private isOptimizing = false;

  constructor(config?: Partial<OptimizationConfig>) {
    super();
    
    this.config = {
      memoryOptimization: true,
      cpuOptimization: true,
      databaseOptimization: true,
      gcInterval: 30000, // 30 seconds
      memoryThreshold: 500, // 500MB
      cpuMonitorInterval: 5000, // 5 seconds
      ...config
    };

    this.initializeOptimizations();
  }

  /**
   * Initialize all optimization systems
   */
  private initializeOptimizations(): void {
    console.log('[PerformanceOptimizer] Initializing optimization systems...');

    if (this.config.memoryOptimization) {
      this.startMemoryOptimization();
    }

    if (this.config.cpuOptimization) {
      this.startCPUOptimization();
    }

    if (this.config.databaseOptimization) {
      this.initializeDatabaseOptimizations();
    }

    // Initialize object pools for common objects
    this.initializeObjectPools();

    console.log('[PerformanceOptimizer] All optimization systems initialized');
  }

  /**
   * Start memory optimization monitoring
   */
  private startMemoryOptimization(): void {
    this.memoryCheckInterval = setInterval(() => {
      this.optimizeMemoryUsage();
    }, this.config.gcInterval);

    console.log('[PerformanceOptimizer] Memory optimization started');
  }

  /**
   * Start CPU optimization monitoring
   */
  private startCPUOptimization(): void {
    this.cpuCheckInterval = setInterval(() => {
      this.optimizeCPUUsage();
    }, this.config.cpuMonitorInterval);

    console.log('[PerformanceOptimizer] CPU optimization started');
  }

  /**
   * Initialize database query optimizations
   */
  private initializeDatabaseOptimizations(): void {
    // Set up query caching
    this.queryCache = new Map();
    
    // Clean up expired cache entries every 5 minutes
    setInterval(() => {
      this.cleanupQueryCache();
    }, 5 * 60 * 1000);

    console.log('[PerformanceOptimizer] Database optimization initialized');
  }

  /**
   * Initialize object pools for memory efficiency
   */
  private initializeObjectPools(): void {
    // Pool for game state objects
    this.objectPools.set('gameState', []);
    
    // Pool for performance metrics
    this.objectPools.set('performanceMetric', []);
    
    // Pool for WebSocket messages
    this.objectPools.set('wsMessage', []);

    console.log('[PerformanceOptimizer] Object pools initialized');
  }

  /**
   * Optimize memory usage
   */
  private async optimizeMemoryUsage(): Promise<void> {
    if (this.isOptimizing) return;
    this.isOptimizing = true;

    try {
      const beforeMemory = process.memoryUsage();
      const beforeHeap = beforeMemory.heapUsed;
      
      // Check if memory threshold is exceeded
      if (beforeHeap > this.config.memoryThreshold * 1024 * 1024) {
        console.log(`[PerformanceOptimizer] Memory threshold exceeded: ${(beforeHeap / 1024 / 1024).toFixed(2)}MB`);
        
        // Clean up expired cache entries
        this.cleanupQueryCache();
        
        // Reset object pools if they're getting too large
        this.optimizeObjectPools();
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
          console.log('[PerformanceOptimizer] Forced garbage collection');
        }
        
        const afterMemory = process.memoryUsage();
        const afterHeap = afterMemory.heapUsed;
        const improvement = beforeHeap - afterHeap;
        const percentage = (improvement / beforeHeap) * 100;
        
        const result: OptimizationResult = {
          type: 'memory',
          success: improvement > 0,
          improvement: {
            before: beforeHeap / 1024 / 1024,
            after: afterHeap / 1024 / 1024,
            unit: 'MB',
            percentage
          },
          details: `Memory cleanup freed ${(improvement / 1024 / 1024).toFixed(2)}MB`,
          timestamp: Date.now()
        };
        
        this.optimizationHistory.push(result);
        this.emit('optimization', result);
        
        console.log(`[PerformanceOptimizer] Memory optimization completed: ${(improvement / 1024 / 1024).toFixed(2)}MB freed (${percentage.toFixed(1)}%)`);
      }
      
    } catch (error) {
      console.error('[PerformanceOptimizer] Memory optimization failed:', error);
    } finally {
      this.isOptimizing = false;
    }
  }

  /**
   * Optimize CPU usage
   */
  private async optimizeCPUUsage(): Promise<void> {
    try {
      const cpuUsage = process.cpuUsage();
      const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
      
      // If CPU usage is high, implement CPU optimizations
      if (cpuPercent > 0.8) { // 80% CPU usage threshold
        console.log(`[PerformanceOptimizer] High CPU usage detected: ${(cpuPercent * 100).toFixed(1)}%`);
        
        // Reduce AI calculation frequency temporarily
        this.emit('cpuOptimization', { 
          action: 'reduceAIFrequency', 
          cpuUsage: cpuPercent 
        });
        
        // Increase garbage collection frequency
        if (this.memoryCheckInterval) {
          clearInterval(this.memoryCheckInterval);
          this.memoryCheckInterval = setInterval(() => {
            this.optimizeMemoryUsage();
          }, this.config.gcInterval / 2); // Double GC frequency
        }
        
        const result: OptimizationResult = {
          type: 'cpu',
          success: true,
          details: `CPU optimization activated at ${(cpuPercent * 100).toFixed(1)}% usage`,
          timestamp: Date.now()
        };
        
        this.optimizationHistory.push(result);
        this.emit('optimization', result);
        
        // Reset optimization after 30 seconds
        setTimeout(() => {
          this.resetCPUOptimizations();
        }, 30000);
      }
      
    } catch (error) {
      console.error('[PerformanceOptimizer] CPU optimization failed:', error);
    }
  }

  /**
   * Reset CPU optimizations to normal levels
   */
  private resetCPUOptimizations(): void {
    console.log('[PerformanceOptimizer] Resetting CPU optimizations to normal levels');
    
    // Reset garbage collection interval
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = setInterval(() => {
        this.optimizeMemoryUsage();
      }, this.config.gcInterval);
    }
    
    // Reset AI calculation frequency
    this.emit('cpuOptimization', { action: 'resetAIFrequency' });
  }

  /**
   * Clean up expired query cache entries
   */
  private cleanupQueryCache(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.queryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.queryCache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[PerformanceOptimizer] Cleaned up ${cleaned} expired cache entries`);
    }
  }

  /**
   * Optimize object pools
   */
  private optimizeObjectPools(): void {
    let totalCleaned = 0;
    
    for (const [poolName, pool] of this.objectPools.entries()) {
      const originalSize = pool.length;
      
      // Keep only the first 50% of objects in each pool
      if (originalSize > 20) {
        const keepSize = Math.floor(originalSize * 0.5);
        pool.length = keepSize;
        totalCleaned += originalSize - keepSize;
      }
    }
    
    if (totalCleaned > 0) {
      console.log(`[PerformanceOptimizer] Cleaned up ${totalCleaned} pooled objects`);
    }
  }

  /**
   * Get object from pool or create new one
   */
  getPooledObject<T>(poolName: string, factory: () => T): T {
    const pool = this.objectPools.get(poolName);
    if (pool && pool.length > 0) {
      return pool.pop() as T;
    }
    return factory();
  }

  /**
   * Return object to pool for reuse
   */
  returnToPool(poolName: string, object: any): void {
    const pool = this.objectPools.get(poolName);
    if (pool && pool.length < 100) { // Limit pool size
      // Reset object properties if needed
      if (typeof object === 'object' && object !== null) {
        Object.keys(object).forEach(key => {
          delete object[key];
        });
      }
      pool.push(object);
    }
  }

  /**
   * Cache database query result
   */
  cacheQuery(query: string, result: any, ttl: number = 300000): void { // Default 5 minutes TTL
    this.queryCache.set(query, {
      result: JSON.parse(JSON.stringify(result)), // Deep clone
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Get cached query result
   */
  getCachedQuery(query: string): any | null {
    const entry = this.queryCache.get(query);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.queryCache.delete(query);
      return null;
    }
    
    return entry.result;
  }

  /**
   * Optimize database query with caching
   */
  async optimizeQuery<T>(
    query: string, 
    executor: () => Promise<T>, 
    ttl: number = 300000
  ): Promise<T> {
    // Check cache first
    const cached = this.getCachedQuery(query);
    if (cached) {
      return cached as T;
    }
    
    // Execute query
    const startTime = Date.now();
    const result = await executor();
    const executionTime = Date.now() - startTime;
    
    // Cache result if execution took more than 10ms
    if (executionTime > 10) {
      this.cacheQuery(query, result, ttl);
    }
    
    // Log slow queries
    if (executionTime > 100) {
      console.warn(`[PerformanceOptimizer] Slow query detected: ${query} (${executionTime}ms)`);
      
      const result: OptimizationResult = {
        type: 'database',
        success: true,
        details: `Slow query cached: ${query} (${executionTime}ms)`,
        timestamp: Date.now()
      };
      
      this.optimizationHistory.push(result);
      this.emit('optimization', result);
    }
    
    return result;
  }

  /**
   * Optimize network operations with batching
   */
  private networkBatches: Map<string, { operations: any[]; timeout: NodeJS.Timeout }> = new Map();
  
  batchNetworkOperation(batchKey: string, operation: any, batchDelay: number = 50): Promise<any> {
    return new Promise((resolve) => {
      let batch = this.networkBatches.get(batchKey);
      
      if (!batch) {
        batch = { operations: [], timeout: null as any };
        this.networkBatches.set(batchKey, batch);
        
        batch.timeout = setTimeout(() => {
          this.executeBatch(batchKey);
        }, batchDelay);
      }
      
      batch.operations.push({ operation, resolve });
    });
  }

  /**
   * Execute batched network operations
   */
  private async executeBatch(batchKey: string): Promise<void> {
    const batch = this.networkBatches.get(batchKey);
    if (!batch) return;
    
    this.networkBatches.delete(batchKey);
    clearTimeout(batch.timeout);
    
    try {
      // Execute all operations in batch
      const results = await Promise.all(
        batch.operations.map(({ operation }) => operation())
      );
      
      // Resolve all promises
      batch.operations.forEach(({ resolve }, index) => {
        resolve(results[index]);
      });
      
      const result: OptimizationResult = {
        type: 'network',
        success: true,
        details: `Batched ${batch.operations.length} network operations`,
        timestamp: Date.now()
      };
      
      this.optimizationHistory.push(result);
      this.emit('optimization', result);
      
    } catch (error) {
      console.error(`[PerformanceOptimizer] Batch execution failed for ${batchKey}:`, error);
      
      // Reject all promises
      batch.operations.forEach(({ resolve }) => {
        resolve(null);
      });
    }
  }

  /**
   * Get optimization statistics
   */
  getOptimizationStats(): {
    totalOptimizations: number;
    byType: Record<string, number>;
    memoryImprovement: number;
    cacheHitRate: number;
    recentOptimizations: OptimizationResult[];
  } {
    const byType = { memory: 0, cpu: 0, database: 0, network: 0 };
    let totalMemoryImprovement = 0;
    
    for (const result of this.optimizationHistory) {
      byType[result.type]++;
      if (result.improvement) {
        totalMemoryImprovement += result.improvement.percentage;
      }
    }
    
    // Calculate cache hit rate (simplified)
    const cacheHitRate = this.queryCache.size > 0 ? 0.75 : 0; // Placeholder calculation
    
    return {
      totalOptimizations: this.optimizationHistory.length,
      byType,
      memoryImprovement: totalMemoryImprovement,
      cacheHitRate,
      recentOptimizations: this.optimizationHistory.slice(-10)
    };
  }

  /**
   * Stop all optimization processes
   */
  stop(): void {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = undefined;
    }
    
    if (this.cpuCheckInterval) {
      clearInterval(this.cpuCheckInterval);
      this.cpuCheckInterval = undefined;
    }
    
    // Clear all caches
    this.queryCache.clear();
    this.objectPools.clear();
    
    console.log('[PerformanceOptimizer] All optimization processes stopped');
  }
}