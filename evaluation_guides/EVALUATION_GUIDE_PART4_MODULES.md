# ft_transcendence - Detailed Evaluation Guide - PART 4: MODULES

**Version:** 18.0 | **Part 4 of 5**

This guide covers verification of specific module implementations.

---

## Module Verification Strategy

For each module the team claims to have implemented:
1. Confirm module from checklist
2. Verify technical requirements
3. Test functionality
4. Check integration
5. Verify team understanding

---

## V.1 WEB MODULES

### Backend Framework Module [MAJOR - 2 points]

**Requirement:** Use Fastify + Node.js

#### Verification Steps:

**1. Package.json Check:**
```bash
cat backend/package.json | grep fastify
```
Should show: `"fastify": "^x.x.x"`

**2. Server File Check:**
```bash
cat backend/src/server.ts | head -20
```
Look for:
```typescript
import Fastify from 'fastify'
const fastify = Fastify({ ... })
```

**3. Runtime Check:**
```bash
docker exec -it <backend_container> sh
ps aux | grep node
```
Should show node process running

**4. Test API Endpoint:**
```bash
curl -k https://localhost:3000/api/health
```
Should return JSON response

**5. Ask Team:**
- "Why did you choose Fastify?"
- "Show me where you define routes"
- "How does Fastify handle WebSockets?"

**Pass criteria:**
- [ ] Fastify installed in package.json
- [ ] Server.ts uses Fastify
- [ ] Server runs on Node.js
- [ ] Routes work correctly
- [ ] Team can explain choice

---

### Frontend Framework Module [MINOR - 1 point]

**Requirement:** Use Tailwind CSS

#### Verification Steps:

**1. Package.json Check:**
```bash
cat frontend/package.json | grep tailwind
```

**2. Tailwind Config Exists:**
```bash
cat frontend/tailwind.config.js
```

**3. Check CSS File:**
```bash
cat frontend/styles.css | head -10
```
Look for:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**4. Inspect HTML in Browser:**
1. Open website
2. Right-click element → Inspect
3. Check classes like: `class="flex items-center justify-between p-4 bg-blue-500"`
4. Verify Tailwind utility classes used

**5. Check Compiled CSS:**
1. Open DevTools → Sources
2. Find CSS file
3. Should see Tailwind utilities

**Pass criteria:**
- [ ] Tailwind installed
- [ ] Config file exists
- [ ] CSS imports Tailwind
- [ ] Utility classes used in HTML
- [ ] Styles compile correctly

---

### Database Module [MINOR - 1 point]

**Requirement:** Use SQLite

#### Verification Steps:

**1. Find Database File:**
```bash
find . -name "*.db" -o -name "*.sqlite"
```

**2. Check Database Connection Code:**
```bash
cat backend/src/config/database.ts
```
Look for: `sqlite3` or `better-sqlite3`

**3. Connect to Database:**
```bash
docker exec -it <backend_container> sh
sqlite3 /path/to/database.db
.tables
```
Should list tables: users, games, tournaments, etc.

**4. Query Data:**
```sql
SELECT * FROM users LIMIT 5;
SELECT COUNT(*) FROM games;
```

**5. Check Package.json:**
```bash
grep sqlite backend/package.json
```

**Pass criteria:**
- [ ] SQLite database file exists
- [ ] Can connect to database
- [ ] Tables created
- [ ] Data stored correctly
- [ ] sqlite3 library used

---

### Blockchain Module [MAJOR - 2 points]

**Requirement:** Avalanche + Solidity smart contracts for tournament scores

#### Verification Steps:

**1. Check Smart Contract:**
```bash
find . -name "*.sol"
cat contracts/TournamentScore.sol
```
Look for Solidity code

**2. Check Deployment Script:**
```bash
cat scripts/deploy.js
# or
cat backend/src/services/blockchain.ts
```

**3. Verify Avalanche Connection:**
```bash
grep -r "avalanche" .
grep -r "43114" . # Avalanche C-Chain mainnet
grep -r "43113" . # Avalanche Fuji testnet
```

**4. Check Tournament Score Storage:**
1. Complete a tournament
2. Ask team: "Show me the blockchain transaction"
3. Verify on Avalanche explorer:
   - Go to https://testnet.snowtrace.io (if testnet)
   - Paste transaction hash
   - Confirm transaction exists

**5. Ask Team:**
- "Show me the smart contract code"
- "What network are you using?" (Testnet OK)
- "How do you store tournament results?"
- "Show me a transaction hash"

