# AI Implementation - Detailed TODO and History

## Session Overview
**Date:** October 2, 2025
**Duration:** ~3 hours debugging AI paddle movement
**Goal:** Fix AI opponent not moving in Pong game

---

## Timeline of Issues and Fixes

### Initial Problem (Start of Session)
**Issue:** AI paddle completely stationary despite having AI logic implemented
**User Report:** "AI is shit", "paddle not moving at all"

---

## Commit 20-21 Context (Before This Session)
Previous work had implemented:
- AI difficulty settings (easy/medium/hard)
- AI decision-making logic
- Smooth paddle interpolation
- Enhanced trajectory prediction

---

## Debugging Process - Step by Step

### 1. Backend Connectivity Check ✅
**Problem:** Backend wasn't running initially
**Solution:**
- Restarted backend process on port 3000
- Verified nginx proxy configuration
- Confirmed https://localhost:8080 accessibility
**Files Involved:** Backend process management
**Status:** RESOLVED

---

### 2. AI Game Creation Flow ✅
**Investigation:** Verified AI game creation process
**Findings:**
- AI games created correctly with `gameType: 'ai'`
- `gameActive` set to `true` immediately (no waiting for player_ready)
- AI player instantiated and activated on creation
**Code Location:** `backend/src/websocket.ts` line 166-430
**Status:** WORKING CORRECTLY

---

### 3. AI Decision-Making Loop - Critical Fix #1 ⚠️
**Problem Found:** AI only updated when human player moved paddle
**Root Cause:** `aiPlayer.updateGameState()` only called in `paddle_move` handler
**Impact:** If human stopped moving, AI stopped thinking

**Solution Implemented:**
```typescript
// Added 60 FPS game loop to continuously feed AI (line 365)
const aiGameLoop = setInterval(() => {
    const room = gameRooms.get(gameId);
    if (!room || !room.gameState.gameActive) {
        clearInterval(aiGameLoop);
        return;
    }
    
    aiPlayer.updateGameState({
        ballX: room.gameState.ball.x,
        ballY: room.gameState.ball.y,
        // ... full game state
    });
}, 16); // 60 FPS
```

**Files Modified:**
- `backend/src/websocket.ts` (line 365-395)

**Status:** IMPLEMENTED BUT INCOMPLETE

---

### 4. AI Timing Logic - Critical Fix #2 ⚠️
**Problem Found:** AI's `updateGameState()` had broken timing logic
**Root Cause:** Double-check contradiction:
```typescript
// Line 225: Check if enough time passed
if (timeSinceLastUpdate >= (this.UPDATE_INTERVAL - this.TIMING_TOLERANCE)) {
    // Line 229: Then ALWAYS skip because this is always true!
    if (timeSinceLastUpdate < this.UPDATE_INTERVAL) {
        return; // ALWAYS SKIPS!
    }
}
```

**Impact:** AI received 2842 updates but made ZERO decisions

**Solution Implemented:**
```typescript
// Simplified to single check (line 225-230)
if (timeSinceLastUpdate < this.UPDATE_INTERVAL) {
    this.skippedUpdates++;
    return;
}
// Process update...
```

**Files Modified:**
- `backend/src/services/AIPlayer.ts` (line 220-260)

**Status:** IMPLEMENTED

---

### 5. AI Reaction Delay - Fix #3 ⚠️
**Problem Found:** `setTimeout` with reaction delay creating thousands of pending timers
**Root Cause:** Each update scheduled a setTimeout, but updates came every 16ms while delay was 80-350ms
**Impact:** Decisions delayed and queued up

**Solution Implemented:**
```typescript
// Removed setTimeout wrapper, process decisions immediately (line 246-256)
// UPDATE_INTERVAL already provides timing control
if (this.isActive && this.gameState) {
    const decisionStart = performance.now();
    console.log(`🤖 AI making decision - ball at (${this.gameState.ballX}, ${this.gameState.ballY}), paddle at ${this.gameState.paddleY}`);
    this.makeDecision();
    // Track performance...
}
```

