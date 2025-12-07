# ft_transcendence - Detailed Evaluation Guide - PART 3: GAME & GAMEPLAY

**Version:** 18.0 | **Part 3 of 5**

This guide covers the Pong game, tournament system, and gameplay features.

---

## Part 1: Basic Pong Game

### 1.1 Game is Playable

**What to check:** Pong game works and is accessible

**How to verify:**
1. Open website in Firefox
2. Navigate to game section (look for "Play" or "Game" button/link)
3. Verify game screen loads
4. Should see:
   - Game canvas/playing field
   - Two paddles
   - Ball
   - Score display

**Pass criteria:** Game interface loads and displays

**Red flags:** 
- 404 error
- Blank screen
- Game doesn't load

---

### 1.2 Local Two-Player Keyboard Control

**What to check:** Two players can play on same keyboard

**How to verify:**
1. Start a game
2. Identify Player 1 controls (usually: W/S or Up/Down arrows)
3. Identify Player 2 controls (usually: Arrow keys or other keys)
4. Test Player 1 controls:
   - Press up key → Left paddle moves up
   - Press down key → Left paddle moves down
5. Test Player 2 controls:
   - Press up key → Right paddle moves up
   - Press down key → Right paddle moves down
6. Try both simultaneously - both should move

**Expected control schemes:**
- Player 1: W (up) / S (down)
- Player 2: Arrow Up / Arrow Down
OR
- Player 1: Q (up) / A (down)
- Player 2: P (up) / L (down)

**Pass criteria:** 
- Both players can control paddles simultaneously
- No control conflicts

**Red flags:** 
- Only one player can move at a time
- Controls don't respond

---

### 1.3 Separate Keyboard Sections

**What to check:** Each player uses distinct keys

**How to verify:**
1. Ask team: "What keys does Player 1 use?"
2. Ask team: "What keys does Player 2 use?"
3. Verify keys are separate (not overlapping)
4. Test that keys work as described

**Pass criteria:** 
- Clear separation of controls
- Both players can play comfortably

---

### 1.4 Ball Movement & Physics

**What to check:** Ball moves correctly

**How to verify:**
1. Start game
2. Observe ball:
   - Ball starts in center
   - Ball moves diagonally
   - Ball bounces off top/bottom walls
   - Ball bounces off paddles
   - Ball speed consistent
3. Let ball pass paddle
4. Verify:
   - Opposite player scores point
   - Ball resets to center
   - Game continues

**Pass criteria:** 
- Ball physics work correctly
- Bounces are realistic

**Red flags:** 
- Ball goes through paddles
- Ball gets stuck
- Ball doesn't reset

---

### 1.5 Paddle Movement

**What to check:** Paddles move smoothly

**How to verify:**
1. Hold up key
2. Observe paddle:
   - Moves smoothly (not jumpy)
   - Stops at top boundary
   - Doesn't go off-screen
3. Hold down key
4. Observe paddle:
   - Moves smoothly
   - Stops at bottom boundary
5. Test rapid key presses - should be responsive

**Pass criteria:** 
- Smooth movement
- Stays within boundaries

---

### 1.6 Scoring System

**What to check:** Score tracked correctly

**How to verify:**
1. Start game with score at 0-0
2. Let ball pass left paddle
3. Check: Right player score increases (1-0)
4. Let ball pass right paddle
5. Check: Left player score increases (1-1)
6. Continue for several rounds
7. Verify score updates correctly each time

**Pass criteria:** 
- Score updates correctly
- Score displays clearly
- Both players' scores tracked

---

### 1.7 Win Condition

**What to check:** Game declares winner

**How to verify:**
1. Play game until one player reaches win score (usually 5, 10, or 11)
2. Verify:
   - Game stops
   - Winner announced/displayed
   - Option to play again or return to menu

**Pass criteria:** 
- Game ends at win condition
- Winner clearly displayed

---

### 1.8 Paddle Speed Equality

**What to check:** Both paddles move at same speed

**How to verify:**
1. Start game
2. Hold Player 1 up key for 2 seconds
3. Note distance traveled
4. Reset
5. Hold Player 2 up key for 2 seconds
6. Compare distance - should be equal

**Alternative:** Ask team to show code where paddle speed is set

**Pass criteria:** Both paddles have identical speed

**FAIL if:** One paddle faster than other