**Pass criteria:**
- [ ] Solidity contract exists
- [ ] Contract deployed to Avalanche
- [ ] Tournament scores stored on-chain
- [ ] Can verify transactions
- [ ] Team understands blockchain integration

---

## V.3 USER MANAGEMENT MODULES

### Standard User Management [MAJOR - 2 points]

**Requirements:**
- Secure login/registration
- Avatars
- Friends list
- Online status
- Stats (wins/losses)
- Match history

#### Verification Steps:

**1. Registration System:**
1. Go to registration page
2. Fill form: username, email, password
3. Submit
4. Verify account created

**2. Login System:**
1. Go to login page
2. Enter credentials
3. Verify logged in
4. Check session persists (refresh page)

**3. Avatar Upload:**
1. Go to profile settings
2. Find avatar upload
3. Upload test image
4. Verify avatar displays
5. Check file stored:
   ```bash
   ls backend/uploads/avatars/
   ```

**4. Friend System:**
1. Search for another user
2. Send friend request
3. Login as other user
4. Accept friend request
5. Verify both see each other in friends list

**5. Online Status:**
1. Open two browser windows
2. Login as different users
3. Verify online indicator shows

**6. Stats Display:**
1. Go to profile
2. Check displays:
   - Wins: X
   - Losses: Y
   - Win rate: Z%
3. Play a game
4. Verify stats update

**7. Match History:**
1. Go to profile/history
2. Verify past games listed:
   - Opponent name
   - Score
   - Date/time
   - Result (Win/Loss)

**Pass criteria:**
- [ ] Registration works
- [ ] Login secure
- [ ] Avatars upload/display
- [ ] Friends can be added
- [ ] Online status shows
- [ ] Stats tracked correctly
- [ ] Match history displays

---

### Remote Authentication (OAuth 2.0) [MAJOR - 2 points]

**Requirement:** OAuth 2.0 with Google/GitHub/etc.

#### Verification Steps:

**1. Find OAuth Button:**
1. Go to login page
2. Look for "Sign in with Google" or "Sign in with GitHub"
3. Verify button present

**2. OAuth Flow Test:**
1. Click OAuth button
2. Should redirect to provider (Google/GitHub)
3. Authorize application
4. Should redirect back to site
5. Verify logged in

**3. Check Environment Variables:**
```bash
cat .env | grep -E "OAUTH|CLIENT_ID|CLIENT_SECRET"
```
Should show OAuth credentials

**4. Check Code:**
```bash
cat backend/src/api/googleAuthRoutes.ts
# or
cat backend/src/api/githubAuthRoutes.ts
```

**5. Verify Token Handling:**
1. After OAuth login, check DevTools → Application → Cookies
2. Should see session/JWT token
3. Token should be secure

**6. Test User Data:**
1. Complete OAuth login
2. Go to profile
3. Verify data from OAuth provider:
   - Name
   - Email
   - Avatar (from provider)

**Pass criteria:**
- [ ] OAuth button present
- [ ] OAuth flow completes
- [ ] User authenticated
- [ ] Provider data fetched
- [ ] Secure token handling
- [ ] Team explains OAuth flow

---

## V.4 GAMEPLAY & UX MODULES

### Remote Players [MAJOR - 2 points]

*(Covered in Part 3 - Section 4)*

**Quick checklist:**
- [ ] Two separate computers can play
- [ ] Real-time synchronization
- [ ] Lag handling
- [ ] Disconnect handling

---

### Multiplayer (>2 Players) [MAJOR - 2 points]

**Requirement:** Game with 3+ players simultaneously

#### Verification Steps:

**1. Start Multiplayer Game:**
1. Look for "3-Player" or "4-Player" mode
2. Select mode
3. Verify game starts with 3+ paddles

**2. Test Controls:**
1. Identify 3+ control schemes
2. Test each player controls their paddle
3. Verify all can move simultaneously

**3. Game Logic:**
1. Observe ball behavior with multiple paddles
2. Verify scoring system:
   - Which player gets point?
   - How are eliminations handled?
3. Play until game ends

**4. Check Board Layout:**
- Square board with paddle on each side? OR
- Circular layout? OR
- Other configuration?

**Pass criteria:**
- [ ] Supports 3+ players
- [ ] All players control independently
- [ ] Ball interacts with all paddles
- [ ] Scoring system clear
- [ ] Win condition defined

---

### New Game (Non-Pong) [MAJOR - 2 points]

**Requirement:** Second game besides Pong