**Files Modified:**
- `backend/src/services/AIPlayer.ts` (line 246-256)

**Status:** IMPLEMENTED

---

### 6. AI Movement Application ✅
**Investigation:** Verified `thinking_completed` event handler
**Findings:**
- Handler exists and converts decisions to paddle movements
- Applies 5 pixels per decision
- Broadcasts `paddle_move` messages to frontend

**Code Location:** `backend/src/websocket.ts` line 306-350
**Status:** WORKING CORRECTLY

---

### 7. Ball Physics - Critical Fix #4 🔴 IN PROGRESS
**Problem Found:** Ball not moving at all (stuck at 400, 300)
**Root Cause:** Ball starts with `dx: 0, dy: 0` and waits for `startGame()` to initialize velocity
**Impact:** AI sees stationary ball, always returns decision 'none'

**Logs Showed:**
```
🤖 AI making decision - ball at (400, 300), paddle at 250
📢 thinking_completed event received! Decision: none, targetPos: 250
```

**Solution Implemented:**
```typescript
// Reduced delay for AI games (line 686-694)
function startGame() {
    const delay = isAIMode ? 100 : 1000; // 100ms for AI, 1s for PvP
    setTimeout(() => {
        ball.dx = (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED;
        ball.dy = (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED;
        console.log(`🎾 Ball started with velocity (${ball.dx}, ${ball.dy})`);
    }, delay);
}
```

**Files Modified:**
- `frontend/src/views/GamePage.ts` (line 686-694)
- Frontend rebuilt with `npm run build`

**Status:** IMPLEMENTED - NEEDS TESTING

---

### 8. Frontend Synchronization - Issue Under Investigation 🔍
**Problem:** `game_sync` messages should update `aiTargetY` but unclear if working
**Flow:**
```
Backend AI → thinking_completed → paddle_move event
         ↓
Backend Synchronizer → game_sync broadcast
         ↓
Frontend → aiTargetY = message.players.player2.y
         ↓
Game Loop → Interpolate player2.y to aiTargetY
```

**Code Locations:**
- Backend sync: `backend/src/websocket.ts` line 407-423
- Frontend handler: `frontend/src/views/GamePage.ts` line 397-405
- Frontend interpolation: `frontend/src/views/GamePage.ts` line 816-831

**Status:** UNCLEAR - No `game_sync` seen in logs but synchronizer is starting

---

## Current Status Summary

### ✅ Working Components
1. Backend server running on port 3000
2. AI game creation and initialization
3. AI activation and event system
4. thinking_completed handler applies movements
5. Frontend game loop and rendering
6. WebSocket connectivity

### ⚠️ Fixed But Unverified
1. 60 FPS AI game loop
2. AI timing logic (removed double-check)
3. Removed setTimeout reaction delay
4. Ball starts after 100ms (needs testing)

### 🔴 Still Broken
**AI paddle not visible moving in frontend**

### 🔍 Needs Investigation
1. Are `game_sync` messages being broadcast?
2. Is `aiTargetY` being updated in frontend?
3. Is ball actually moving after the fix?

---

## Files Modified This Session

### Backend Files
1. **backend/src/websocket.ts**
   - Line 365-395: Added 60 FPS AI game loop
   - Line 306-350: Added debug logging to thinking_completed handler

2. **backend/src/services/AIPlayer.ts**
   - Line 147-149: Added handler registration logging
   - Line 167-176: Added event emission logging
   - Line 220-260: Fixed timing logic (removed double-check)
   - Line 246-256: Removed setTimeout delay

### Frontend Files
1. **frontend/src/views/GamePage.ts**
   - Line 686-694: Reduced ball start delay for AI games (1000ms → 100ms)

---

## Next Steps (Priority Order)

### Immediate Actions Needed
1. **TEST** the ball movement fix
   - Start new AI game
   - Check backend logs for ball position changing
   - Verify AI decisions change from 'none' to 'up'/'down'