---

### 1.9 Classic Pong Rules

**What to check:** Game follows original Pong rules

**How to verify:**
1. Verify ball bounces off:
   - Top wall ✓
   - Bottom wall ✓
   - Paddles ✓
   - NOT left/right walls (those are goals)
2. Verify paddle:
   - Only moves up/down
   - Can't move left/right
3. Verify scoring:
   - Point awarded when ball passes paddle
   - Ball resets after point

**Pass criteria:** Follows classic Pong mechanics

---

### 1.10 Controls Explained

**What to check:** Controls are intuitive or documented

**How to verify:**
1. Look for control explanation on game screen
2. Check for:
   - On-screen instructions
   - Help button
   - Control legend
   - README documentation
3. If not visible, ask team: "How do players know the controls?"

**Pass criteria:** 
- Controls shown in UI OR
- Controls are standard (arrow keys) OR
- Documentation available

---

### 1.11 End Game State

**What to check:** Game handles end properly

**How to verify:**
1. Complete a game (reach win condition)
2. After winner declared, verify ONE of:
   - "Play Again" button appears
   - "Return to Menu" button appears
   - Automatic return to menu after countdown
   - Score shown with options
3. Test the option works

**Pass criteria:** Game doesn't get stuck after ending

**Red flags:** 
- Game freezes
- No way to exit
- Must refresh page

---

## Part 2: Tournament System

### 2.1 Tournament Available

**What to check:** Tournament mode exists

**How to verify:**
1. Navigate main menu
2. Look for "Tournament" button/link
3. Click it
4. Verify tournament interface loads

**Pass criteria:** Tournament mode accessible

---

### 2.2 Multiple Players Support

**What to check:** More than 2 players can join tournament

**How to verify:**
1. Open tournament screen
2. Check for player registration
3. Minimum should support: 4 players
4. Test registering players:
   - Player 1: "Alice"
   - Player 2: "Bob"
   - Player 3: "Charlie"
   - Player 4: "Dave"
5. Verify all registered

**Pass criteria:** At least 4 players can register

---

### 2.3 Alias Input System

**What to check:** Players enter aliases (if mandatory, no user accounts)

**How to verify:**

**If MANDATORY (no User Management module):**
1. Start tournament
2. Verify:
   - Prompt for player names/aliases
   - Input fields for each player
   - No login required
3. Enter test aliases
4. Verify aliases stored for tournament

**If USER MANAGEMENT module:**
1. Verify players log in with accounts
2. Aliases come from user profiles

**Pass criteria:** Alias system matches module choice

---

### 2.4 Alias Reset

**What to check:** Aliases reset between tournaments

**How to verify:**
1. Complete first tournament with aliases: Alice, Bob, Charlie, Dave
2. Start NEW tournament
3. Verify:
   - Previous aliases cleared
   - Fresh alias input required
   - No carryover from previous tournament

**Pass criteria:** Each tournament has fresh aliases

---

### 2.5 Tournament Bracket Display

**What to check:** Shows who plays whom

**How to verify:**
1. Register 4+ players
2. Start tournament
3. Check display shows:
   - Match brackets/tree
   - Current match highlighted
   - "Alice vs Bob" (example)
   - Round indicators (Quarter-final, Semi-final, Final)

**Pass criteria:** 
- Clear visual bracket
- Can see matchups

---

### 2.6 Match Order Display

**What to check:** Order of matches is clear

**How to verify:**
1. View tournament bracket
2. Identify:
   - Match 1: Player A vs Player B
   - Match 2: Player C vs Player D
   - Semi-final 1: Winner of Match 1 vs Winner of Match 2
   - Final: Winner of Semi 1 vs Winner of Semi 2
3. Verify order is logical

**Pass criteria:** Tournament progression clear

---

### 2.7 Matchmaking System

**What to check:** System organizes matches automatically

**How to verify:**
1. Register players
2. Observe system:
   - Automatically creates bracket
   - Assigns players to matches
   - Determines order
3. Verify human doesn't manually assign matches

**Pass criteria:** Automatic matchmaking

---

### 2.8 Next Match Announcement

**What to check:** System announces upcoming match

**How to verify:**
1. During tournament
2. After match ends, check for:
   - "Next Match: Player X vs Player Y"
   - Notification/prompt for next players
   - Clear indication of who plays next