#### Verification Steps:

**1. Find New Game:**
1. Navigate main menu
2. Look for second game option
3. Click to launch

**2. Verify Different Game:**
1. Should NOT be Pong variant
2. Should have different mechanics
3. Examples: Snake, Tic-Tac-Toe, Breakout, etc.

**3. Test Gameplay:**
1. Play the new game
2. Verify:
   - Rules are clear
   - Controls work
   - Scoring system
   - Win/lose conditions

**4. Check Match History:**
1. Play new game
2. Go to match history
3. Verify new game recorded

**5. Check Matchmaking:**
1. Verify new game has matchmaking
2. Can start multiplayer match

**Pass criteria:**
- [ ] Second game exists
- [ ] Completely different from Pong
- [ ] Fully functional
- [ ] Has match history
- [ ] Has matchmaking

---

### Game Customization [MINOR - 1 point]

**Requirement:** Power-ups, attacks, or different maps

#### Verification Steps:

**1. Find Customization Menu:**
1. Before starting game
2. Look for options:
   - Map selection
   - Power-up toggle
   - Game modifiers

**2. Test Power-ups (if implemented):**
1. Start game with power-ups enabled
2. Play until power-up appears
3. Collect power-up
4. Verify effect:
   - Speed boost
   - Paddle size change
   - Multi-ball
   - Shield
   - etc.

**3. Test Different Maps (if implemented):**
1. Select different map
2. Verify visual changes:
   - Different background
   - Obstacles on field
   - Different layout

**4. Test Attacks (if implemented):**
1. Check for attack button/key
2. Trigger attack during game
3. Verify effect on opponent

**Pass criteria:**
- [ ] Customization option exists
- [ ] Works as described
- [ ] Doesn't break game balance
- [ ] Can toggle on/off

---

### Live Chat [MAJOR - 2 points]

**Requirements:**
- Direct messages
- Block users
- Game invites
- Tournament notifications

#### Verification Steps:

**1. Find Chat Interface:**
1. Look for chat icon/button
2. Click to open chat
3. Verify chat panel/page opens

**2. Send Direct Message:**
1. Login as User A
2. Select User B from user list
3. Type message: "Hello from User A"
4. Send
5. Login as User B (different browser)
6. Verify message received

**3. Real-Time Delivery:**
1. Keep both browsers open
2. Send message from User A
3. Should appear instantly for User B (no refresh needed)

**4. Block User:**
1. As User B, block User A
2. Try sending message from User A to User B
3. Should be rejected or not delivered
4. Verify User A can't see User B online

**5. Game Invite:**
1. As User A, right-click User C
2. Find "Invite to Game" option
3. Send invite
4. As User C, verify invite notification
5. Accept invite
6. Verify game starts with both players

**6. Tournament Notifications:**
1. Register for tournament
2. When match starts, check chat
3. Should show: "Your match vs [opponent] is starting"

**Pass criteria:**
- [ ] Chat interface exists
- [ ] Messages send/receive
- [ ] Real-time (no refresh needed)
- [ ] Block function works
- [ ] Game invites work
- [ ] Tournament notifications appear
- [ ] Message history persists

---

## V.5 AI-ALGO MODULES

### AI Opponent [MAJOR - 2 points]

*(Covered in Part 3 - Section 5)*

**Quick checklist:**
- [ ] AI opponent available
- [ ] Uses keyboard simulation
- [ ] Updates ~1x per second
- [ ] Same speed as human
- [ ] NOT using A* algorithm

---

### Dashboards [MINOR - 1 point]

**Requirements:**
- User statistics dashboard
- Game session visualization
- Charts/graphs

#### Verification Steps:

**1. Find Dashboard:**
1. Navigate to dashboard/stats page
2. Should show visual data

**2. User Statistics:**
1. Check for charts showing:
   - Win/loss ratio (pie chart?)
   - Games played over time (line graph?)
   - Average score (bar chart?)
2. Verify data matches user's actual stats

**3. Game Session Stats:**
1. Look for:
   - Recent games list
   - Performance metrics
   - Trends

**4. Verify Real Data:**
1. Play a game
2. Return to dashboard
3. Verify dashboard updated

**5. Check Multiple Users:**
1. Login as different users
2. Verify dashboards show different data

**Pass criteria:**
- [ ] Dashboard page exists
- [ ] Visual charts/graphs present
- [ ] Shows real user data
- [ ] Updates after games
- [ ] Multiple visualization types

---

## V.6 CYBERSECURITY MODULES

