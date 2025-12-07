# ft_transcendence - Interactive Evaluation Guide

**Version:** 18.0 | Quick Checklist with Detailed Instructions

Click on any checkbox item to jump to detailed verification steps below.

---

## 📋 QUICK CHECKLIST

### Part 1: Setup & Deployment
- [ ] [Repository cloned successfully](#repo-clone)
- [ ] [No malicious code detected](#malicious-code)
- [ ] [.env file with credentials (not in Git)](#env-file)
- [ ] [docker-compose.yml exists](#docker-compose)
- [ ] [Docker builds without errors](#docker-build)
- [ ] [Website accessible in browser](#website-access)
- [ ] [No prohibited libraries](#prohibited-libs)
- [ ] [No console errors](#console-errors)
- [ ] [Memory usage stable](#memory-check)
- [ ] [Performance acceptable](#performance-check)

### Part 2: Security ⚠️ CRITICAL
- [ ] [Website uses HTTPS](#https-check)
- [ ] [WebSocket uses WSS](#wss-check)
- [ ] [Passwords hashed in database](#password-hash)
- [ ] [SQL injection protection](#sql-injection)
- [ ] [XSS protection](#xss-protection)
- [ ] [Server-side validation](#server-validation)
- [ ] [Input sanitization](#input-sanitization)
- [ ] [Auth tokens secure](#token-security)
- [ ] [File upload security](#file-upload)
- [ ] [No secrets in code](#secrets-check)

### Part 3: Game & Tournament
- [ ] [Pong game playable](#pong-playable)
- [ ] [Two-player local mode](#two-player)
- [ ] [Ball physics correct](#ball-physics)
- [ ] [Scoring works](#scoring-system)
- [ ] [Tournament system exists](#tournament-system)
- [ ] [4+ players supported](#tournament-players)
- [ ] [Matchmaking automatic](#matchmaking)

### Part 4: Modules (7 Major Required)
- [ ] [Backend: Fastify + Node.js](#module-backend)
- [ ] [Frontend: Tailwind CSS](#module-frontend)
- [ ] [Database: SQLite](#module-database)
- [ ] [User Management](#module-user-mgmt)
- [ ] [OAuth 2.0](#module-oauth)
- [ ] [Live Chat](#module-chat)
- [ ] [AI Opponent](#module-ai)
- [ ] [2FA & JWT](#module-2fa)

---

## 📖 DETAILED VERIFICATION STEPS

<a name="repo-clone"></a>
### Repository Clone

**What to check:** Git repository properly cloned

**How to verify:**
```bash
cd ~/evaluation_test
git clone <repository_url> project
ls -la project/.git
```

**Pass:** Repository clones without errors, `.git` folder exists

[↑ Back to checklist](#quick-checklist)

---

<a name="malicious-code"></a>
### Malicious Code Check

**What to check:** No suspicious aliases or hidden commands

**How to verify:**
```bash
cd project
cat Makefile                    # Check for suspicious commands
grep -r "eval(" .              # Search for eval usage
cat docker-compose.yml         # Check volume mounts
```

**Pass:** No suspicious code patterns

[↑ Back to checklist](#quick-checklist)

---

<a name="env-file"></a>
### Environment Variables (.env)

**What to check:** Credentials in .env, NOT committed to Git

**How to verify:**
```bash
ls -la .env                          # File should exist
cat .env                             # Should have secrets
cat .gitignore | grep .env          # Should be in .gitignore
git log --all --full-history -- .env # Should return nothing
```

**Pass:** 
- `.env` exists with DB credentials, API keys, OAuth secrets
- `.env` in `.gitignore`
- Never committed to Git

**FAIL:** Secrets in source code or .env in Git history

[↑ Back to checklist](#quick-checklist)

---

<a name="docker-compose"></a>
### Docker Compose File

**What to check:** docker-compose.yml at project root

**How to verify:**
```bash
ls -la docker-compose.yml
cat docker-compose.yml    # Verify services defined
```

**Pass:** File exists, services configured (backend, frontend, db)

[↑ Back to checklist](#quick-checklist)

---

<a name="docker-build"></a>
### Docker Build & Launch

**What to check:** Single command builds and starts everything

**How to verify:**
```bash
docker-compose down
docker-compose up --build    # Watch for errors
docker ps                    # All containers "Up"
```

**Pass:** Builds without errors, all containers running

**FAIL:** Build failures, containers crash/exit

[↑ Back to checklist](#quick-checklist)

---

<a name="website-access"></a>
### Website Accessibility

**What to check:** Can access website after launch

**How to verify:**
1. Open Firefox
2. Navigate to `https://localhost` (or port specified)
3. Accept self-signed certificate
4. Page should load

**Pass:** Homepage or login screen displays

**FAIL:** Connection refused, 502 error, blank page

[↑ Back to checklist](#quick-checklist)

---

<a name="prohibited-libs"></a>
### Library Usage Check

**What to check:** No complete-solution libraries

**How to verify:**
```bash
cat backend/package.json     # Review dependencies
cat frontend/package.json
```

Ask team about each major library:
- "What does [library] do?"
- "Why did you choose it?"

**Pass:** Each library justified, none solve entire features

**Prohibited:** Complete auth systems, ready-made admin panels, full chat apps

[↑ Back to checklist](#quick-checklist)

---

<a name="console-errors"></a>
### Browser Console Errors

**What to check:** No unhandled errors

**How to verify:**
1. Open Firefox → Press F12
2. Click "Console" tab
3. Navigate website, play game
4. Monitor for red errors

**Pass:** No red errors (minor warnings OK)

**Common errors:**
- 404 Not Found
- Failed to load resource
- Uncaught TypeError
- CORS errors

[↑ Back to checklist](#quick-checklist)

---

<a name="memory-check"></a>
### Memory Leak Check

**What to check:** Memory usage stays stable

**How to verify:**
```bash
docker stats    # Monitor for 5-10 minutes
```

Or in browser:
1. F12 → Memory tab
2. Take snapshot
3. Use site for 5 minutes
4. Take another snapshot
5. Compare usage

**Pass:** Memory stable, no continuous growth

[↑ Back to checklist](#quick-checklist)

---

<a name="performance-check"></a>
### Performance Check

**What to check:** Responsive UI, smooth gameplay

**How to verify:**
1. Navigate pages → Should be instant
2. Click buttons → <1 second response
3. Play Pong → Smooth 60fps
4. Load profile → <2 seconds

**Pass:** No lag, stuttering, or delays

[↑ Back to checklist](#quick-checklist)

---

## ⚠️ SECURITY CHECKS (CRITICAL - GRADE 0 IF FAIL)

<a name="https-check"></a>
### HTTPS Connection

**What to check:** Website uses HTTPS, not HTTP

**How to verify:**
1. Open Firefox
2. Check URL bar → Should show `https://`
3. Look for padlock icon 🔒
4. Click padlock → "Connection is secure"

Technical check:
1. F12 → Network tab
2. First request should be `https://`
3. No mixed content warnings

**Pass:** `https://` in URL, padlock present

**FAIL:** Shows `http://` (instant grade 0)

[↑ Back to checklist](#quick-checklist)

---

<a name="wss-check"></a>
### WebSocket Security (WSS)

**What to check:** WebSocket connections encrypted

**How to verify:**
1. F12 → Network tab
2. Filter by "WS"
3. Start game or chat
4. Click WebSocket connection
5. URL should show `wss://`

**Pass:** All WebSockets use `wss://`

**FAIL:** Shows `ws://` (instant grade 0)

[↑ Back to checklist](#quick-checklist)

---

<a name="password-hash"></a>
### Password Hashing

**What to check:** Passwords stored as hashes, NOT plaintext

**How to verify:**

**Method 1 - Database:**
```bash
docker exec -it <db_container> sh
sqlite3 /path/to/database.db
SELECT username, password FROM users LIMIT 5;
```

Should see: `$2b$10$abc123...` (hash)
Should NOT see: `password123` (plaintext)

**Method 2 - Code:**
```bash
cat backend/src/services/pass_service.ts
```
Look for: `bcrypt.hash()`, `bcrypt.compare()`

**Pass:** Passwords hashed with bcrypt/argon2/scrypt

**FAIL:** Plaintext passwords (instant grade 0)

[↑ Back to checklist](#quick-checklist)

---

<a name="sql-injection"></a>
### SQL Injection Protection

**What to check:** Parameterized queries, not string concatenation

**How to verify:**

**Code check:**
```bash
grep -r "SELECT" backend/src/
```

**BAD (vulnerable):**
```javascript
"SELECT * FROM users WHERE id = " + userId
`SELECT * FROM users WHERE name = '${username}'`
```

**GOOD (safe):**
```javascript
db.query("SELECT * FROM users WHERE id = ?", [userId])
db.query("SELECT * FROM users WHERE name = $1", [username])
```

**Test:**
1. Login page → Username: `admin' OR '1'='1`
2. Should FAIL to login

**Pass:** All queries use `?` or `$1` placeholders, injection attempts fail

**FAIL:** String concatenation found OR injection succeeds (instant grade 0)

[↑ Back to checklist](#quick-checklist)

---

<a name="xss-protection"></a>
### XSS Protection

**What to check:** User input doesn't execute scripts

**How to verify:**

**Test 1 - Username:**
1. Register with username: `<script>alert('XSS')</script>`
2. View profile
3. Should NOT show alert popup
4. Check page source → Should be escaped: `&lt;script&gt;`

**Test 2 - Chat (if module):**
1. Send: `<img src=x onerror=alert('XSS')>`
2. Should NOT trigger alert

**Pass:** No script execution, HTML escaped

**FAIL:** Alert appears (instant grade 0)

[↑ Back to checklist](#quick-checklist)

---

<a name="server-validation"></a>
### Server-Side Validation

**What to check:** Server validates ALL inputs

**How to verify:**

**Bypass client validation:**
```javascript
// In browser console (F12):
document.querySelectorAll('input').forEach(i => i.removeAttribute('required'));
document.querySelector('form').onsubmit = () => true;
```

Then submit invalid data (empty fields, bad format)

**Pass:** Server rejects with error message

**FAIL:** Invalid data accepted (instant grade 0)

[↑ Back to checklist](#quick-checklist)

---

<a name="input-sanitization"></a>
### Input Sanitization

**What to check:** Special characters handled safely

**How to verify:**

Test in username/forms:
- `<>'"&`
- `../../etc/passwd`
- `${eval('alert(1)')}`

**Code check:**
```bash
grep -r "sanitize" backend/
grep -r "escape" backend/
```

**Pass:** Special characters escaped/rejected, no code execution

**FAIL:** Arbitrary code execution (instant grade 0)

[↑ Back to checklist](#quick-checklist)

---

<a name="token-security"></a>
### Authentication Token Security

**What to check:** JWT/Session tokens secure

**How to verify:**

**For JWT:**
1. Login → F12 → Application → Local Storage
2. Copy JWT token
3. Go to https://jwt.io and paste
4. Check:
   - Has signature
   - Has `exp` (expiration)
   - Expires <24 hours

**For Session Cookie:**
1. F12 → Application → Cookies
2. Check flags:
   - `HttpOnly` ✓
   - `Secure` ✓
   - `SameSite=Strict` or `Lax` ✓

**Pass:** Tokens expire, secure flags set

[↑ Back to checklist](#quick-checklist)

---

<a name="file-upload"></a>
### File Upload Security

**What to check:** Only safe files accepted

**How to verify:**

Try uploading (avatar):
- `.exe` → Should reject
- `.php` → Should reject
- `.html` → Should reject
- `.jpg` → Should accept
- `.png` → Should accept

Also test:
- 100MB file → Should reject (size limit)
- 2MB file → Should accept

**Pass:** Only images accepted, size limited

[↑ Back to checklist](#quick-checklist)

---

<a name="secrets-check"></a>
### No Hardcoded Secrets

**What to check:** All secrets in .env

**How to verify:**
```bash
grep -r "sk_live_" .
grep -r "api_key" . | grep -v ".env"
grep -r "secret" . | grep -v ".env"
git log --all --full-history -- .env    # Should be empty
```

**Pass:** All secrets in `.env`, never committed

**FAIL:** Secrets in code or Git history (instant grade 0)

[↑ Back to checklist](#quick-checklist)

---

## 🎮 GAME VERIFICATION

<a name="pong-playable"></a>
### Pong Game Playable

**What to check:** Game loads and works

**How to verify:**
1. Navigate to game section
2. Click "Play" or "Game"
3. Should see:
   - Game canvas
   - Two paddles
   - Ball
   - Score display

**Pass:** Game interface displays

[↑ Back to checklist](#quick-checklist)

---

<a name="two-player"></a>
### Two-Player Local Mode

**What to check:** Both players can play on same keyboard

**How to verify:**
1. Start game
2. Test Player 1 controls (usually W/S)
   - Press W → Left paddle moves up
   - Press S → Left paddle moves down
3. Test Player 2 controls (usually Arrow keys)
   - Press ↑ → Right paddle moves up
   - Press ↓ → Right paddle moves down
4. Try both at same time → Both should move

**Pass:** Simultaneous control, no conflicts

[↑ Back to checklist](#quick-checklist)

---

<a name="ball-physics"></a>
### Ball Physics

**What to check:** Ball moves correctly

**How to verify:**
1. Start game, observe ball:
   - Starts in center
   - Moves diagonally
   - Bounces off top/bottom walls
   - Bounces off paddles
   - Speed consistent
2. Let ball pass paddle
   - Opposite player scores
   - Ball resets to center

**Pass:** Physics work correctly, realistic bounces

[↑ Back to checklist](#quick-checklist)

---

<a name="scoring-system"></a>
### Scoring System

**What to check:** Score tracks correctly

**How to verify:**
1. Start at 0-0
2. Ball passes left paddle → Right player +1
3. Ball passes right paddle → Left player +1
4. Play several rounds
5. Verify score updates each time

**Pass:** Accurate score tracking

[↑ Back to checklist](#quick-checklist)

---

<a name="tournament-system"></a>
### Tournament System

**What to check:** Tournament mode exists

**How to verify:**
1. Main menu → Look for "Tournament"
2. Click tournament
3. Should show:
   - Player registration
   - Bracket display
   - Match progression

**Pass:** Tournament mode accessible

[↑ Back to checklist](#quick-checklist)

---

<a name="tournament-players"></a>
### Tournament Multiple Players

**What to check:** 4+ players can register

**How to verify:**
1. Open tournament
2. Register 4 players:
   - Alice
   - Bob
   - Charlie
   - Dave
3. All should register successfully

**Pass:** Minimum 4 players supported

[↑ Back to checklist](#quick-checklist)

---

<a name="matchmaking"></a>
### Automatic Matchmaking

**What to check:** System organizes matches

**How to verify:**
1. Register players
2. System should:
   - Create bracket automatically
   - Assign matches
   - Show next matchup
3. No manual assignment needed

**Pass:** Fully automatic bracket generation

[↑ Back to checklist](#quick-checklist)

---

## 🔧 MODULES VERIFICATION

<a name="module-backend"></a>
### Backend: Fastify + Node.js [MAJOR]

**How to verify:**
```bash
cat backend/package.json | grep fastify
cat backend/src/server.ts | head -20
```

Look for:
```typescript
import Fastify from 'fastify'
const fastify = Fastify({...})
```

Test:
```bash
curl -k https://localhost:3000/api/health
```

**Pass:** Fastify installed, server.ts uses it, API responds

[↑ Back to checklist](#quick-checklist)

---

<a name="module-frontend"></a>
### Frontend: Tailwind CSS [MINOR]

**How to verify:**
```bash
cat frontend/package.json | grep tailwind
cat frontend/tailwind.config.js
cat frontend/styles.css | head -10
```

Should see:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Browser check:
1. F12 → Inspect element
2. Look for classes: `flex`, `bg-blue-500`, `p-4`, etc.

**Pass:** Tailwind installed, utility classes used

[↑ Back to checklist](#quick-checklist)

---

<a name="module-database"></a>
### Database: SQLite [MINOR]

**How to verify:**
```bash
find . -name "*.db"
cat backend/src/config/database.ts
grep -r "sqlite" backend/
```

Connect:
```bash
docker exec -it <backend> sh
sqlite3 /path/to/db.db
.tables
SELECT * FROM users LIMIT 5;
```

**Pass:** Database file exists, tables created, data stored

[↑ Back to checklist](#quick-checklist)

---

<a name="module-user-mgmt"></a>
### User Management [MAJOR]

**How to verify:**

**Registration:**
1. Register new account
2. Verify created

**Login:**
1. Login with credentials
2. Session persists after refresh

**Avatar:**
1. Settings → Upload avatar
2. Verify displays

**Friends:**
1. Search user → Send friend request
2. Other user accepts
3. Both see in friends list

**Stats:**
1. Profile shows wins/losses
2. Play game
3. Stats update

**Match History:**
1. Profile → History
2. Past games listed with date/opponent/score

**Pass:** All features work

[↑ Back to checklist](#quick-checklist)

---

<a name="module-oauth"></a>
### OAuth 2.0 [MAJOR]

**How to verify:**
1. Login page → "Sign in with Google/GitHub" button
2. Click → Redirects to provider
3. Authorize
4. Redirects back → Logged in
5. Profile shows OAuth data (name, email, avatar)

Check:
```bash
cat .env | grep -E "OAUTH|CLIENT_ID|CLIENT_SECRET"
```

**Pass:** OAuth flow completes, user authenticated

[↑ Back to checklist](#quick-checklist)

---

<a name="module-chat"></a>
### Live Chat [MAJOR]

**How to verify:**

**Direct Messages:**
1. Login as User A
2. Open chat → Select User B
3. Send message
4. Login as User B (different browser)
5. Message appears instantly (no refresh)

**Block User:**
1. User B blocks User A
2. User A can't message User B

**Game Invite:**
1. User A → Right-click User C → "Invite to Game"
2. User C receives notification
3. Accept → Game starts

**Tournament Notifications:**
1. Join tournament
2. When match starts → Chat notification appears

**Pass:** Real-time chat, blocking, invites work

[↑ Back to checklist](#quick-checklist)

---

<a name="module-ai"></a>
### AI Opponent [MAJOR]

**How to verify:**
1. Select "Play vs AI"
2. AI controls one paddle

**Check AI constraints:**
```bash
cat backend/src/services/AIPlayer.ts
```

Verify:
- AI uses simulated keyboard input (not direct position)
- Update interval ~1000ms (1 second)
- Same paddle speed as human
- NOT using A* algorithm:
  ```bash
  grep -r "astar\|a-star" backend/
  ```

**Play test:**
- AI scores some points
- Human can also score
- Not too easy or too hard

**Pass:** AI functional, follows constraints

[↑ Back to checklist](#quick-checklist)

---

<a name="module-2fa"></a>
### 2FA & JWT [MAJOR]

**2FA Check:**
1. Login → Security settings
2. "Enable 2FA" option
3. Choose method (SMS/App/Email)
4. Follow setup (scan QR if app)
5. Logout and login again
6. Prompted for 2FA code
7. Enter code → Login completes

**JWT Check:**
1. Login → F12 → Application → Local Storage/Cookies
2. Find JWT token
3. Copy and paste at https://jwt.io
4. Verify:
   - Header (HS256/RS256)
   - Payload with user data
   - Signature present
   - `exp` field exists

**Pass:** 2FA works, JWT properly signed with expiration

[↑ Back to checklist](#quick-checklist)

---

## 📊 SCORING

**Mandatory:** Must be perfect (all checks pass)
**Modules:** Need 7 Major modules for 100%
- Major module = 2 points
- Minor module = 1 point

**Bonus:** (Only if mandatory perfect)
- Extra Major = +10 points
- Extra Minor = +5 points

---

## ⚠️ INSTANT FAIL CONDITIONS

**Grade 0 if ANY of these fail:**
- Security requirement missing
- Can't explain code
- Malicious/plagiarized code
- Crashes during evaluation
- Forbidden libraries used

---

**End of Interactive Guide** | [↑ Top](#quick-checklist)
