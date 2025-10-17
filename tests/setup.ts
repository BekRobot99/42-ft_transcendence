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
(global as any).createMockGameState = () => ({
  ball: { x: 400, y: 300, velocityX: 3, velocityY: 2, speed: 5 },
  canvas: { width: 800, height: 600 },
  paddles: {
    player1: { y: 250, height: 100, width: 10, speed: 5 },
    player2: { y: 250, height: 100, width: 10, speed: 5 }
  },
  score: { player1: 0, player2: 0 },
  gameActive: true,
  isPaused: false,
  lastUpdate: Date.now()
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