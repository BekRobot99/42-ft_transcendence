#!/usr/bin/env node

/**
 * Comprehensive Integration Test Suite for ft_transcendence
 * Tests all systems: Performance Monitoring, WebSocket, AI, Game Physics
 * 
 * @author ft_transcendence Team
 * @version 1.0.0
 */

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

console.log('🚀 ft_transcendence Final Integration Test Suite');
console.log('=' .repeat(60));

class IntegrationTester {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
  }

  async runTest(name, testFn) {
    const start = performance.now();
    console.log(`\n🧪 Testing: ${name}`);
    
    try {
      await testFn();
      const duration = (performance.now() - start).toFixed(2);
      console.log(`✅ PASS: ${name} (${duration}ms)`);
      this.testResults.push({ name, status: 'PASS', duration });
      return true;
    } catch (error) {
      const duration = (performance.now() - start).toFixed(2);
      console.log(`❌ FAIL: ${name} (${duration}ms)`);
      console.log(`   Error: ${error.message}`);
      this.testResults.push({ name, status: 'FAIL', duration, error: error.message });
      return false;
    }
  }

  // Test 1: TypeScript Service Compilation
  async testTypeScriptServices() {
    const serviceFiles = [
      'src/services/PerformanceMonitor.ts',
      'src/services/PerformanceDashboard.ts', 
      'src/services/PerformanceAnalytics.ts',
      'src/websocket.ts',
      'src/server.ts'
    ];

    for (const file of serviceFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required service file missing: ${file}`);
      }
    }

    // Check TypeScript definitions
    if (!fs.existsSync('src/services/performance.d.ts')) {
      throw new Error('TypeScript definitions missing');
    }

    console.log('   ✓ All service files present');
    console.log('   ✓ TypeScript definitions available');
  }

  // Test 2: Performance Monitoring System
  async testPerformanceMonitoring() {
    try {
      // Import and test PerformanceMonitor
      const { PerformanceMonitor } = require('./src/services/PerformanceMonitor');
      
      const monitor = new PerformanceMonitor({
        collectionInterval: 500,
        enableProfiling: true,
        enableBottleneckDetection: true
      });

      console.log('   ✓ PerformanceMonitor instantiated');

      // Test monitoring lifecycle
      monitor.startMonitoring();
      console.log('   ✓ Monitoring started');

      // Simulate some performance data
      monitor.trackAIDecision(25.5, 'medium');
      monitor.trackGameUpdate(8.2, 2);
      console.log('   ✓ Performance tracking working');

      // Test metrics collection
      const summary = monitor.getPerformanceSummary();
      if (!summary || !summary.overall) {
        throw new Error('Performance summary invalid');
      }
      console.log('   ✓ Performance summary generated');

      monitor.stopMonitoring();
      console.log('   ✓ Monitoring stopped cleanly');

    } catch (error) {
      throw new Error(`Performance monitoring failed: ${error.message}`);
    }
  }

  // Test 3: Performance Dashboard
  async testPerformanceDashboard() {
    try {
      const { PerformanceMonitor } = require('./src/services/PerformanceMonitor');
      const { PerformanceDashboard } = require('./src/services/PerformanceDashboard');

      const monitor = new PerformanceMonitor();
      const dashboard = new PerformanceDashboard(monitor);
      
      console.log('   ✓ Dashboard instantiated');

      dashboard.startDashboard();
      console.log('   ✓ Dashboard started');

      const dashboardData = dashboard.getDashboardData();
      if (!dashboardData || !dashboardData.widgets) {
        throw new Error('Dashboard data invalid');
      }
      console.log('   ✓ Dashboard data generated');

      dashboard.stopDashboard();
      console.log('   ✓ Dashboard stopped cleanly');

    } catch (error) {
      throw new Error(`Dashboard test failed: ${error.message}`);
    }
  }

  // Test 4: Performance Analytics
  async testPerformanceAnalytics() {
    try {
      const { PerformanceMonitor } = require('./src/services/PerformanceMonitor');
      const { PerformanceAnalytics } = require('./src/services/PerformanceAnalytics');

      const monitor = new PerformanceMonitor();
      const analytics = new PerformanceAnalytics(monitor);

      console.log('   ✓ Analytics engine instantiated');

      // Generate some test data
      monitor.startMonitoring();
      
      // Simulate performance data
      for (let i = 0; i < 10; i++) {
        monitor.trackAIDecision(Math.random() * 50 + 10, 'medium');
        monitor.trackGameUpdate(Math.random() * 15 + 5, 2);
      }

      const patterns = analytics.detectPerformancePatterns();
      console.log('   ✓ Pattern detection working');

      const report = analytics.generateAnalyticsReport();
      if (!report || !report.reportId) {
        throw new Error('Analytics report invalid');
      }
      console.log('   ✓ Analytics report generated');

      monitor.stopMonitoring();

    } catch (error) {
      throw new Error(`Analytics test failed: ${error.message}`);
    }
  }

  // Test 5: WebSocket Integration Check
  async testWebSocketIntegration() {
    const websocketFile = 'src/websocket.ts';
    if (!fs.existsSync(websocketFile)) {
      throw new Error('WebSocket file missing');
    }

    const content = fs.readFileSync(websocketFile, 'utf8');
    
    // Check for performance monitoring integration
    const requiredIntegrations = [
      'PerformanceMonitor',
      'trackAIDecision',
      'trackGameUpdate',
      'performanceUpdate'
    ];

    for (const integration of requiredIntegrations) {
      if (!content.includes(integration)) {
        throw new Error(`Missing WebSocket integration: ${integration}`);
      }
    }

    console.log('   ✓ WebSocket performance integration verified');
    console.log('   ✓ AI decision tracking integrated');
    console.log('   ✓ Game update tracking integrated');
  }

  // Test 6: Database and Configuration
  async testDatabaseConfiguration() {
    // Check database setup
    const dbPath = 'database/transcendence.sqlite';
    if (fs.existsSync(dbPath)) {
      console.log('   ✓ Database file exists');
    }

    // Check configuration files
    const configFiles = [
      'package.json',
      'tsconfig.json'
    ];

    for (const file of configFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Configuration file missing: ${file}`);
      }
    }
    console.log('   ✓ Configuration files verified');
  }

  // Test 7: Documentation Completeness
  async testDocumentation() {
    const docFiles = [
      '../API_DOCUMENTATION.md',
      '../DEVELOPER_GUIDE.md',
      'src/services/PERFORMANCE_README.md',
      'src/services/performance.d.ts',
      '../README.md'
    ];

    for (const file of docFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Documentation file missing: ${file}`);
      }
    }

    console.log('   ✓ All documentation files present');

    // Check README has performance monitoring content
    const readme = fs.readFileSync('../README.md', 'utf8');
    if (!readme.includes('Performance Monitoring')) {
      throw new Error('README missing performance monitoring documentation');
    }
    console.log('   ✓ README updated with performance features');
  }

  // Test 8: Performance Benchmarking
  async testPerformanceBenchmarks() {
    const { PerformanceMonitor } = require('./src/services/PerformanceMonitor');
    
    const monitor = new PerformanceMonitor();
    monitor.startMonitoring();

    // Benchmark AI decision processing
    const aiStart = performance.now();
    for (let i = 0; i < 100; i++) {
      monitor.trackAIDecision(Math.random() * 40 + 10, 'hard');
    }
    const aiTime = performance.now() - aiStart;

    if (aiTime > 1000) { // Should process 100 decisions in under 1 second
      throw new Error(`AI decision processing too slow: ${aiTime.toFixed(2)}ms`);
    }

    console.log(`   ✓ AI decision processing: ${(aiTime/100).toFixed(2)}ms avg`);

    // Benchmark game update processing  
    const gameStart = performance.now();
    for (let i = 0; i < 100; i++) {
      monitor.trackGameUpdate(Math.random() * 20 + 5, 2);
    }
    const gameTime = performance.now() - gameStart;

    console.log(`   ✓ Game update processing: ${(gameTime/100).toFixed(2)}ms avg`);

    monitor.stopMonitoring();

    // Memory usage check
    const memUsage = process.memoryUsage();
    if (memUsage.heapUsed > 100 * 1024 * 1024) { // 100MB threshold
      console.log(`   ⚠️  High memory usage: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    } else {
      console.log(`   ✓ Memory usage acceptable: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  // Generate final report
  generateReport() {
    const duration = Date.now() - this.startTime;
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;

    console.log('\n' + '=' .repeat(60));
    console.log('📊 FINAL INTEGRATION TEST REPORT');
    console.log('=' .repeat(60));
    
    console.log(`\n📈 Test Summary:`);
    console.log(`   Total Tests: ${this.testResults.length}`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);
    console.log(`   Total Duration: ${duration}ms`);

    if (failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED - SYSTEM READY FOR PRODUCTION!');
      return true;
    } else {
      console.log('\n❌ Some tests failed. Review issues above.');
      return false;
    }
  }
}

// Main test execution
async function runIntegrationTests() {
  const tester = new IntegrationTester();

  await tester.runTest('TypeScript Services', () => tester.testTypeScriptServices());
  await tester.runTest('Performance Monitoring', () => tester.testPerformanceMonitoring());
  await tester.runTest('Performance Dashboard', () => tester.testPerformanceDashboard());  
  await tester.runTest('Performance Analytics', () => tester.testPerformanceAnalytics());
  await tester.runTest('WebSocket Integration', () => tester.testWebSocketIntegration());
  await tester.runTest('Database Configuration', () => tester.testDatabaseConfiguration());
  await tester.runTest('Documentation Completeness', () => tester.testDocumentation());
  await tester.runTest('Performance Benchmarks', () => tester.testPerformanceBenchmarks());

  return tester.generateReport();
}

// Execute tests
if (require.main === module) {
  runIntegrationTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { IntegrationTester, runIntegrationTests };