3. Start next match
4. Verify correct players' controls active

**Pass criteria:** Next match clearly announced

---

### 2.9 Turn-Based Play

**What to check:** Players take turns, not all at once

**How to verify:**
1. Register 4 players
2. Tournament starts Match 1 (Player 1 vs Player 2)
3. Verify:
   - Only 2 players play at a time
   - Other players wait
4. After Match 1, Match 2 starts (Player 3 vs Player 4)
5. Verify different 2 players now play

**Pass criteria:** Matches sequential, not simultaneous

---

### 2.10 Tournament Winner

**What to check:** Tournament declares overall winner

**How to verify:**
1. Play through entire tournament
2. Track bracket:
   - Round 1 winners advance
   - Semi-final winners advance
   - Final determines champion
3. After final match, verify:
   - Champion announced
   - Winner's name displayed
   - Celebration screen or message

**Pass criteria:** 
- Tournament tracks progression
- Final winner declared

---

## Part 3: Real-Time Multiplayer

### 3.1 Real-Time Synchronization

**What to check:** Game runs in real-time (no turn-based)

**How to verify:**
1. Start game
2. Both players move simultaneously
3. Ball moves continuously
4. No "waiting for turn" delays

**Pass criteria:** Instant response, real-time gameplay

---

### 3.2 Frame Rate

**What to check:** Game runs smoothly

**How to verify:**
1. Start game
2. Observe gameplay:
   - Ball moves smoothly (not choppy)
   - Paddles move smoothly
   - No stuttering
3. Open Dev Tools → Performance
4. Record for 10 seconds
5. Check FPS (should be ~60fps)

**Pass criteria:** Smooth 60fps gameplay

**Red flags:** 
- Stuttering
- <30fps
- Lag

---

### 3.3 Input Responsiveness

**What to check:** Controls respond immediately

**How to verify:**
1. Start game
2. Press paddle control key
3. Measure response time:
   - Should be instant (<50ms perceived delay)
   - Paddle should move as key pressed
4. Test rapid key presses - all should register

**Pass criteria:** No noticeable input lag

---

## Part 4: Remote Players Module (if implemented)

### 4.1 Two Computers Play Together

**What to check:** Players on separate machines can play

**How to verify:**
1. Open website on Computer 1
2. Open website on Computer 2 (different device)
3. Player 1 starts game on Computer 1
4. Player 2 joins game on Computer 2
5. Verify:
   - Both see same game
   - Both can control their paddle
   - Ball movement synced

**Pass criteria:** Cross-computer gameplay works

---

### 4.2 Network Synchronization

**What to check:** Game state synced across clients

**How to verify:**
1. During remote game, observe both screens
2. Verify:
   - Ball position identical
   - Paddle positions identical
   - Score identical
   - Timing synced
3. Pause/screenshot both - positions should match

**Pass criteria:** Perfect synchronization

---

### 4.3 Lag Handling

**What to check:** Lag doesn't break game

**How to verify:**

**Test A - Artificial Lag:**
1. On one computer, open Dev Tools
2. Go to Network tab
3. Set throttling to "Slow 3G"
4. Play game
5. Verify:
   - Game still playable
   - Lag compensation active
   - No desync

**Test B - Natural Lag:**
1. Play game normally
2. Observe during network delays
3. Game should handle gracefully

**Pass criteria:** Game remains playable under lag

---

### 4.4 Disconnect Handling

**What to check:** Disconnections handled gracefully

**How to verify:**

**Test disconnect:**
1. Start remote game
2. On one computer, close browser tab
3. On other computer, observe:
   - Error message shown OR
   - "Player disconnected" notification OR
   - Game paused OR
   - Return to menu
4. Verify no crash

**Pass criteria:** 
- Disconnect detected
- User notified
- No crash

---

### 4.5 Reconnection (Optional)

**What to check:** Player can reconnect to ongoing game

**How to verify:**
1. Start remote game
2. Player 1 refreshes page
3. Verify:
   - Option to rejoin game
   - Game state preserved
   - Can resume playing

**Note:** Optional feature, bonus points if present

**Pass criteria (if implemented):** Reconnect works

---

## Part 5: AI Opponent Module (if implemented)

### 5.1 AI Player Available

**What to check:** Can play against AI