### WAF & HashiCorp Vault [MAJOR - 2 points]

**Requirements:**
- Web Application Firewall (ModSecurity)
- HashiCorp Vault for secrets

#### Verification Steps:

**1. Check WAF:**
```bash
docker-compose ps | grep waf
# or
docker ps | grep modsecurity
```

**2. Test WAF:**
1. Try malicious request:
   ```bash
   curl -k "https://localhost/api/users?id=1' OR '1'='1"
   ```
2. Should be blocked with 403 Forbidden

**3. Check WAF Logs:**
```bash
docker logs <waf_container> | grep -i "blocked\|denied"
```

**4. Verify Vault Container:**
```bash
docker-compose ps | grep vault
```

**5. Check Vault Usage:**
```bash
cat backend/src/config/secrets.ts
```
Look for Vault client connection

**6. Test Secret Retrieval:**
```bash
docker exec -it <backend_container> sh
env | grep -v VAULT # Should NOT show secrets in ENV
```

**7. Ask Team:**
- "Show me Vault configuration"
- "How do you store secrets in Vault?"
- "What WAF rules are active?"

**Pass criteria:**
- [ ] WAF container running
- [ ] WAF blocks malicious requests
- [ ] Vault container running
- [ ] Secrets retrieved from Vault
- [ ] No secrets in environment variables

---

### GDPR Compliance [MINOR - 1 point]

**Requirements:**
- Data anonymization
- Local storage
- Account deletion
- Data export

#### Verification Steps:

**1. Find Privacy Settings:**
1. Go to user settings
2. Look for "Privacy" or "Data" section

**2. Account Deletion:**
1. Find "Delete Account" button
2. Click and confirm
3. Verify:
   - Account deleted from database
   - User can't log in
   - Data removed

**3. Data Export:**
1. Login as user
2. Find "Export My Data" option
3. Click export
4. Verify:
   - Downloads JSON/CSV file
   - Contains user's data

**4. Check Database:**
```bash
sqlite3 database.db
SELECT * FROM users WHERE deleted = 1;
```
Should show deleted/anonymized users

**Pass criteria:**
- [ ] Account deletion works
- [ ] Data export available
- [ ] Anonymization option exists
- [ ] Privacy policy documented

---

### 2FA & JWT [MAJOR - 2 points]

**Requirements:**
- Two-Factor Authentication
- JSON Web Tokens

#### Verification Steps:

**1. Enable 2FA:**
1. Login to account
2. Go to security settings
3. Find "Enable 2FA" option
4. Choose method:
   - SMS
   - Authenticator app (Google Authenticator)
   - Email

**2. Test 2FA Setup:**
1. Follow setup process
2. If app: scan QR code
3. Verify setup code
4. Confirm 2FA enabled

**3. Test 2FA Login:**
1. Logout
2. Login with username/password
3. Should prompt for 2FA code
4. Enter code from SMS/app/email
5. Verify login completes

**4. Test JWT:**
1. Login to site
2. Open DevTools → Application
3. Check Local Storage or Cookies
4. Find JWT token
5. Copy token
6. Go to https://jwt.io
7. Paste and decode
8. Verify:
   - Header with algorithm (HS256/RS256)
   - Payload with user data
   - Signature present
   - `exp` (expiration) field exists

**5. Test JWT Expiration:**
1. Note token expiration time
2. Wait for expiration
3. Try making API request
4. Should be rejected (401 Unauthorized)

**Pass criteria:**
- [ ] 2FA can be enabled
- [ ] 2FA works on login
- [ ] Backup codes provided
- [ ] JWT tokens used
- [ ] JWT properly signed
- [ ] JWT expires correctly

---

## Module Checklist Summary

Quick reference for module verification:

### Web Modules:
- [ ] Backend: Fastify + Node.js
- [ ] Frontend: Tailwind CSS
- [ ] Database: SQLite
- [ ] Blockchain: Avalanche + Solidity

### User Management:
- [ ] Standard user management
- [ ] OAuth 2.0 authentication

### Gameplay:
- [ ] Remote players
- [ ] Multiplayer (>2 players)
- [ ] New game (non-Pong)
- [ ] Game customization
- [ ] Live chat

### AI-Algo:
- [ ] AI opponent
- [ ] Dashboards

### Cybersecurity:
- [ ] WAF & Vault
- [ ] GDPR compliance
- [ ] 2FA & JWT

**Next:** Continue to PART 5 - DevOps, Graphics & Accessibility
