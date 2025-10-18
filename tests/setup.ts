/**
 * Jest Test Setup Configuration
 * Sets up global test environment and utilities
 */

// Mock WebSocket for testing
class MockWebSocket {
  readyState: number = 1; // OPEN
  
  send(data: string) {
    // Mock implementation
  }
  
  close() {
    this.readyState = 3; // CLOSED
  }
}

// Make WebSocket available globally for tests
(global as any).WebSocket = MockWebSocket;

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeEach(() => {
  // Reset console mocks before each test
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  console.error = originalError;
  console.warn = originalWarn;
});

// Global test utilities
/**
 * Jest Setup File
 * 
 * Global test configuration and utilities for the ft_transcendence test suite
 */

// Global test timeout (30 seconds for comprehensive tests)
jest.setTimeout(30000);

// Mock console methods to reduce test output noise
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error
};

beforeAll(() => {
  // Suppress console output during tests unless VERBOSE_TESTS is set
  if (!process.env.VERBOSE_TESTS) {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  }
});

afterAll(() => {
  // Restore original console methods
  if (!process.env.VERBOSE_TESTS) {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  }
});

// Global test utilities
(global as any).testUtils = {
  // Create a mock WebSocket message
  createMockMessage: (type: string, data: any = {}) => ({
    type,
    timestamp: Date.now(),
    ...data
  }),

  // Create mock game state
  createMockGameState: (overrides: any = {}) => ({
    ball: {
      x: 400,
      y: 300,
      vx: 5,
      vy: 3,
      radius: 10,
      ...overrides.ball
    },
    paddles: {
      left: { y: 250, height: 100, speed: 0, ...overrides.leftPaddle },
      right: { y: 250, height: 100, speed: 0, ...overrides.rightPaddle }
    },
    score: { left: 0, right: 0, ...overrides.score },
    canvas: { width: 800, height: 600, ...overrides.canvas },
    gameActive: true,
    lastUpdate: Date.now(),
    ...overrides
  }),

  // Create mock player object
  createMockPlayer: (overrides: any = {}) => ({
    id: 'test-player-123',
    name: 'Test Player',
    side: 'left',
    connected: true,
    ...overrides
  }),

  // Wait for async operations to complete
  waitFor: (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate random game ID
  generateGameId: () => `game-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
};

// Mock WebSocket for testing
(global as any).MockWebSocket = class MockWebSocket {
  private listeners: Map<string, Function[]> = new Map();
  
  constructor(public url?: string) {}

  addEventListener(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  removeEventListener(event: string, listener: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  send(data: string) {
    // Mock send - can be spied on in tests
  }

  close() {
    // Simulate close event
    this.triggerEvent('close', { code: 1000, reason: 'Normal closure' });
  }

  triggerEvent(event: string, data: any = {}) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  // Mock properties
  readyState = 1; // OPEN
  CONNECTING = 0;
  OPEN = 1;
  CLOSING = 2;
  CLOSED = 3;
};

// Setup performance monitoring mock
(global as any).performance = {
  now: () => Date.now(),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => [])
};

// Mock process.memoryUsage for testing
const originalMemoryUsage = process.memoryUsage;
(process as any).memoryUsage = jest.fn(() => ({
  rss: 50 * 1024 * 1024, // 50MB
  heapTotal: 30 * 1024 * 1024, // 30MB
  heapUsed: 20 * 1024 * 1024, // 20MB
  external: 5 * 1024 * 1024, // 5MB
  arrayBuffers: 1 * 1024 * 1024 // 1MB
}));

// Clean up after all tests
afterAll(() => {
  (process as any).memoryUsage = originalMemoryUsage;
});

(global as any).createMockPlayer = (id: string, isAI: boolean = false) => ({
  id,
  username: `Player_${id}`,
  isAI,
  score: 0,
  paddleY: 250,
  ready: false,
  ...(isAI && { difficulty: 'medium' as const })
});

// Advance timers for async tests
(global as any).advanceTime = async (ms: number) => {
  jest.advanceTimersByTime(ms);
  await new Promise(resolve => setImmediate(resolve));
};