**How to verify:**
1. Start new game
2. Look for "Play vs AI" or "AI Opponent" option
3. Select AI mode
4. Verify:
   - AI controls one paddle
   - Human controls other paddle
   - Game starts

**Pass criteria:** AI opponent selectable

---

### 5.2 AI Uses Keyboard Simulation

**What to check:** AI simulates real keyboard input

**How to verify:**

**Code check:**
1. Review AI code: `cat backend/src/services/AIPlayer.ts`
2. Look for:
   - Simulated key press events
   - Same input handling as human players
3. Verify AI doesn't directly manipulate paddle position

**Gameplay check:**
1. Play against AI
2. Observe AI paddle movement:
   - Moves like human (up/down key presses)
   - Doesn't teleport
   - Moves at same speed as human

**Pass criteria:** AI uses simulated input

**FAIL if:** AI directly sets paddle.y coordinate

---

### 5.3 AI Update Frequency

**What to check:** AI "vision" updates ~1x per second

**How to verify:**

**Code check:**
1. Review AI code
2. Look for update interval:
   ```javascript
   setInterval(() => {
     // AI decision making
   }, 1000); // Should be ~1000ms
   ```
3. Verify AI doesn't read game state every frame

**Gameplay check:**
1. Play against AI
2. Observe AI reaction time:
   - Shouldn't be instant/perfect
   - Should have slight delay
   - Mimics human reaction time

**Pass criteria:** AI updates ~once per second

**FAIL if:** AI reacts instantly (reads state every frame)

---

### 5.4 AI Speed Constraint

**What to check:** AI moves at same speed as human

**How to verify:**
1. Play as human vs AI
2. Hold your paddle up key for 3 seconds
3. Observe AI paddle move for 3 seconds
4. Compare distances - should be equal
5. Verify AI can't "cheat" with faster movement

**Pass criteria:** Identical paddle speed

**FAIL if:** AI moves faster than allowed

---

### 5.5 No A* Algorithm

**What to check:** AI doesn't use A* pathfinding

**How to verify:**

**Code check:**
1. Search codebase:
   ```bash
   grep -r "A*" backend/
   grep -r "astar" backend/
   grep -r "a-star" backend/
   ```
2. Verify no A* implementation
3. Check AI algorithm used:
   - Rule-based ✓
   - Simple prediction ✓
   - Neural network ✓
   - A* ✗ (prohibited)

**Ask team:** "What algorithm does your AI use?"

**Pass criteria:** Not using A*

**FAIL if:** A* algorithm detected

---

### 5.6 AI Challenge Level

**What to check:** AI provides reasonable challenge

**How to verify:**
1. Play 3 games against AI
2. Verify:
   - AI scores points
   - AI blocks some shots
   - Human can also score
   - Not impossible, not trivial
3. AI should win ~40-60% of games

**Pass criteria:** 
- AI is playable
- Not too easy or too hard

---

## Part 6: Gameplay Summary Checklist

Quick verification:

### Mandatory Game Features:
- [ ] Pong game loads
- [ ] Two-player local mode works
- [ ] Separate keyboard controls
- [ ] Ball physics correct
- [ ] Paddles move smoothly
- [ ] Paddles stay in boundaries
- [ ] Scoring works correctly
- [ ] Win condition implemented
- [ ] Both paddles same speed
- [ ] Classic Pong rules followed
- [ ] Controls explained
- [ ] End game handled properly
- [ ] Tournament mode exists
- [ ] 4+ players can register
- [ ] Alias system (or login)
- [ ] Aliases reset per tournament
- [ ] Bracket displays matchups
- [ ] Match order clear
- [ ] Matchmaking automatic
- [ ] Next match announced
- [ ] Turn-based tournament
- [ ] Tournament winner declared
- [ ] Real-time gameplay
- [ ] Smooth 60fps
- [ ] Input responsive

### Remote Players Module (if chosen):
- [ ] Two computers can play
- [ ] Game synced across network
- [ ] Lag handled gracefully
- [ ] Disconnect handled
- [ ] (Optional) Reconnect works

### AI Module (if chosen):
- [ ] AI opponent available
- [ ] AI uses keyboard simulation
- [ ] AI updates ~1x per second
- [ ] AI speed matches human
- [ ] Not using A* algorithm
- [ ] AI provides challenge

**Next:** Continue to PART 4 - Modules & Features