2. **VERIFY** game_sync messages
   - Add logging to game_sync broadcast
   - Check if aiTargetY updates in frontend
   - Confirm paddle interpolation works

3. **DEBUG** if still broken
   - Check browser console for frontend errors
   - Verify WebSocket messages in Network tab
   - Add more detailed logging

### Potential Additional Fixes
1. If game_sync not broadcasting → Check synchronizer.startSync()
2. If aiTargetY not updating → Check WebSocket message parsing
3. If interpolation not working → Check game loop update() function

---

## Testing Checklist

### Before Declaring Success
- [ ] AI paddle visibly moves on screen
- [ ] AI tracks ball position
- [ ] AI returns ball when hit
- [ ] Ball physics working (bounces, speeds up)
- [ ] Score updates correctly
- [ ] Game ends properly
- [ ] All difficulty levels work

### Performance Checks
- [ ] No lag or stuttering
- [ ] Smooth paddle movement
- [ ] Consistent ball speed
- [ ] No memory leaks

---

## Commands Used This Session

```bash
# Backend management
pkill -f "ts-node.*server.ts"
cd /home/ali/Documents/42-ft_transcendence/backend && npm run dev

# Monitoring
tail -f /tmp/backend.log | grep -E "🤖|AI|thinking"
grep "thinking_completed" /tmp/backend.log

# Frontend rebuild
cd /home/ali/Documents/42-ft_transcendence/frontend && npm run build

# Testing
curl -s http://localhost:3000/api/me
```

---

## Key Insights Learned

1. **AI needs independent game loop** - Can't rely on player input to trigger updates
2. **Timing logic is critical** - Double-checks can create contradictions
3. **setTimeout accumulates** - Don't schedule delays in high-frequency loops
4. **Ball must move** - AI makes 'none' decisions if ball is stationary
5. **Event system works** - Problem wasn't event emission/handling
6. **Synchronization complex** - Multiple layers (AI → backend → sync → frontend)

---

## Debugging Tools That Helped

1. **Backend console logs** - Showed AI was thinking but deciding 'none'
2. **Event emission logging** - Proved events were firing
3. **Ball position logging** - Revealed ball wasn't moving
4. **grep on log files** - Quick pattern matching for debugging
5. **Process checking** - Verified backend was actually running

---

## Code Patterns to Remember

### Good Pattern: Independent Game Loop
```typescript
const aiGameLoop = setInterval(() => {
    if (!room || !room.gameState.gameActive) {
        clearInterval(aiGameLoop);
        return;
    }
    aiPlayer.updateGameState(state);
}, 16);
```

### Bad Pattern: setTimeout in Update Loop
```typescript
// DON'T DO THIS
updateGameState(state) {
    setTimeout(() => {
        this.makeDecision(); // Called every 16ms creates 100+ pending timers
    }, 80);
}
```

### Good Pattern: Simple Timing Check
```typescript
if (timeSinceLastUpdate < this.UPDATE_INTERVAL) {
    return; // Skip if too early
}
// Process update
```

---

## Resources for Future Reference

- Backend WebSocket handler: `backend/src/websocket.ts`
- AI decision logic: `backend/src/services/AIPlayer.ts`
- Frontend game loop: `frontend/src/views/GamePage.ts`
- Game synchronizer: `backend/src/services/GameSynchronizer.ts` (not modified but relevant)

---

## Final Notes

The AI system has multiple layers:
1. **AI Brain** (AIPlayer.ts) - Makes decisions
2. **Backend Handler** (websocket.ts) - Processes decisions
3. **Synchronizer** (GameSynchronizer) - Broadcasts state
4. **Frontend** (GamePage.ts) - Renders AI paddle

Each layer must work for AI to move. We've fixed layers 1-2, need to verify layers 3-4.

---

**Last Updated:** October 2, 2025
**Status:** AI logic fixed, ball movement fixed, awaiting final test
