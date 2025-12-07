# ft_transcendence - Complete Interactive Evaluation Guide

**Version:** 18.0 | Click any item to jump to detailed instructions

---

## 🎯 UNDERSTANDING THIS GUIDE

**What's MANDATORY (Must Have):**
- **Part 1: Setup & Deployment** - Basic setup requirements
- **Part 2: Security (CRITICAL)** - Security requirements (CANNOT FAIL)
- **Part 3: Game & Tournament** - Core Pong game and tournament system

⚠️ **If any mandatory part fails → Project fails (0%)**

**What's MODULES (Choose/Implement):**
- **[MAJOR]** modules = 10 points each (need 7 for 100%)
- **[MINOR]** modules = 5 points each (bonus only)

✅ **Score 100% by:** Passing all mandatory parts + implementing 7 MAJOR modules

🎁 **Bonus:** Each extra MAJOR module = +10 points, each MINOR = +5 points

---

## 📋 TABLE OF CONTENTS

1. [Quick Checklist - All Items](#quick-checklist)
2. [Part 1: Setup & Deployment](#part1-details)
3. [Part 2: Security (CRITICAL)](#part2-details)
4. [Part 3: Game & Tournament](#part3-details)
5. [Part 4: Web Modules](#part4-details)
6. [Part 5: User Management](#part5-details)
7. [Part 6: Gameplay Modules](#part6-details)
8. [Part 7: AI & Dashboards](#part7-details)
9. [Part 8: Cybersecurity](#part8-details)
10. [Part 9: DevOps](#part9-details)
11. [Part 10: Graphics & Accessibility](#part10-details)
12. [Part 11: Server-Side Pong](#part11-details)
13. [Part 12: Bonus](#part12-details)

---

<a name="quick-checklist"></a>
## 📋 QUICK CHECKLIST - ALL ITEMS

### Setup & Deployment
- [ ] [Repository cloned successfully](#repo-clone)
- [ ] [No malicious code](#malicious-code)
- [ ] [.env file exists (not in Git)](#env-file)
- [ ] [docker-compose.yml exists](#docker-compose)
- [ ] [Docker builds without errors](#docker-build)
- [ ] [Website accessible](#website-access)
- [ ] [No prohibited libraries](#prohibited-libs)
- [ ] [No console errors](#console-errors)
- [ ] [No memory leaks](#memory-check)
- [ ] [Performance acceptable](#performance-check)

### Security ⚠️ CRITICAL (Must Pass All)
- [ ] [HTTPS/TLS enabled](#https-check)
- [ ] [WebSocket uses WSS](#wss-check)
- [ ] [Passwords hashed](#password-hash)
- [ ] [SQL injection protection](#sql-injection)
- [ ] [XSS protection](#xss-protection)
- [ ] [Server-side validation](#server-validation)
- [ ] [Input sanitization](#input-sanitization)
- [ ] [Valid SSL certificates](#ssl-certs)
- [ ] [No secrets in Git](#secrets-git)
- [ ] [.env file used](#env-security)

### Core Game
- [ ] [Pong is playable](#pong-playable)
- [ ] [Local 2-player mode](#two-player-local)
- [ ] [Keyboard controls work](#keyboard-controls)
- [ ] [Paddle speeds equal](#paddle-speed)
- [ ] [Ball physics correct](#ball-physics)
- [ ] [Scoring works](#scoring-system)
- [ ] [Game ends properly](#game-end)
- [ ] [Real-time multiplayer](#realtime-multi)

### Tournament System
- [ ] [Tournament exists](#tournament-system)
- [ ] [Multiple players (4+)](#tournament-players)
- [ ] [Turn-based matches](#turn-based)
- [ ] [Clear match display](#match-display)
- [ ] [Automatic matchmaking](#matchmaking)
- [ ] [Match announcements](#match-announce)
- [ ] [Alias input](#alias-input)
- [ ] [Alias reset per tournament](#alias-reset)

### Error Handling
- [ ] [Disconnect handling](#disconnect-handle)
- [ ] [Lag handling](#lag-handle)
- [ ] [No crashes on errors](#crash-handle)

### Module: Backend Framework (MAJOR)
- [ ] [Uses Fastify + Node.js](#backend-fastify)
- [ ] [Server starts correctly](#backend-start)
- [ ] [API endpoints work](#backend-api)
- [ ] [WebSocket via Fastify](#backend-ws)

### Module: Frontend Framework (MINOR)
- [ ] [Uses Tailwind CSS](#frontend-tailwind)
- [ ] [TypeScript for UI](#frontend-ts)
- [ ] [Responsive design](#frontend-responsive)
- [ ] [No CSS errors](#frontend-css)

### Module: Database (MINOR)
- [ ] [Uses SQLite](#db-sqlite)
- [ ] [Database persists](#db-persist)
- [ ] [Queries work](#db-queries)
- [ ] [No connection errors](#db-errors)

### Module: Blockchain (MAJOR)
- [ ] [Uses Avalanche](#blockchain-avalanche)
- [ ] [Solidity contracts](#blockchain-solidity)
- [ ] [Scores on blockchain](#blockchain-scores)
- [ ] [Contracts deploy](#blockchain-deploy)

### Module: Standard User Management (MAJOR)
- [ ] [Registration works](#user-register)
- [ ] [Login works](#user-login)
- [ ] [Avatar upload](#user-avatar)
- [ ] [Friend lists](#user-friends)
- [ ] [Online status](#user-status)
- [ ] [Player stats](#user-stats)
- [ ] [Match history](#user-history)
- [ ] [User profiles](#user-profile)

### Module: OAuth 2.0 (MAJOR)
- [ ] [OAuth implemented](#oauth-impl)
- [ ] [OAuth provider works](#oauth-provider)
- [ ] [Token security](#oauth-tokens)
- [ ] [User data fetched](#oauth-data)
- [ ] [Session persists](#oauth-session)

### Module: Remote Players (MAJOR)
- [ ] [Two remote players](#remote-two)
- [ ] [Real-time sync](#remote-sync)
- [ ] [Lag handled](#remote-lag)
- [ ] [Disconnect handled](#remote-disconnect)
- [ ] [WebSocket used](#remote-ws)

### Module: Multiplayer >2 Players (MAJOR)
- [ ] [3+ players supported](#multi-players)
- [ ] [Scoring adapts](#multi-scoring)
- [ ] [Square board](#multi-board)
- [ ] [Win conditions clear](#multi-win)

### Module: Additional Game (MAJOR)
- [ ] [Second game exists](#game-second)
- [ ] [Rules defined](#game-rules)
- [ ] [Game state tracked](#game-state)
- [ ] [History recorded](#game-history)

### Module: Game Customization (MINOR)
- [ ] [Power-ups work](#custom-powerup)
- [ ] [Customization menu](#custom-menu)
- [ ] [Game balanced](#custom-balance)

### Module: Live Chat (MAJOR)
- [ ] [Direct messages](#chat-dm)
- [ ] [Message history](#chat-history)
- [ ] [User blocking](#chat-block)
- [ ] [Game invites](#chat-invite)
- [ ] [Tournament notifications](#chat-tournament)
- [ ] [Real-time delivery](#chat-realtime)

### Module: AI Opponent (MAJOR)
- [ ] [AI functional](#ai-func)
- [ ] [Keyboard simulation](#ai-keyboard)
- [ ] [1-second refresh](#ai-refresh)
- [ ] [Same speed as players](#ai-speed)
- [ ] [No A* algorithm](#ai-no-astar)

### Module: User Dashboard (MINOR)
- [ ] [Stats dashboard](#dash-stats)
- [ ] [Charts/graphs](#dash-charts)
- [ ] [Real-time updates](#dash-realtime)

### Module: WAF & Vault (MAJOR)
- [ ] [WAF implemented](#waf-impl)
- [ ] [HashiCorp Vault](#vault-impl)
- [ ] [Secrets in Vault](#vault-secrets)

### Module: GDPR Compliance (MINOR)
- [ ] [Data anonymization](#gdpr-anon)
- [ ] [Account deletion](#gdpr-delete)
- [ ] [Data export](#gdpr-export)

### Module: 2FA & JWT (MAJOR)
- [ ] [2FA enabled](#twofa-enabled)
- [ ] [2FA method works](#twofa-method)
- [ ] [JWT implemented](#jwt-impl)
- [ ] [JWT signed](#jwt-sign)
- [ ] [JWT validated](#jwt-validate)
- [ ] [Token expiry](#jwt-expire)

### Module: ELK Stack (MAJOR)
- [ ] [Elasticsearch running](#elk-elastic)
- [ ] [Logstash running](#elk-logstash)
- [ ] [Kibana running](#elk-kibana)
- [ ] [Logs collected](#elk-logs)

### Module: Monitoring (MINOR)
- [ ] [Prometheus deployed](#monitor-prom)
- [ ] [Grafana dashboards](#monitor-grafana)
- [ ] [Alerts configured](#monitor-alerts)

### Module: Microservices (MAJOR)
- [ ] [Services independent](#micro-independent)
- [ ] [Service discovery](#micro-discovery)
- [ ] [API gateway](#micro-gateway)

### Module: 3D Graphics (MAJOR)
- [ ] [Babylon.js used](#graphics-babylon)
- [ ] [3D Pong](#graphics-3d)
- [ ] [Lighting/textures](#graphics-advanced)
- [ ] [Performance smooth](#graphics-perf)

### Module: Responsive Design (MINOR)
- [ ] [Works on desktop](#responsive-desktop)
- [ ] [Works on mobile](#responsive-mobile)
- [ ] [Touch input](#responsive-touch)

### Module: Browser Compatibility (MINOR)
- [ ] [Firefox supported](#browser-firefox)
- [ ] [Second browser](#browser-second)

### Module: Multi-Language (MINOR)
- [ ] [Language switcher](#lang-switcher)
- [ ] [3+ languages](#lang-three)
- [ ] [Translations complete](#lang-translate)

### Module: Accessibility (MINOR)
- [ ] [Screen reader compatible](#access-screen)
- [ ] [Alt text on images](#access-alt)
- [ ] [Keyboard navigation](#access-keyboard)
- [ ] [High contrast mode](#access-contrast)

### Module: SSR (MINOR)
- [ ] [Server-side rendering](#ssr-impl)
- [ ] [SEO friendly](#ssr-seo)
- [ ] [Hydration works](#ssr-hydration)

### Module: Server-Side Pong (MAJOR)
- [ ] [Logic on server](#server-logic)
- [ ] [Ball physics on server](#server-physics)
- [ ] [API endpoints](#server-api)
- [ ] [Client sync](#server-sync)

### Module: CLI Pong (MAJOR)
- [ ] [CLI app exists](#cli-app)
- [ ] [CLI connects to API](#cli-api)
- [ ] [CLI gameplay](#cli-gameplay)
- [ ] [CLI vs web players](#cli-vs-web)

---

<a name="part1-details"></a>
## 📖 PART 1: SETUP & DEPLOYMENT - DETAILED STEPS

<a name="repo-clone"></a>
### ✓ Repository Clone

**What to check:** Clean Git repository cloned in empty folder

**How to verify:**
```bash
cd ~/evaluation_test
git clone <repository_url> project
cd project
ls -la .git
git log --oneline | head -10
```

**Pass criteria:**
- Repository clones without errors
- `.git` folder exists
- Commit history visible
- No clone warnings

**Fail criteria:**
- Clone fails
- Corrupted repository
- Missing .git folder

[↑ Back to checklist](#quick-checklist)

---

<a name="malicious-code"></a>
### ✓ No Malicious Code

**What to check:** No suspicious aliases, hidden commands, or malicious scripts

**How to verify:**
```bash
cat Makefile                           # Check build commands
grep -r "eval(" . --include="*.js" --include="*.ts"  # Dangerous eval
cat docker-compose.yml                 # Check volume mounts
grep -r "rm -rf" . --include="*.sh"   # Destructive commands
cat .git/config                        # Check git hooks
```

**Pass criteria:**
- No suspicious eval() usage
- No destructive commands in Makefile
- Docker volumes mount only project directories
- No malicious git hooks

**Red flags:**
- `eval()` with user input
- `rm -rf /` or similar
- Suspicious volume mounts (`:rw` to system directories)
- Hidden cryptocurrency miners

[↑ Back to checklist](#quick-checklist)

---

<a name="env-file"></a>
### ✓ .env File (Not in Git)

**What to check:** Credentials in .env, NOT committed to Git

**How to verify:**
```bash
ls -la .env                              # Must exist
cat .env                                 # View contents
cat .gitignore | grep ".env"            # Should be ignored
git log --all --full-history -- .env    # Should return nothing
git status                               # .env should not be tracked
```

**Pass criteria:**
- `.env` file exists
- Contains: DB credentials, API keys, OAuth secrets, JWT secret
- `.env` in `.gitignore`
- Never committed to Git (empty git log)

**Fail criteria:**
- No .env file
- Secrets hardcoded in source files
- .env committed to Git history
- .env not in .gitignore

[↑ Back to checklist](#quick-checklist)

---

<a name="docker-compose"></a>
### ✓ docker-compose.yml Exists

**What to check:** docker-compose file at project root

**How to verify:**
```bash
ls -la docker-compose.yml
cat docker-compose.yml
```

**Pass criteria:**
- File exists at root
- Valid YAML syntax
- Services defined (backend, frontend, database, etc.)
- Port mappings present
- Volume mappings present
- Networks configured

**Example structure:**
```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
  db:
    image: postgres:latest
```

[↑ Back to checklist](#quick-checklist)

---

<a name="docker-build"></a>
### ✓ Docker Build & Launch

**What to check:** Single command builds and starts everything

**How to verify:**
```bash
docker-compose down --volumes           # Clean start
docker-compose up --build               # Build + run
# Watch for errors in output
docker ps                               # All containers "Up"
docker-compose logs                     # Check logs
```

**Pass criteria:**
- Build completes without errors
- All containers start successfully
- `docker ps` shows all containers with status "Up"
- No crash loops or exit codes

**Fail criteria:**
- Build errors (missing dependencies, syntax errors)
- Containers exit immediately
- Port conflicts
- Volume mount errors

**Common issues:**
- Missing .env file → containers can't start
- Port already in use → change ports in docker-compose.yml
- Network conflicts → clear docker networks

[↑ Back to checklist](#quick-checklist)

---

<a name="website-access"></a>
### ✓ Website Accessible

**What to check:** Can access website in browser

**How to verify:**
1. Start containers: `docker-compose up`
2. Open browser: `https://localhost` or specified port
3. Wait for page load
4. Check browser console (F12) for errors

**Pass criteria:**
- Page loads in browser
- No 404 errors
- Assets load (CSS, JS, images)
- No CORS errors in console

**Fail criteria:**
- Connection refused
- 502 Bad Gateway
- Blank page
- Assets fail to load

[↑ Back to checklist](#quick-checklist)

---

<a name="prohibited-libs"></a>
### ✓ No Prohibited Libraries

**What to check:** No libraries that provide complete feature solutions

**How to verify:**
```bash
cat backend/package.json | grep dependencies
cat frontend/package.json | grep dependencies
```

**Ask team:**
- "Why did you use [library X]?"
- "What does this library do?"
- "Could you implement without it?"

**Pass criteria:**
- Small utility libraries OK (lodash, date-fns, etc.)
- Large frameworks match chosen modules (Fastify, Tailwind)
- Team can justify ALL library choices
- No "complete solution" libraries for core features

**Red flags:**
- Using a complete Pong game library
- Pre-built tournament systems
- Complete auth systems (unless OAuth module)

[↑ Back to checklist](#quick-checklist)

---

<a name="console-errors"></a>
### ✓ No Console Errors

**What to check:** Browser console clean during normal usage

**How to verify:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate through website
4. Play a game
5. Use all features

**Pass criteria:**
- No unhandled errors (red text)
- Warnings acceptable if minor
- No failed network requests
- No undefined variables

**Acceptable warnings:**
- Dev mode warnings
- Browser extension warnings
- Deprecation notices (if minor)

**Fail criteria:**
- Uncaught exceptions
- 404 errors for assets
- CORS errors
- Failed API requests

[↑ Back to checklist](#quick-checklist)

---

<a name="memory-check"></a>
### ✓ No Memory Leaks

**What to check:** Memory usage stays stable

**How to verify:**

**Browser:**
1. Open DevTools → Performance/Memory tab
2. Take heap snapshot
3. Use website for 5-10 minutes
4. Take another snapshot
5. Compare memory usage

**Backend:**
```bash
docker stats                    # Watch container memory
# Use site, then check again
docker stats
```

**Pass criteria:**
- Memory usage grows slowly or stays stable
- No exponential growth
- Containers don't OOM (Out of Memory)

**Fail criteria:**
- Memory doubles every minute
- Container crashes with OOM
- Browser tab crashes

[↑ Back to checklist](#quick-checklist)

---

<a name="performance-check"></a>
### ✓ Performance Acceptable

**What to check:** No hangs, freezes, or excessive delays

**How to verify:**
1. Navigate between pages - should be instant
2. Start a game - should load < 2 seconds
3. Play game - should be smooth (30+ fps)
4. Send chat messages - should appear instantly
5. Load user profiles - should load < 1 second

**Pass criteria:**
- Page transitions < 500ms
- Game loads < 2 seconds
- Gameplay smooth (no stuttering)
- API responses < 1 second
- No UI freezes

**Fail criteria:**
- Pages take > 3 seconds to load
- Game stutters or lags
- UI freezes during operations
- Timeout errors

[↑ Back to checklist](#quick-checklist)

---

[↑ Back to top](#table-of-contents)

<a name="part2-details"></a>
## 🔒 PART 2: SECURITY (CRITICAL) - DETAILED STEPS

**⚠️ WARNING: If ANY security check fails, stop evaluation immediately. Project fails.**

<a name="https-check"></a>
### ✓ HTTPS/TLS Enabled

**What to check:** Website uses HTTPS encryption

**How to verify:**

**Browser:**
1. Open website in browser
2. Check URL bar - should show `https://` with padlock icon
3. Click padlock → View certificate
4. Verify certificate is valid (not self-signed for production)

**Command line:**
```bash
curl -I https://localhost
# Should not show SSL errors
openssl s_client -connect localhost:443
# Should show certificate details
```

**Pass criteria:**
- URL uses `https://`
- Valid SSL/TLS certificate
- No browser security warnings
- Certificate not expired

**Fail criteria:**
- Uses `http://` without redirect to HTTPS
- Self-signed certificate in production
- Certificate expired
- SSL errors

[↑ Back to checklist](#quick-checklist)

---

<a name="wss-check"></a>
### ✓ WebSocket Uses WSS

**What to check:** WebSocket connections are encrypted (WSS not WS)

**How to verify:**

**Browser DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "WS" (WebSocket)
4. Start a game or chat
5. Check WebSocket connection URL

**Pass criteria:**
- WebSocket URL: `wss://` (not `ws://`)
- Connection shows in Network tab
- No security warnings

**Check in code:**
```bash
grep -r "ws://" frontend/src/
# Should return nothing or only comments
grep -r "wss://" frontend/src/
# Should find WebSocket connections
```

**Fail criteria:**
- Uses `ws://` (unencrypted)
- Mixed content warnings
- Connection not encrypted

[↑ Back to checklist](#quick-checklist)

---

<a name="password-hash"></a>
### ✓ Passwords Hashed in Database

**What to check:** Passwords stored as hashes, NEVER plaintext

**How to verify:**

**Database inspection:**
```bash
# For SQLite
docker exec -it <db_container> sqlite3 /path/to/database.db
sqlite> SELECT username, password FROM users LIMIT 3;
# Passwords should be hashed (long random strings)

# For PostgreSQL
docker exec -it <db_container> psql -U <user> -d <database>
SELECT username, password FROM users LIMIT 3;
```

**Pass criteria:**
- Password column contains hashes (60+ character random strings)
- Hashes look like: `$2b$10$...` (bcrypt) or similar
- No plaintext passwords visible
- Different users have different hashes (even for same password)

**Example good hash:**
```
$2b$10$N9qo8uLOickgx2ZMRZoMye IFrHZhBtjy3qvveK3z5l6e2v.cOK
```

**Fail criteria:**
- Plaintext passwords in database
- Passwords like "password123" visible
- Same hash for different users
- Weak hashing (MD5, SHA1 without salt)

**Ask team:** "What hashing algorithm do you use?" (Should be bcrypt, argon2, or scrypt)

[↑ Back to checklist](#quick-checklist)

---

<a name="sql-injection"></a>
### ✓ SQL Injection Protection

**What to check:** Server validates and escapes SQL queries

**How to verify:**

**Manual testing:**
1. Go to login page
2. Try username: `admin' OR '1'='1`
3. Try password: `' OR '1'='1' --`
4. Should NOT log in successfully

**More tests:**
```
Username: '; DROP TABLE users; --
Username: admin'--
Password: ' OR 1=1--
Search: '; DELETE FROM games; --
```

**Code inspection:**
```bash
# Check for parameterized queries (GOOD)
grep -r "?" backend/src/ | grep -i "query\|execute"
grep -r "\$1" backend/src/ | grep -i "query"

# Check for string concatenation (BAD)
grep -r "query.*+.*req\." backend/src/
grep -r "'.*\+.*params" backend/src/
```

**Pass criteria:**
- SQL injection attempts fail
- Error messages don't reveal database structure
- Code uses parameterized queries/prepared statements
- No string concatenation in SQL queries

**Example GOOD code:**
```javascript
db.query("SELECT * FROM users WHERE username = ?", [username])
```

**Example BAD code:**
```javascript
db.query("SELECT * FROM users WHERE username = '" + username + "'")
```

**Fail criteria:**
- SQL injection succeeds
- Can access other users' data
- Can modify database
- Error reveals database structure

[↑ Back to checklist](#quick-checklist)

---

<a name="xss-protection"></a>
### ✓ XSS Protection

**What to check:** User input is sanitized, scripts don't execute

**How to verify:**

**Manual testing:**
1. Go to profile edit or chat
2. Try entering: `<script>alert('XSS')</script>`
3. Try: `<img src=x onerror=alert('XSS')>`
4. Try: `<svg onload=alert('XSS')>`
5. Save and view - scripts should NOT execute

**More payloads:**
```html
<iframe src="javascript:alert('XSS')">
<body onload=alert('XSS')>
<input onfocus=alert('XSS') autofocus>
javascript:alert('XSS')
```

**Code inspection:**
```bash
# Check for input sanitization (GOOD)
grep -r "sanitize\|escape\|DOMPurify" backend/src/
grep -r "textContent\|innerText" frontend/src/

# Check for dangerous innerHTML (BAD if unsanitized)
grep -r "innerHTML.*req\.\|innerHTML.*input" frontend/src/
```

**Pass criteria:**
- XSS attempts display as text (not execute)
- Scripts are escaped: `&lt;script&gt;`
- User input sanitized server-side
- DOM methods use `textContent` not `innerHTML`

**Fail criteria:**
- Alert boxes appear
- Scripts execute
- Can inject malicious code
- innerHTML used with user input

[↑ Back to checklist](#quick-checklist)

---

<a name="server-validation"></a>
### ✓ Server-Side Validation

**What to check:** All forms validated on server, not just client

**How to verify:**

**Bypass client validation:**
1. Open DevTools (F12)
2. Go to Console
3. Try API request directly:
```javascript
fetch('/api/users', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    username: '',  // Empty username
    password: '123',  // Too short
    email: 'notanemail'  // Invalid format
  })
})
```

**Pass criteria:**
- Server rejects invalid data
- Returns error messages: 400 Bad Request
- Validation happens even if client validation bypassed
- Error messages don't reveal system details

**Test cases:**
- Empty required fields
- Invalid email formats
- Passwords too short
- SQL injection attempts
- XSS attempts
- Oversized inputs (100K+ characters)

**Code inspection:**
```bash
grep -r "validator\|validate\|sanitize" backend/src/api/
```

**Fail criteria:**
- Server accepts invalid data
- No validation on backend
- Only client-side validation
- 500 errors on invalid input

[↑ Back to checklist](#quick-checklist)

---

<a name="input-sanitization"></a>
### ✓ Input Sanitization

**What to check:** All user inputs cleaned before processing

**How to verify:**

**Check sanitization exists:**
```bash
grep -r "sanitize\|clean\|escape\|validator" backend/src/
```

**Test various inputs:**
1. **Username:** Try `<script>test</script>`, `admin'; DROP TABLE--`
2. **Chat messages:** HTML tags, JavaScript
3. **File uploads:** `.php`, `.exe` files (if upload exists)
4. **Search queries:** SQL commands, XSS payloads

**Pass criteria:**
- All inputs validated before use
- HTML tags escaped or removed
- SQL characters escaped
- File uploads restricted to allowed types
- Input length limits enforced

**Code example (GOOD):**
```typescript
import validator from 'validator';
const username = validator.escape(req.body.username);
const email = validator.normalizeEmail(req.body.email);
```

**Fail criteria:**
- Raw user input used directly
- No sanitization functions
- Can inject code through inputs

[↑ Back to checklist](#quick-checklist)

---

<a name="ssl-certs"></a>
### ✓ Valid SSL Certificates

**What to check:** SSL certificates are valid (not self-signed for production)

**How to verify:**

**Browser check:**
1. Visit website in browser
2. Click padlock in URL bar
3. View certificate details
4. Check:
   - Issued by trusted CA (not "self-signed")
   - Not expired
   - Domain matches

**Command line:**
```bash
openssl s_client -connect localhost:443 -showcerts
# Check "Verify return code: 0 (ok)"

curl https://localhost -v
# Should not show certificate errors
```

**Development vs Production:**
- **Development:** Self-signed OK (but must still use HTTPS)
- **Production:** Must use valid CA-signed certificate

**Pass criteria:**
- Certificate is valid
- Not expired
- Issued by trusted CA (for production)
- Domain name matches

**Fail criteria (production):**
- Self-signed certificate
- Expired certificate
- Domain mismatch
- Using HTTP instead of HTTPS

[↑ Back to checklist](#quick-checklist)

---

<a name="secrets-git"></a>
### ✓ No Secrets in Git

**What to check:** No API keys, passwords, or secrets committed to Git

**How to verify:**

```bash
# Check current files
grep -r "password.*=" . --include="*.ts" --include="*.js" --include="*.env"
grep -r "api_key\|apiKey\|secret" . --include="*.ts" --include="*.js"

# Check Git history
git log --all --full-history -p | grep -i "password\|api_key\|secret"

# Check for common secret patterns
grep -r "mongodb://.*:.*@" .
grep -r "postgres://.*:.*@" .
grep -r "sk_live_\|pk_live_" .  # Stripe keys
```

**Pass criteria:**
- No hardcoded passwords in code
- No API keys in source files
- All secrets in .env file
- .env never committed to Git

**Common violations:**
```javascript
// BAD - hardcoded secret
const JWT_SECRET = "my_super_secret_key";
const API_KEY = "sk_live_abc123";

// GOOD - from environment
const JWT_SECRET = process.env.JWT_SECRET;
```

**Fail criteria:**
- Secrets in source code
- .env file in Git history
- API keys visible in code
- Database credentials hardcoded

[↑ Back to checklist](#quick-checklist)

---

<a name="env-security"></a>
### ✓ .env File Security

**What to check:** All sensitive data in .env, file properly secured

**How to verify:**

```bash
# Check .env exists
ls -la .env

# Check .env contents
cat .env

# Verify in .gitignore
cat .gitignore | grep -E "^\.env$|^\*\.env$"

# Verify NOT in Git
git ls-files | grep .env  # Should return nothing
git log --all -- .env     # Should return nothing
```

**Required in .env:**
```
DATABASE_URL=...
JWT_SECRET=...
OAUTH_CLIENT_ID=...
OAUTH_CLIENT_SECRET=...
SESSION_SECRET=...
API_KEY=...
```

**Pass criteria:**
- .env file exists
- Contains all secrets
- In .gitignore
- Never committed to Git
- File permissions secure (chmod 600)

**Check permissions:**
```bash
ls -l .env
# Should show: -rw------- (600) or -rw-r----- (640)
```

**Fail criteria:**
- No .env file
- Secrets in code
- .env committed to Git
- .env readable by all users (777)

[↑ Back to checklist](#quick-checklist)

---

[↑ Back to top](#table-of-contents)

<a name="part3-details"></a>
## 🎮 PART 3: CORE GAME & TOURNAMENT - DETAILED STEPS

<a name="pong-playable"></a>
### ✓ Pong Game Playable

**What to check:** Live Pong game works and is playable

**How to verify:**
1. Navigate to game section
2. Start a new game
3. Game should load and display:
   - Two paddles (left and right)
   - Ball in center
   - Score display (0-0)
   - Game boundaries

**Pass criteria:**
- Game loads without errors
- Paddles visible on both sides
- Ball appears and moves
- Score displays correctly
- Game area properly rendered

**Fail criteria:**
- Game doesn't load
- Missing paddles or ball
- Black screen or errors
- Game freezes immediately

[↑ Back to checklist](#quick-checklist)

---

<a name="two-player-local"></a>
### ✓ Local Two-Player Mode

**What to check:** Two players can play on same keyboard

**How to verify:**
1. Start a local game
2. Player 1 uses one set of keys (e.g., W/S or Arrow Up/Down)
3. Player 2 uses different keys (e.g., Arrow Up/Down or I/K)
4. Both players should control their paddles simultaneously

**Test:**
- Press Player 1 keys → Left paddle moves
- Press Player 2 keys → Right paddle moves
- Press both at same time → Both paddles move independently

**Pass criteria:**
- Both players can control paddles simultaneously
- No key conflicts
- Controls responsive
- Clear indication of which keys for which player

**Fail criteria:**
- Only one player can move at a time
- Key conflicts (same keys for both)
- Controls not working
- No way to play locally

[↑ Back to checklist](#quick-checklist)

---

<a name="keyboard-controls"></a>
### ✓ Keyboard Controls Work

**What to check:** Paddle controls are responsive and intuitive

**How to verify:**
1. Start game
2. Test all control keys:
   - Up key → Paddle moves up smoothly
   - Down key → Paddle moves down smoothly
   - Release key → Paddle stops immediately

**Pass criteria:**
- Controls respond instantly (< 50ms delay)
- Paddle moves smoothly
- No stuttering or lag
- Paddle stops when key released
- Controls clearly documented or intuitive

**Common control schemes:**
- W/S and Arrow Up/Down
- W/S and I/K
- Q/A and P/L

**Fail criteria:**
- Delayed response (> 200ms)
- Paddle doesn't stop
- Erratic movement
- Keys don't work

[↑ Back to checklist](#quick-checklist)

---

<a name="paddle-speed"></a>
### ✓ Paddle Speeds Equal

**What to check:** All paddles move at identical speed

**How to verify:**
1. Start a game
2. Move both paddles from bottom to top simultaneously
3. Time how long each takes
4. If AI exists, test AI paddle speed too

**Test method:**
```
1. Position both paddles at bottom
2. Hold both up keys simultaneously
3. Watch both paddles reach top
4. They should arrive at same time
```

**Pass criteria:**
- Both player paddles move at same speed
- AI paddle (if exists) moves at same speed
- No speed advantages
- Speed feels balanced (not too fast/slow)

**Fail criteria:**
- One paddle faster than other
- AI has speed advantage
- Unfair gameplay due to speed differences

[↑ Back to checklist](#quick-checklist)

---

<a name="ball-physics"></a>
### ✓ Ball Physics Correct

**What to check:** Ball behavior follows Pong rules

**How to verify:**

**Basic physics:**
1. Ball bounces off top/bottom walls correctly
2. Ball bounces off paddles correctly
3. Ball angle changes based on paddle hit position
4. Ball passes through when paddle misses

**Angle testing:**
- Hit ball with center of paddle → Straight reflection
- Hit ball with top of paddle → Upward angle
- Hit ball with bottom of paddle → Downward angle

**Speed:**
- Ball speed consistent or increases gradually
- Not too fast to be unplayable
- Not too slow to be boring

**Pass criteria:**
- Ball bounces realistically
- Angles make sense
- Speed is playable
- Ball doesn't glitch through paddles
- Follows original Pong physics

**Fail criteria:**
- Ball goes through paddles
- Unrealistic angles
- Ball gets stuck
- Ball disappears
- Physics glitches

[↑ Back to checklist](#quick-checklist)

---

<a name="scoring-system"></a>
### ✓ Scoring System Works

**What to check:** Points awarded correctly

**How to verify:**
1. Start game (score: 0-0)
2. Let ball pass left paddle → Right player scores (0-1)
3. Let ball pass right paddle → Left player scores (1-1)
4. Continue testing

**Pass criteria:**
- Score starts at 0-0
- Point awarded when ball exits play area
- Correct player receives point
- Score updates immediately
- Score displays clearly
- Game tracks score accurately

**Test edge cases:**
- Ball touching boundary line
- Very fast ball
- Multiple rapid scores

**Fail criteria:**
- Score doesn't update
- Wrong player gets point
- Score resets unexpectedly
- Score not visible

[↑ Back to checklist](#quick-checklist)

---

<a name="game-end"></a>
### ✓ Game Ends Properly

**What to check:** Game has proper end state and winner display

**How to verify:**
1. Play until someone wins (usually first to 11 or set limit)
2. Game should:
   - Stop gameplay
   - Display winner clearly
   - Show final score
   - Offer rematch or return to menu

**Pass criteria:**
- Game ends at win condition (e.g., 11 points)
- Winner announced clearly
- Final score displayed
- Can exit or start new game
- No crashes at game end

**Fail criteria:**
- Game never ends
- No winner display
- Game continues after win
- Crash at game end
- Can't exit game

[↑ Back to checklist](#quick-checklist)

---

<a name="realtime-multi"></a>
### ✓ Real-Time Multiplayer

**What to check:** Multiplayer gameplay happens in real-time

**How to verify:**
1. Start multiplayer game (local or remote)
2. Both players move simultaneously
3. Ball position updates in real-time for both
4. No turn-based delays

**Pass criteria:**
- Both players see same game state
- Actions reflected immediately
- Ball position synchronized
- No noticeable lag (< 100ms)
- Simultaneous gameplay

**Fail criteria:**
- Turn-based (not real-time)
- Significant lag (> 500ms)
- Desynchronization between players
- Only one player can move at a time

[↑ Back to checklist](#quick-checklist)

---

<a name="tournament-system"></a>
### ✓ Tournament System Exists

**What to check:** Tournament/bracket system implemented

**How to verify:**
1. Navigate to tournament section
2. System should show:
   - Tournament creation option
   - Player registration
   - Bracket/match structure
   - Match schedule

**Pass criteria:**
- Tournament interface exists
- Can create tournaments
- Shows bracket structure
- Multiple matches organized
- Tournament progression tracked

**Fail criteria:**
- No tournament feature
- Only single matches
- No bracket system
- Can't organize multiple players

[↑ Back to checklist](#quick-checklist)

---

<a name="tournament-players"></a>
### ✓ Multiple Players (4+)

**What to check:** Tournament supports 4 or more players

**How to verify:**
1. Create tournament
2. Add at least 4 players
3. System should organize them into bracket
4. Matches scheduled properly

**Test with:**
- 4 players (semi-finals → finals)
- 8 players (quarter-finals → semi-finals → finals)
- Odd numbers (5, 6, 7 players) with byes

**Pass criteria:**
- Minimum 4 players supported
- Bracket generated correctly
- Byes handled if odd number
- All players get to play
- Tournament structure makes sense

**Fail criteria:**
- Only 2 players supported
- Can't add more than 2-3 players
- Bracket doesn't generate
- Players missing from bracket

[↑ Back to checklist](#quick-checklist)

---

<a name="turn-based"></a>
### ✓ Turn-Based Matches

**What to check:** Players take turns playing matches (not all simultaneous)

**How to verify:**
1. Create tournament with 4+ players
2. First match: Player A vs Player B
3. Other players wait
4. Next match: Player C vs Player D
5. Winners face each other in finals

**Pass criteria:**
- Matches happen sequentially
- Clear turn order
- Players know when it's their turn
- Non-playing participants can watch
- Tournament progresses logically

**Note:** The matches themselves are real-time, but players take turns participating in matches.

[↑ Back to checklist](#quick-checklist)

---

<a name="match-display"></a>
### ✓ Clear Match Display

**What to check:** Easy to see who plays whom and when

**How to verify:**
1. View tournament bracket
2. Should clearly show:
   - Current match: "Player A vs Player B"
   - Next match: "Player C vs Player D"
   - Match order/round numbers
   - Winners advancing to next round

**Pass criteria:**
- Bracket is visual and clear
- Can see all matches at a glance
- Current match highlighted
- Player names visible
- Match progression obvious

**Good bracket elements:**
- Visual lines connecting matches
- Round labels (Semi-finals, Finals)
- Current match indicator
- Completed matches marked
- Scores displayed

[↑ Back to checklist](#quick-checklist)

---

<a name="matchmaking"></a>
### ✓ Automatic Matchmaking

**What to check:** System automatically organizes matches

**How to verify:**
1. Add players to tournament
2. System should automatically:
   - Create bracket
   - Pair players
   - Schedule match order
   - Handle byes if needed
   - Advance winners

**Pass criteria:**
- No manual bracket creation needed
- System pairs players fairly
- Bracket generated automatically
- Winners advance automatically
- Logical pairing (1v8, 2v7, etc.)

**Fail criteria:**
- Manual pairing required
- Random unfair pairings
- Bracket errors
- Winners don't advance
- System can't handle odd numbers

[↑ Back to checklist](#quick-checklist)

---

<a name="match-announce"></a>
### ✓ Match Announcements

**What to check:** System announces next match and participants

**How to verify:**
1. Wait for match to end
2. System should announce/display:
   - "Next Match: Player X vs Player Y"
   - Or: "Round 2: Player A vs Player C"
   - Clear notification of upcoming match

**Pass criteria:**
- Announcements visible/clear
- Players notified of their match
- Spectators can see what's next
- Announcements at appropriate times

**Can be:**
- On-screen notifications
- Banner at top
- Chat announcements
- Modal popup
- Tournament page updates

[↑ Back to checklist](#quick-checklist)

---

<a name="alias-input"></a>
### ✓ Alias Input at Tournament Start

**What to check:** Players enter alias/name when joining tournament

**How to verify:**
1. Start new tournament
2. System should prompt for player names/aliases
3. Names used throughout tournament
4. Different from login usernames (if Standard User Management not implemented)

**Pass criteria:**
- Alias input field appears
- Can enter custom tournament names
- Names display in bracket
- Each player has unique identifier
- Names persist through tournament

**Note:** If Standard User Management module selected, can use registered usernames instead.

[↑ Back to checklist](#quick-checklist)

---

<a name="alias-reset"></a>
### ✓ Alias Reset Per Tournament

**What to check:** Aliases don't persist between tournaments

**How to verify:**
1. Complete tournament with aliases
2. Start new tournament
3. Should prompt for aliases again
4. Previous aliases not pre-filled

**Pass criteria:**
- Each tournament starts fresh
- Must re-enter aliases for new tournament
- No persistent registration
- Aliases only valid for single tournament

**Exception:** If Standard User Management module implemented, persistent accounts are allowed.

[↑ Back to checklist](#quick-checklist)

---

<a name="disconnect-handle"></a>
### ✓ Disconnect Handling

**What to check:** Disconnections don't crash the game

**How to verify:**

**Browser disconnect:**
1. Start online game
2. Close one player's browser tab
3. Or: Disable network temporarily
4. Game should handle gracefully

**Pass criteria:**
- No server crash
- Error message displayed
- Other player notified
- Game ends gracefully or pauses
- Can reconnect (optional)

**Fail criteria:**
- Server crashes
- Both clients freeze
- No disconnect detection
- Game continues as if nothing happened

[↑ Back to checklist](#quick-checklist)

---

<a name="lag-handle"></a>
### ✓ Lag Handling

**What to check:** Network lag doesn't break gameplay

**How to verify:**

**Simulate lag:**
```bash
# On Linux, limit network speed
sudo tc qdisc add dev eth0 root netem delay 200ms
# Play game
# Remove limit:
sudo tc qdisc del dev eth0 root
```

**Or:**
- Use browser DevTools → Network → Throttling → Slow 3G
- Play game with poor connection

**Pass criteria:**
- Game continues functioning
- Ball position stays synchronized (eventually)
- Paddles respond (with delay)
- No crashes or freezes
- Lag compensation visible

**Fail criteria:**
- Game freezes
- Ball teleports erratically
- Complete desync between players
- Crash on lag spike

[↑ Back to checklist](#quick-checklist)

---

<a name="crash-handle"></a>
### ✓ No Crashes on Errors

**What to check:** Application handles errors without crashing

**How to verify:**

**Test error scenarios:**
1. Invalid inputs (empty forms, special characters)
2. Network disconnections
3. Rapid clicking/spamming actions
4. Browser back button during game
5. Refresh page during game
6. Multiple simultaneous games

**Pass criteria:**
- Application stays running
- Error messages displayed to user
- Can recover from errors
- Logs errors appropriately
- No white screen of death

**Fail criteria:**
- Application crashes
- Server goes down
- Must restart containers
- Data loss on errors

[↑ Back to checklist](#quick-checklist)

---

[↑ Back to top](#table-of-contents)

<a name="part4-details"></a>
## 🌐 PART 4: WEB MODULES - DETAILED STEPS

<a name="backend-fastify"></a>
### ✓ Module: Backend Framework (Fastify + Node.js) [MAJOR]

**What to check:** Backend uses Fastify with Node.js

**How to verify:**

**Check package.json:**
```bash
cat backend/package.json | grep -i fastify
# Should show: "fastify": "^4.x.x" or similar
```

**Check code:**
```bash
grep -r "fastify\|Fastify" backend/src/
# Should find imports like: import fastify from 'fastify'
```

**Pass criteria:**
- `fastify` in backend dependencies
- Server code uses Fastify framework
- Node.js runtime (not PHP or Python)
- Fastify imports in server files

**Ask team:**
- "Why did you choose Fastify?"
- "How does Fastify handle routes?"

[↑ Back to checklist](#quick-checklist)

---

<a name="backend-start"></a>
### ✓ Backend Server Starts Correctly

**What to check:** Fastify server starts without errors

**How to verify:**
```bash
docker-compose logs backend | head -50
# Should see: "Server listening at http://..." or similar
# Should NOT see: Error, crash, exit codes
```

**Test API endpoint:**
```bash
curl http://localhost:3000/api/health
# Or whatever port backend uses
# Should return 200 OK
```

**Pass criteria:**
- Server starts without errors
- Listening on configured port
- No crash loops
- API responds to requests

[↑ Back to checklist](#quick-checklist)

---

<a name="backend-api"></a>
### ✓ API Endpoints Work

**What to check:** Fastify API routes respond correctly

**How to verify:**

**Test various endpoints:**
```bash
# Health check
curl http://localhost:3000/api/health

# User endpoints (if exist)
curl http://localhost:3000/api/users

# Game endpoints
curl http://localhost:3000/api/games
```

**Browser DevTools:**
1. Open DevTools → Network tab
2. Use website features
3. Watch API calls
4. Should see: 200 OK responses

**Pass criteria:**
- Endpoints return data
- Correct HTTP status codes
- JSON responses formatted correctly
- Error handling works (404, 500, etc.)

[↑ Back to checklist](#quick-checklist)

---

<a name="backend-ws"></a>
### ✓ WebSocket via Fastify

**What to check:** WebSocket connections handled through Fastify

**How to verify:**

**Check code:**
```bash
grep -r "@fastify/websocket\|fastify-websocket" backend/
# Should find WebSocket plugin usage
```

**Browser test:**
1. Open DevTools → Network → WS filter
2. Start a game
3. Should see WebSocket connection established
4. URL should match backend port

**Pass criteria:**
- WebSocket plugin integrated with Fastify
- Connections establish successfully
- Real-time communication works
- Uses WSS (secure WebSocket)

[↑ Back to checklist](#quick-checklist)

---

<a name="frontend-tailwind"></a>
### ✓ Module: Frontend Framework (Tailwind CSS) [MINOR]

**What to check:** Frontend uses Tailwind CSS

**How to verify:**

**Check package.json:**
```bash
cat frontend/package.json | grep tailwind
# Should show: "tailwindcss": "^3.x.x"
```

**Check config:**
```bash
ls -la frontend/tailwind.config.js
cat frontend/tailwind.config.js
```

**Inspect HTML:**
1. Open website
2. Right-click element → Inspect
3. Should see Tailwind classes like:
   - `flex`, `grid`, `p-4`, `bg-blue-500`
   - `hover:bg-blue-600`, `md:w-1/2`

**Pass criteria:**
- Tailwind in dependencies
- tailwind.config.js exists
- HTML uses Tailwind utility classes
- Styles compile correctly

**Ask team:** "Show me how Tailwind is configured"

[↑ Back to checklist](#quick-checklist)

---

<a name="frontend-ts"></a>
### ✓ TypeScript for UI

**What to check:** Frontend code written in TypeScript

**How to verify:**
```bash
ls frontend/src/*.ts
# Should see .ts files (not just .js)

cat frontend/tsconfig.json
# TypeScript config should exist
```

**Pass criteria:**
- `.ts` files in frontend/src/
- `tsconfig.json` exists
- TypeScript compiles without errors
- Type annotations in code

[↑ Back to checklist](#quick-checklist)

---

<a name="frontend-responsive"></a>
### ✓ Responsive Design

**What to check:** UI adapts to different screen sizes

**How to verify:**

**Browser test:**
1. Open website in browser
2. Press F12 → Toggle device toolbar (Ctrl+Shift+M)
3. Test different sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

**Pass criteria:**
- Layout adapts to screen size
- No horizontal scrolling on mobile
- Text readable on all sizes
- Buttons/inputs usable on mobile
- Tailwind responsive classes used (`sm:`, `md:`, `lg:`)

[↑ Back to checklist](#quick-checklist)

---

<a name="frontend-css"></a>
### ✓ No CSS Errors

**What to check:** CSS compiles and displays correctly

**How to verify:**

**Browser:**
1. Open website
2. Press F12 → Console
3. Check for CSS warnings/errors

**Build:**
```bash
docker-compose logs frontend | grep -i "error\|warn"
# Should not show CSS build errors
```

**Visual check:**
- No broken layouts
- Colors display correctly
- Fonts load properly
- No missing styles
- Responsive classes work

**Pass criteria:**
- CSS builds without errors
- No console warnings about missing styles
- Layout renders correctly
- Tailwind utilities work

[↑ Back to checklist](#quick-checklist)

---

<a name="db-sqlite"></a>
### ✓ Module: Database (SQLite) [MINOR]

**What to check:** Application uses SQLite database

**How to verify:**

**Find database file:**
```bash
find . -name "*.db" -o -name "*.sqlite" -o -name "*.sqlite3"
# Should find database file(s)
```

**Check code:**
```bash
grep -r "sqlite\|sqlite3" backend/src/
# Should find SQLite imports/usage
```

**Inspect database:**
```bash
sqlite3 path/to/database.db
sqlite> .tables
# Should show tables: users, games, etc.
sqlite> .schema users
# Should show table structure
sqlite> .exit
```

**Pass criteria:**
- SQLite database file exists
- Code uses SQLite (not PostgreSQL/MySQL)
- Tables created and accessible
- Data persists between restarts

**Ask team:** "Where is the SQLite database stored?"

[↑ Back to checklist](#quick-checklist)

---

<a name="db-persist"></a>
### ✓ Database Persists Data

**What to check:** Data survives container restarts

**How to verify:**
1. Create user account or play game
2. Note data (username, score, etc.)
3. Restart containers: `docker-compose restart`
4. Check data still exists

**Pass criteria:**
- Data survives restarts
- Database file in volume (not ephemeral)
- docker-compose.yml has volume mapping
- No data loss on restart

**Check volumes:**
```bash
cat docker-compose.yml | grep -A 3 "volumes:"
# Should map database file to host
```

[↑ Back to checklist](#quick-checklist)

---

<a name="db-queries"></a>
### ✓ Database Queries Work

**What to check:** CRUD operations function correctly

**How to verify:**

**Test Create:**
- Register new user → Check database

**Test Read:**
- Login → Data retrieved correctly

**Test Update:**
- Edit profile → Changes saved

**Test Delete:**
- Delete account (if feature exists) → Data removed

**Check in database:**
```bash
sqlite3 database.db
sqlite> SELECT * FROM users WHERE username='testuser';
# Should show user data
```

**Pass criteria:**
- All CRUD operations work
- Queries execute without errors
- Data integrity maintained
- Foreign keys work (if used)

[↑ Back to checklist](#quick-checklist)

---

<a name="db-errors"></a>
### ✓ No Database Connection Errors

**What to check:** Database connects reliably

**How to verify:**

**Check logs:**
```bash
docker-compose logs backend | grep -i "database\|sqlite"
# Should NOT see connection errors
```

**Use application:**
- Perform multiple operations
- Check console for errors
- Verify data saves correctly

**Pass criteria:**
- No "database locked" errors
- No connection failures
- Concurrent operations work
- Error handling for DB issues

[↑ Back to checklist](#quick-checklist)

---

<a name="blockchain-avalanche"></a>
### ✓ Module: Blockchain (Avalanche) [MAJOR]

**What to check:** Uses Avalanche blockchain (if module selected)

**How to verify:**

**Check dependencies:**
```bash
grep -r "avalanche\|avax" backend/package.json
```

**Check code:**
```bash
grep -r "avalanche\|Avalanche" backend/src/
```

**Ask team:**
- "Show me Avalanche integration"
- "Which network: mainnet or testnet?"
- "How do you connect to Avalanche?"

**Pass criteria:**
- Avalanche libraries in dependencies
- Code connects to Avalanche network
- Smart contracts deployed to Avalanche
- Team can explain integration

[↑ Back to checklist](#quick-checklist)

---

<a name="blockchain-solidity"></a>
### ✓ Solidity Smart Contracts

**What to check:** Smart contracts written in Solidity

**How to verify:**
```bash
find . -name "*.sol"
# Should find .sol files (Solidity contracts)

cat path/to/contract.sol
# Review contract code
```

**Pass criteria:**
- `.sol` files exist
- Contracts compile successfully
- Contract addresses configured
- Team can explain contract logic

**Ask team:**
- "Show me the smart contract"
- "What does the contract do?"
- "How is it deployed?"

[↑ Back to checklist](#quick-checklist)

---

<a name="blockchain-scores"></a>
### ✓ Tournament Scores on Blockchain

**What to check:** Tournament results stored on blockchain

**How to verify:**

**Test workflow:**
1. Complete a tournament
2. Check if score written to blockchain
3. Verify transaction on Avalanche explorer

**Ask team:**
- "Show me tournament score on blockchain"
- "How do you write scores to blockchain?"
- "Can I see the transaction?"

**Pass criteria:**
- Tournament scores recorded on-chain
- Transactions visible on explorer
- Data immutable
- Gas fees handled

[↑ Back to checklist](#quick-checklist)

---

<a name="blockchain-deploy"></a>
### ✓ Smart Contracts Deploy Successfully

**What to check:** Contracts deployed and functional

**How to verify:**

**Check deployment:**
```bash
grep -r "contract.*address\|CONTRACT_ADDRESS" backend/
# Should find deployed contract addresses
```

**Ask team:**
- "Show deployment transaction"
- "Which network is contract on?"
- "How do you interact with contract?"

**Pass criteria:**
- Contracts deployed to blockchain
- Contract addresses in config
- Can call contract functions
- Transactions succeed

[↑ Back to checklist](#quick-checklist)

---

[↑ Back to top](#table-of-contents)

<a name="part5-details"></a>
## 👥 PART 5: USER MANAGEMENT MODULES - DETAILED STEPS

<a name="user-register"></a>
### ✓ Module: Standard User Management - Registration [MAJOR]

**What to check:** Secure registration system works

**How to verify:**
1. Navigate to registration page
2. Fill out form:
   - Username
   - Email
   - Password
   - Confirm password
3. Submit form
4. Should create account

**Pass criteria:**
- Registration form exists
- Required fields validated
- Email format validated
- Password strength enforced
- Account created successfully
- Confirmation message shown
- Can log in with new account

**Test edge cases:**
- Duplicate username → Error shown
- Duplicate email → Error shown
- Weak password → Rejected
- Password mismatch → Error shown
- Invalid email → Error shown

**Security checks:**
```bash
# Check password is hashed
sqlite3 database.db
sqlite> SELECT password FROM users WHERE username='newuser';
# Should see hash, not plaintext
```

[↑ Back to checklist](#quick-checklist)

---

<a name="user-login"></a>
### ✓ Login System Works

**What to check:** Users can log in securely

**How to verify:**
1. Go to login page
2. Enter username/email
3. Enter password
4. Submit
5. Should log in and redirect

**Pass criteria:**
- Login form exists
- Credentials validated
- Session created
- JWT token issued (if JWT module)
- Redirect to dashboard/home
- User stays logged in on refresh

**Test scenarios:**
- Valid credentials → Success
- Wrong password → Error message
- Non-existent user → Error message
- Empty fields → Validation error
- SQL injection attempts → Blocked

**Check session:**
```bash
# Browser DevTools → Application → Cookies/Local Storage
# Should see session token or JWT
```

[↑ Back to checklist](#quick-checklist)

---

<a name="user-avatar"></a>
### ✓ Avatar Upload

**What to check:** Users can upload/change profile pictures

**How to verify:**
1. Log in to account
2. Go to profile settings
3. Upload avatar image
4. Save changes
5. Avatar should display on profile

**Pass criteria:**
- Upload button/interface exists
- Accepts image files (jpg, png, gif)
- Image size validated (e.g., max 5MB)
- Avatar displays after upload
- Avatar persists after logout/login

**Security checks:**
```bash
# Check uploaded files
ls -la backend/uploads/avatars/
# Files should have safe names (no script extensions)
```

**Test security:**
- Try uploading .php, .exe → Should reject
- Try huge file (100MB) → Should reject
- Try non-image file → Should reject

**Check code:**
```bash
grep -r "multer\|upload" backend/src/
# Should have file upload validation
```

[↑ Back to checklist](#quick-checklist)

---

<a name="user-friends"></a>
### ✓ Friend Lists

**What to check:** Users can add/remove friends

**How to verify:**

**Add friend:**
1. Search for user
2. Click "Add Friend"
3. Friend request sent
4. Other user accepts
5. Now friends

**Or direct add:**
1. Enter username
2. Add to friends
3. Shows in friend list

**Remove friend:**
1. View friend list
2. Click remove on friend
3. Friend removed from list

**Pass criteria:**
- Can search for users
- Can send friend requests (or direct add)
- Friend list displays correctly
- Can remove friends
- Changes persist

**Check database:**
```bash
sqlite3 database.db
sqlite> SELECT * FROM friends WHERE user_id=1;
# Should show friend relationships
```

[↑ Back to checklist](#quick-checklist)

---

<a name="user-status"></a>
### ✓ Online Status [MAJOR]

**What to check:** Shows who is online/offline

**How to verify:**
1. Open two browsers (or incognito)
2. Log in as User A
3. Log in as User B in other browser
4. Check friend list or user list
5. Should show User A as "Online"

**Test:**
- User logs in → Status: Online
- User closes tab → Status: Offline (after timeout)
- User idle for time → Status: Away (optional)

**Pass criteria:**
- Online status visible
- Updates in real-time (or near real-time)
- Accurate status display
- WebSocket or polling for updates

**Check implementation:**
```bash
grep -r "online\|status\|presence" backend/src/
# Should track user connection status
```

[↑ Back to checklist](#quick-checklist)

---

<a name="user-stats"></a>
### ✓ Player Stats (Wins/Losses)

**What to check:** Displays game statistics

**How to verify:**
1. View user profile
2. Should display:
   - Total games played
   - Wins
   - Losses
   - Win rate (percentage)
   - (Optional) Elo/ranking

**Test:**
1. Play several games
2. Win some, lose some
3. Check profile stats
4. Numbers should be accurate

**Pass criteria:**
- Stats display on profile
- Accurate count of games
- Wins/losses tracked correctly
- Updates after each game
- Persists in database

**Check database:**
```bash
sqlite3 database.db
sqlite> SELECT username, wins, losses FROM users;
# Should show accurate stats
```

[↑ Back to checklist](#quick-checklist)

---

<a name="user-history"></a>
### ✓ Match History [MAJOR]

**What to check:** Shows history of past matches

**How to verify:**
1. View profile or match history page
2. Should show list of games:
   - Date/time played
   - Opponent name
   - Result (Win/Loss)
   - Score (e.g., 11-7)
   - Game type (Pong, Tournament, etc.)

**Pass criteria:**
- Match history page exists
- Shows all past games
- Displays opponent names
- Shows results and scores
- Sorted by date (newest first)
- Can view details of old games

**Check database:**
```bash
sqlite3 database.db
sqlite> SELECT * FROM games ORDER BY created_at DESC LIMIT 5;
# Should show recent games
```

[↑ Back to checklist](#quick-checklist)

---

<a name="user-profile"></a>
### ✓ User Profiles [MAJOR]

**What to check:** Complete user profile displays

**How to verify:**
1. Click on any username
2. Profile page should show:
   - Avatar
   - Username
   - Stats (wins/losses)
   - Match history
   - Friend status
   - Online status
   - (Optional) Bio, join date, achievements

**Pass criteria:**
- Profile page for each user
- All user info displayed
- Can view own profile
- Can view other users' profiles
- Profile updates when data changes

**Test:**
- Click own username → Own profile
- Click friend username → Friend's profile
- All data displays correctly

[↑ Back to checklist](#quick-checklist)

---

<a name="oauth-impl"></a>
### ✓ Module: OAuth 2.0 Implementation [MAJOR]

**What to check:** OAuth 2.0 authentication working

**How to verify:**

**Check login page:**
- Should see "Login with Google" or similar OAuth button

**Test OAuth flow:**
1. Click "Login with [Provider]"
2. Redirects to OAuth provider (Google, GitHub, etc.)
3. Authorize application
4. Redirects back to site
5. Logged in automatically

**Pass criteria:**
- OAuth button visible
- Redirects to correct provider
- Authorization works
- Returns to application
- User logged in
- Session created

**Check code:**
```bash
grep -r "oauth\|OAuth" backend/src/
grep -r "OAUTH_CLIENT_ID\|OAUTH_CLIENT_SECRET" .env
```

[↑ Back to checklist](#quick-checklist)

---

<a name="oauth-provider"></a>
### ✓ OAuth Provider Works

**What to check:** At least one OAuth provider functional

**Supported providers:**
- Google
- GitHub
- Facebook
- Microsoft
- 42 Intra
- Discord

**How to verify:**
1. Test login with provider
2. Complete authorization
3. Should create user account (or link existing)
4. Profile data fetched (name, email, avatar)

**Pass criteria:**
- At least 1 provider works
- Authorization completes
- User data retrieved
- Account created/linked
- Can log in repeatedly with OAuth

**Ask team:**
- "Which OAuth provider did you implement?"
- "Show me the OAuth configuration"

[↑ Back to checklist](#quick-checklist)

---

<a name="oauth-tokens"></a>
### ✓ OAuth Token Security

**What to check:** OAuth tokens handled securely

**How to verify:**

**Check .env file:**
```bash
cat .env | grep OAUTH
# Should see OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET
```

**Security checks:**
- Client secret NOT in frontend code
- Tokens not logged to console
- Tokens stored securely (encrypted or httpOnly cookies)
- No tokens in URLs
- State parameter used (CSRF protection)

**Check code:**
```bash
# Frontend should NOT have client secret
grep -r "OAUTH_CLIENT_SECRET" frontend/
# Should return nothing

# Backend should handle tokens
grep -r "access_token\|refresh_token" backend/src/
```

**Pass criteria:**
- Secrets in .env only
- Tokens handled server-side
- No token exposure in frontend
- CSRF protection implemented

[↑ Back to checklist](#quick-checklist)

---

<a name="oauth-data"></a>
### ✓ OAuth User Data Fetched

**What to check:** User information retrieved from OAuth provider

**How to verify:**
1. Log in with OAuth
2. Check profile
3. Should see data from provider:
   - Name
   - Email
   - Profile picture (optional)

**Pass criteria:**
- Name populated from OAuth
- Email retrieved correctly
- Avatar from OAuth (optional)
- Data saved to database
- Can update data later

**Test:**
- Log in with OAuth
- Check database:
```bash
sqlite3 database.db
sqlite> SELECT username, email, oauth_provider FROM users WHERE oauth_provider IS NOT NULL;
```

[↑ Back to checklist](#quick-checklist)

---

<a name="oauth-session"></a>
### ✓ OAuth Session Persists

**What to check:** OAuth login stays active

**How to verify:**
1. Log in with OAuth
2. Close browser tab
3. Reopen site
4. Should still be logged in

**Pass criteria:**
- Session persists after tab close
- Refresh doesn't log out
- Session timeout configured (e.g., 7 days)
- Can log out manually
- Refresh token used (optional)

**Check session storage:**
```bash
# Browser DevTools → Application
# Check Cookies or Local Storage for session token
```

[↑ Back to checklist](#quick-checklist)

---

[↑ Back to top](#table-of-contents)

<a name="part6-details"></a>
## 🎯 PART 6: GAMEPLAY MODULES - DETAILED STEPS

<a name="remote-two"></a>
### ✓ Module: Remote Players [MAJOR]

**What to check:** Two players on separate computers can play together

**How to verify:**
1. Open site on Computer A
2. Open site on Computer B (or use two browsers)
3. Create/join game room
4. Both players connect to same game
5. Play Pong remotely

**Pass criteria:**
- Remote multiplayer works
- Both players see same game
- Real-time synchronization
- Can invite specific players
- Game rooms/lobbies work

**Test:**
- Player A moves paddle → Player B sees it move
- Ball position syncs between both
- Score updates for both players
- Game ends properly for both

[↑ Back to checklist](#quick-checklist)

---

<a name="remote-sync"></a>
### ✓ Real-Time Synchronization

**What to check:** Game state syncs accurately between players

**How to verify:**

**Test synchronization:**
1. Start remote game
2. Watch ball position on both screens
3. Ball should be in same position (±small network delay)
4. Paddles should sync instantly

**Pass criteria:**
- Ball position identical on both clients
- Paddle movements sync < 100ms
- Score updates simultaneously
- No desync issues
- Server authoritative (server decides truth)

**Check WebSocket:**
```bash
# Browser DevTools → Network → WS
# Should see game state updates streaming
```

[↑ Back to checklist](#quick-checklist)

---

<a name="remote-lag"></a>
### ✓ Lag Handled in Remote Play

**What to check:** Network lag doesn't break remote gameplay

**How to verify:**
1. Start remote game
2. Simulate lag (browser throttling or tc command)
3. Game should continue functioning
4. Prediction/lag compensation visible

**Pass criteria:**
- Game playable with 100-200ms lag
- Paddle prediction smooths movement
- Ball doesn't teleport drastically
- Collision detection still works
- No game crashes

**Advanced (optional):**
- Client-side prediction
- Server reconciliation
- Interpolation between positions

[↑ Back to checklist](#quick-checklist)

---

<a name="remote-disconnect"></a>
### ✓ Remote Disconnect Handled

**What to check:** Player disconnect handled gracefully

**How to verify:**
1. Start remote game
2. One player closes browser/loses connection
3. Other player should see notification
4. Game ends or pauses

**Pass criteria:**
- Disconnect detected (< 5 seconds)
- Other player notified
- Game ends gracefully
- No server crash
- Can restart/rematch

[↑ Back to checklist](#quick-checklist)

---

<a name="remote-ws"></a>
### ✓ WebSocket for Remote Play

**What to check:** Real-time communication via WebSocket

**How to verify:**
```bash
# Browser DevTools → Network → WS filter
# Should see WebSocket connection
# URL should be wss:// (secure)
```

**Pass criteria:**
- WebSocket connection established
- Game data sent via WebSocket
- Low latency (< 50ms per message)
- Secure (WSS not WS)
- Reconnection on disconnect (optional)

[↑ Back to checklist](#quick-checklist)

---

<a name="multi-players"></a>
### ✓ Module: Multiplayer >2 Players [MAJOR]

**What to check:** Supports 3+ players simultaneously

**How to verify:**
1. Start game with 3+ players
2. Game board should accommodate multiple paddles
3. All players can play simultaneously

**Possible implementations:**
- **Square board:** 4 paddles (one per side)
- **Circular board:** Multiple paddles around circle
- **Multiple balls:** Each player has paddle

**Pass criteria:**
- 3+ players can join
- All players control paddles
- Game logic handles multiple players
- Scoring works for multiple players
- Fair gameplay

[↑ Back to checklist](#quick-checklist)

---

<a name="multi-scoring"></a>
### ✓ Multiplayer Scoring

**What to check:** Scoring adapts to multiple players

**How to verify:**
1. Play 4-player game
2. Ball exits on one side
3. That player loses point (or others gain point)
4. Score displays for all players

**Pass criteria:**
- Score tracked per player
- Clear winner determination
- Score displays for all players
- Fair point distribution
- Win condition clear (first to X points or last standing)

[↑ Back to checklist](#quick-checklist)

---

<a name="multi-board"></a>
### ✓ Square/Multi-Paddle Board

**What to check:** Game board supports multiple paddles

**How to verify:**
1. View game board with 4 players
2. Should see:
   - Paddle on top
   - Paddle on bottom
   - Paddle on left
   - Paddle on right
3. Ball bounces off all sides

**Pass criteria:**
- Board layout makes sense
- All paddles visible
- Ball physics work with all sides
- Controls assigned to each player
- No paddle overlap

[↑ Back to checklist](#quick-checklist)

---

<a name="multi-win"></a>
### ✓ Multi-Player Win Conditions

**What to check:** Clear victory conditions for 3+ players

**How to verify:**
1. Play multi-player game to completion
2. Game should end when:
   - One player reaches target score
   - Or: All but one player eliminated
   - Or: Time limit reached

**Pass criteria:**
- Win condition clearly defined
- Winner announced
- Game ends properly
- Final scores displayed
- Can start new game

[↑ Back to checklist](#quick-checklist)

---

<a name="game-second"></a>
### ✓ Module: Additional Game [MAJOR]

**What to check:** Second game besides Pong implemented

**Possible games:**
- Tic-Tac-Toe
- Connect Four
- Chess
- Snake
- Breakout
- Another arcade game

**How to verify:**
1. Navigate to games section
2. Should see second game option
3. Can start and play new game
4. Game has rules and win conditions

**Pass criteria:**
- Second game exists and works
- Complete game logic
- Playable by 2+ players
- Win/lose conditions
- Match history tracked
- Integrates with tournament system (optional)

**Ask team:** "Why did you choose this game?"

[↑ Back to checklist](#quick-checklist)

---

<a name="game-rules"></a>
### ✓ Second Game Rules Defined

**What to check:** Game has clear rules

**How to verify:**
1. Play the second game
2. Rules should be obvious or documented
3. Game behaves consistently

**Pass criteria:**
- Rules documented (in-game or README)
- Game behavior matches rules
- Win/loss conditions clear
- No ambiguity in gameplay
- Team can explain all rules

[↑ Back to checklist](#quick-checklist)

---

<a name="game-state"></a>
### ✓ Second Game State Tracked

**What to check:** Game state managed correctly

**How to verify:**
1. Play second game
2. Game should track:
   - Current player turn
   - Game board state
   - Score/progress
   - Timer (if applicable)

**Pass criteria:**
- Game state persists during play
- State syncs in multiplayer
- Can pause/resume (optional)
- State saved to database after game
- No state corruption

[↑ Back to checklist](#quick-checklist)

---

<a name="game-history"></a>
### ✓ Second Game History Recorded

**What to check:** Matches saved to history

**How to verify:**
1. Play second game to completion
2. Check match history
3. Should show second game matches
4. Includes: date, opponent, result, score

**Pass criteria:**
- Second game in match history
- Stats tracked separately (optional)
- Can view past games
- Data persists in database

**Check database:**
```bash
sqlite3 database.db
sqlite> SELECT * FROM games WHERE game_type='tictactoe';
# Or whatever the second game is
```

[↑ Back to checklist](#quick-checklist)

---

<a name="custom-powerup"></a>
### ✓ Module: Game Customization - Power-ups [MINOR]

**What to check:** Power-ups implemented (if module selected)

**Possible power-ups:**
- Speed boost (ball faster)
- Slow motion
- Paddle size change (bigger/smaller)
- Multi-ball
- Freeze opponent
- Shield

**How to verify:**
1. Start game with power-ups enabled
2. Power-ups should appear during game
3. Collect power-up
4. Effect activates

**Pass criteria:**
- At least 2-3 power-ups
- Power-ups spawn during game
- Visual indicators (icons, colors)
- Effects work as intended
- Time-limited effects
- Game remains balanced

[↑ Back to checklist](#quick-checklist)

---

<a name="custom-menu"></a>
### ✓ Customization Menu

**What to check:** UI to enable/configure customizations

**How to verify:**
1. Go to game settings
2. Should see customization options:
   - Enable/disable power-ups
   - Select game map
   - Choose attacks (if applicable)
   - Configure difficulty

**Pass criteria:**
- Customization menu exists
- Options clearly labeled
- Settings save correctly
- Settings apply to game
- Can reset to defaults

[↑ Back to checklist](#quick-checklist)

---

<a name="custom-balance"></a>
### ✓ Game Balance with Customizations

**What to check:** Customizations don't break game balance

**How to verify:**
1. Enable all customizations
2. Play several games
3. Game should still be fair and fun

**Pass criteria:**
- No overpowered combinations
- Both players have equal opportunities
- Skill still matters
- Game doesn't become unplayable
- Fun factor maintained

**Test edge cases:**
- All power-ups at once
- Maximum paddle size
- Minimum paddle size
- Fastest ball speed

[↑ Back to checklist](#quick-checklist)

---

[↑ Back to top](#table-of-contents)

<a name="part7-details"></a>
## 💬 PART 7: CHAT, AI & DASHBOARDS - DETAILED STEPS

<a name="chat-dm"></a>
### ✓ Module: Live Chat - Direct Messages [MAJOR]

**What to check:** Users can send direct messages

**How to verify:**
1. Log in as User A
2. Open chat interface
3. Select User B from user list
4. Send message: "Hello!"
5. User B should receive message

**Two-browser test:**
1. Open site in two browsers (A and B)
2. Log in as different users
3. User A sends message to User B
4. Message appears on User B's screen

**Pass criteria:**
- Chat interface exists
- Can select recipient
- Can type and send messages
- Messages deliver in real-time
- Message history preserved
- Timestamps shown

[↑ Back to checklist](#quick-checklist)

---

<a name="chat-history"></a>
### ✓ Message History

**What to check:** Chat history persists and loads

**How to verify:**
1. Send several messages to friend
2. Close browser
3. Reopen and log in
4. Open chat with same friend
5. Previous messages should load

**Pass criteria:**
- Chat history saved in database
- History loads when opening conversation
- Shows recent messages (e.g., last 50)
- Can scroll to load older messages (optional)
- Correct chronological order

**Check database:**
```bash
sqlite3 database.db
sqlite> SELECT * FROM messages WHERE sender_id=1 ORDER BY created_at DESC LIMIT 10;
# Should show message history
```

[↑ Back to checklist](#quick-checklist)

---

<a name="chat-block"></a>
### ✓ User Blocking [MAJOR]

**What to check:** Users can block others

**How to verify:**
1. Log in as User A
2. Block User B
3. User B should:
   - Not be able to message User A
   - Not see User A online
   - Not appear in User A's chat

**Pass criteria:**
- Block button/option exists
- Blocking is bidirectional (both can't contact)
- Blocked users can't send messages
- Block list manageable (can unblock)
- Persists in database

**Test:**
- User A blocks User B
- User B tries to message User A → Error or blocked
- User A doesn't see messages from User B

[↑ Back to checklist](#quick-checklist)

---

<a name="chat-invite"></a>
### ✓ Game Invites via Chat

**What to check:** Users can invite others to games through chat

**How to verify:**
1. Open chat with friend
2. Click "Invite to Game" button
3. Friend receives game invite in chat
4. Friend can accept/decline
5. If accepted, game starts

**Pass criteria:**
- Invite button in chat
- Invite notification appears for recipient
- Accept/Decline buttons work
- Accepting starts game
- Both players join same game room

[↑ Back to checklist](#quick-checklist)

---

<a name="chat-tournament"></a>
### ✓ Tournament Notifications

**What to check:** Tournament updates in chat

**How to verify:**
1. Join a tournament
2. Chat should show notifications:
   - "Tournament starting soon"
   - "Your match is next: You vs PlayerX"
   - "You won your match!"
   - "Tournament winner: PlayerY"

**Pass criteria:**
- Tournament notifications appear in chat
- Notifications clear and timely
- Can click notification to view details (optional)
- Doesn't spam chat
- Can mute notifications (optional)

[↑ Back to checklist](#quick-checklist)

---

<a name="chat-realtime"></a>
### ✓ Real-Time Message Delivery

**What to check:** Messages appear instantly

**How to verify:**
1. Open two browsers side-by-side
2. Send message from Browser A
3. Should appear in Browser B within 1 second

**Pass criteria:**
- Messages appear < 1 second
- Uses WebSocket for real-time
- No polling delays
- Typing indicators (optional)
- Read receipts (optional)

**Check implementation:**
```bash
grep -r "chat\|message" backend/src/ | grep -i "websocket\|socket"
# Should use WebSocket for chat
```

[↑ Back to checklist](#quick-checklist)

---

<a name="ai-func"></a>
### ✓ Module: AI Opponent - Functional [MAJOR]

**What to check:** AI opponent works and plays game

**How to verify:**
1. Start game against AI
2. AI should:
   - Control paddle automatically
   - Move to intercept ball
   - Attempt to win
   - Provide challenge

**Pass criteria:**
- AI game mode available
- AI moves autonomously
- AI responds to ball position
- AI provides reasonable challenge
- No cheating (follows same rules as players)

**Test difficulty:**
- AI should be beatable by skilled player
- AI should beat beginner players sometimes
- AI makes occasional mistakes (not perfect)

[↑ Back to checklist](#quick-checklist)

---

<a name="ai-keyboard"></a>
### ✓ AI Simulates Keyboard Input

**What to check:** AI uses keyboard simulation (not perfect knowledge)

**Requirement:** AI must simulate actual keyboard presses, not directly control paddle

**How to verify:**

**Ask team:**
- "How does the AI control the paddle?"
- "Does AI use keyboard simulation?"

**Check code:**
```bash
grep -r "AI\|bot" backend/src/services/
# Look for keyboard event simulation
# Should NOT directly set paddle.y position
```

**Pass criteria:**
- AI sends keyboard events (UP/DOWN keys)
- AI doesn't have perfect knowledge
- AI follows same input constraints as players
- Team can explain implementation

**Fail criteria:**
- AI directly modifies paddle position
- AI has perfect ball tracking
- AI teleports paddle instantly

[↑ Back to checklist](#quick-checklist)

---

<a name="ai-refresh"></a>
### ✓ AI Updates ~Once Per Second

**What to check:** AI decision-making rate limited

**Requirement:** AI can only update view/decisions approximately once per second

**How to verify:**

**Ask team:**
- "How often does AI update?"
- "Show me the AI update rate in code"

**Check code:**
```bash
grep -r "setInterval\|setTimeout" backend/src/services/AI
# Should see ~1000ms interval
```

**Pass criteria:**
- AI updates at reasonable intervals (~1 second)
- Not instantaneous reactions
- Creates realistic gameplay
- Team can demonstrate rate limiting

**Example expected code:**
```javascript
setInterval(() => {
  ai.makeDecision();
}, 1000); // 1 second
```

[↑ Back to checklist](#quick-checklist)

---

<a name="ai-speed"></a>
### ✓ AI Same Speed as Players

**What to check:** AI paddle moves at identical speed

**How to verify:**
1. Start AI game
2. Watch AI paddle movement
3. Compare to player paddle speed
4. Should be identical

**Test:**
- AI paddle shouldn't move faster than player
- Ball shouldn't favor AI with speed advantage
- Same acceleration/deceleration

**Pass criteria:**
- AI paddle speed = Player paddle speed
- No speed hacks for AI
- Fair gameplay
- AI wins by skill/logic, not speed

[↑ Back to checklist](#quick-checklist)

---

<a name="ai-no-astar"></a>
### ✓ AI Doesn't Use A* Algorithm

**Requirement:** A* pathfinding algorithm prohibited for AI

**How to verify:**

**Check code:**
```bash
grep -r "astar\|A\*\|a-star\|aStar" backend/src/
# Should return nothing or only comments
```

**Ask team:**
- "What algorithm does your AI use?"
- "Why not A*?"

**Pass criteria:**
- No A* pathfinding in code
- Team uses alternative (simple prediction, heuristics, etc.)
- Team can explain AI algorithm

**Acceptable AI methods:**
- Simple ball position tracking
- Velocity prediction
- Fuzzy logic
- Simple neural network
- Rule-based decisions

[↑ Back to checklist](#quick-checklist)

---

<a name="dash-stats"></a>
### ✓ Module: User Dashboard [MINOR]

**What to check:** User statistics dashboard exists

**How to verify:**
1. Navigate to dashboard/statistics page
2. Should display:
   - Total games played
   - Win/loss record
   - Win percentage
   - Recent matches
   - Performance graphs (optional)
   - Rankings/leaderboard (optional)

**Pass criteria:**
- Dashboard page exists
- Displays user statistics
- Data is accurate
- Visually organized
- Updates after games

[↑ Back to checklist](#quick-checklist)

---

<a name="dash-charts"></a>
### ✓ Charts and Graphs

**What to check:** Data visualized with charts

**How to verify:**
1. View dashboard
2. Should see visualizations:
   - Win/loss pie chart
   - Performance over time (line graph)
   - Stats comparison (bar chart)

**Pass criteria:**
- At least 1-2 charts/graphs
- Charts display accurate data
- Visual and easy to read
- Uses charting library (Chart.js, D3.js, etc.)
- Responsive on mobile

**Check code:**
```bash
grep -r "chart\|Chart\.js\|d3\|recharts" frontend/src/
# Should find charting library
```

[↑ Back to checklist](#quick-checklist)

---

<a name="dash-realtime"></a>
### ✓ Dashboard Real-Time Updates

**What to check:** Dashboard updates automatically

**How to verify:**
1. Open dashboard
2. Play a game (in another tab or browser)
3. Return to dashboard
4. Stats should update automatically (or after refresh)

**Pass criteria:**
- Stats refresh automatically (WebSocket) or on page load
- No stale data
- Updates after completing games
- Real-time or near real-time

**Advanced (optional):**
- Live updating without refresh
- WebSocket pushes updates
- Animations on stat changes

[↑ Back to checklist](#quick-checklist)

---

[↑ Back to top](#table-of-contents)

<a name="part8-details"></a>
## 🔐 PART 8: CYBERSECURITY MODULES - DETAILED STEPS

<a name="waf-impl"></a>
### ✓ Module: WAF & Vault - Web Application Firewall [MAJOR]

**What to check:** ModSecurity or similar WAF implemented

**How to verify:**

**Check docker-compose.yml:**
```bash
cat docker-compose.yml | grep -i "modsecurity\|waf"
# Should see WAF container or integration
```

**Check running containers:**
```bash
docker ps | grep -i "modsecurity\|waf\|nginx"
# Should see WAF container
```

**Ask team:**
- "Which WAF are you using?"
- "Show me WAF configuration"
- "How does WAF protect the application?"

**Pass criteria:**
- ModSecurity or equivalent WAF running
- WAF integrated with web server
- Security rules configured
- WAF logs accessible
- Team can demonstrate protection

[↑ Back to checklist](#quick-checklist)

---

<a name="vault-impl"></a>
### ✓ HashiCorp Vault Implementation

**What to check:** HashiCorp Vault used for secrets management

**How to verify:**

**Check docker-compose.yml:**
```bash
cat docker-compose.yml | grep -i vault
# Should have Vault service
```

**Check Vault is running:**
```bash
docker ps | grep vault
# Vault container should be up
```

**Test Vault access:**
```bash
docker exec -it <vault_container> vault status
# Should show Vault status
```

**Pass criteria:**
- HashiCorp Vault container running
- Secrets stored in Vault (not .env)
- Application retrieves secrets from Vault
- Vault sealed/unsealed properly
- Team can demonstrate usage

**Ask team:**
- "Show me how you use Vault"
- "Where are secrets stored?"
- "How does backend access Vault?"

[↑ Back to checklist](#quick-checklist)

---

<a name="vault-secrets"></a>
### ✓ Secrets in Vault [MAJOR]

**What to check:** Sensitive data stored in Vault

**How to verify:**

**Ask team to demonstrate:**
1. Show Vault secrets path
2. Retrieve secret from Vault
3. Show backend code fetching from Vault

**Check code:**
```bash
grep -r "vault\|Vault" backend/src/
# Should see Vault client usage
```

**Pass criteria:**
- Database credentials in Vault
- API keys in Vault
- OAuth secrets in Vault
- JWT secret in Vault
- Backend retrieves secrets from Vault
- No hardcoded secrets

**Example expected code:**
```javascript
const vaultClient = require('node-vault')();
const secret = await vaultClient.read('secret/data/database');
const dbPassword = secret.data.password;
```

[↑ Back to checklist](#quick-checklist)

---

<a name="gdpr-anon"></a>
### ✓ Module: GDPR Compliance - Data Anonymization [MINOR]

**What to check:** User data can be anonymized

**How to verify:**

**Ask team:**
- "Show me data anonymization feature"
- "How do you anonymize user data?"

**Test:**
1. Find anonymization option in settings
2. Or: Request anonymization from team
3. User data should be anonymized (not deleted)

**Pass criteria:**
- Anonymization feature exists
- Personal data replaced with generic values
- Username → "User_12345" or similar
- Email → Removed or anonymized
- History preserved (for stats) but anonymous
- Irreversible anonymization

**Check database:**
```bash
sqlite3 database.db
sqlite> SELECT * FROM users WHERE anonymized=1;
# Should show anonymized users
```

[↑ Back to checklist](#quick-checklist)

---

<a name="gdpr-delete"></a>
### ✓ Account Deletion

**What to check:** Users can request account deletion

**How to verify:**
1. Log in to account
2. Navigate to settings
3. Find "Delete Account" option
4. Request deletion
5. Account should be deleted (or marked for deletion)

**Pass criteria:**
- Delete account option exists
- Confirmation required (to prevent accidents)
- User data removed from database
- Or: Data anonymized per GDPR
- User cannot log in after deletion
- Related data handled (messages, games, etc.)

**GDPR note:** Can anonymize instead of full delete to preserve stats

[↑ Back to checklist](#quick-checklist)

---

<a name="gdpr-export"></a>
### ✓ Data Export

**What to check:** Users can export their data

**How to verify:**
1. Log in to account
2. Find "Export Data" or "Download My Data"
3. Request data export
4. Should receive file (JSON, CSV, or ZIP)

**Pass criteria:**
- Data export feature exists
- Exports all user data:
  - Profile info
  - Match history
  - Messages (optional)
  - Stats
- Format readable (JSON or CSV)
- Download completes successfully

**Example export format:**
```json
{
  "username": "player1",
  "email": "player1@example.com",
  "games_played": 42,
  "wins": 25,
  "losses": 17,
  "match_history": [...]
}
```

[↑ Back to checklist](#quick-checklist)

---

<a name="twofa-enabled"></a>
### ✓ Module: 2FA & JWT - Two-Factor Authentication [MAJOR]

**What to check:** 2FA implemented and working

**How to verify:**
1. Go to account settings
2. Find "Enable 2FA" option
3. Enable 2FA
4. Should show QR code or setup method
5. Scan with authenticator app (Google Authenticator, Authy)
6. Enter verification code
7. 2FA enabled

**Pass criteria:**
- 2FA option in settings
- QR code generated
- Compatible with standard TOTP apps
- Backup codes provided
- 2FA required on next login

[↑ Back to checklist](#quick-checklist)

---

<a name="twofa-method"></a>
### ✓ 2FA Method Works

**What to check:** 2FA verification functional

**Supported methods:**
- **TOTP** (Time-based One-Time Password) - Most common
- SMS (less secure, optional)
- Email (less secure, optional)

**How to verify:**
1. Enable 2FA
2. Log out
3. Log in with username/password
4. Should prompt for 2FA code
5. Enter code from authenticator app
6. Should log in successfully

**Pass criteria:**
- 2FA prompt appears after password
- Accepts valid codes
- Rejects invalid codes
- Codes expire after ~30 seconds
- Can use backup codes

**Check code:**
```bash
grep -r "totp\|2fa\|two.factor\|speakeasy\|otplib" backend/src/
# Should find 2FA library usage
```

[↑ Back to checklist](#quick-checklist)

---

<a name="jwt-impl"></a>
### ✓ JWT Implementation [MAJOR]

**What to check:** JSON Web Tokens used for session management

**How to verify:**

**Check dependencies:**
```bash
cat backend/package.json | grep jwt
# Should show: "jsonwebtoken" or similar
```

**Check code:**
```bash
grep -r "jwt\|JWT\|jsonwebtoken" backend/src/
# Should find JWT usage
```

**Browser check:**
1. Log in
2. Open DevTools → Application → Cookies/Local Storage
3. Should see JWT token stored

**Pass criteria:**
- JWT library in dependencies
- Tokens issued on login
- Tokens stored securely (httpOnly cookies or localStorage)
- Backend validates tokens on requests

[↑ Back to checklist](#quick-checklist)

---

<a name="jwt-sign"></a>
### ✓ JWT Properly Signed

**What to check:** JWTs signed with secret key

**How to verify:**

**Check .env:**
```bash
cat .env | grep JWT_SECRET
# Should have JWT secret defined
```

**Ask team:**
- "How do you sign JWTs?"
- "Where is JWT secret stored?"

**Check code:**
```bash
grep -r "jwt.sign\|sign(" backend/src/
# Should see JWT signing with secret
```

**Pass criteria:**
- JWT secret in .env
- JWTs signed with secret
- Secret never exposed to frontend
- Secret sufficiently random/long

**Example expected code:**
```javascript
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
  expiresIn: '7d'
});
```

[↑ Back to checklist](#quick-checklist)

---

<a name="jwt-validate"></a>
### ✓ JWT Validation

**What to check:** Server validates JWT tokens

**How to verify:**

**Check code:**
```bash
grep -r "jwt.verify\|verify(" backend/src/
# Should see JWT verification
```

**Test invalid token:**
1. Get JWT token from login
2. Modify token slightly
3. Try to make authenticated request
4. Should get 401 Unauthorized

**Pass criteria:**
- All protected routes validate JWT
- Invalid tokens rejected
- Expired tokens rejected
- Signature verified
- Proper error responses

**Example expected code:**
```javascript
jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  if (err) return res.status(401).send('Invalid token');
  req.userId = decoded.userId;
  next();
});
```

[↑ Back to checklist](#quick-checklist)

---

<a name="jwt-expire"></a>
### ✓ Token Expiry

**What to check:** JWT tokens have expiration time

**How to verify:**

**Check code:**
```bash
grep -r "expiresIn\|exp:" backend/src/
# Should see token expiration setting
```

**Ask team:**
- "How long are tokens valid?"
- "What happens when token expires?"

**Pass criteria:**
- Tokens have expiration (e.g., 7 days)
- Expired tokens rejected
- User must re-login after expiry
- Expiration time reasonable (not years)

**Test expiry (if time permits):**
1. Generate token with short expiry (1 minute)
2. Wait for expiry
3. Try to use token
4. Should fail

[↑ Back to checklist](#quick-checklist)

---

[↑ Back to top](#table-of-contents)

<a name="part9-details"></a>
## ⚙️ PART 9: DEVOPS MODULES - DETAILED STEPS

<a name="elk-elastic"></a>
### ✓ Module: ELK Stack - Elasticsearch [MAJOR]

**What to check:** Elasticsearch deployed and running

**How to verify:**

**Check docker-compose.yml:**
```bash
cat docker-compose.yml | grep -i elasticsearch
# Should have Elasticsearch service
```

**Check container:**
```bash
docker ps | grep elasticsearch
# Should be running
```

**Test Elasticsearch:**
```bash
curl http://localhost:9200
# Should return cluster info
```

**Pass criteria:**
- Elasticsearch container running
- Accessible on configured port
- Cluster healthy
- Can store/retrieve data
- Team can demonstrate usage

[↑ Back to checklist](#quick-checklist)

---

<a name="elk-logstash"></a>
### ✓ Logstash Running

**What to check:** Logstash parses and ships logs

**How to verify:**

**Check container:**
```bash
docker ps | grep logstash
docker logs <logstash_container>
```

**Check configuration:**
```bash
find . -name "logstash.conf" -o -name "*.conf" | grep logstash
cat path/to/logstash.conf
```

**Pass criteria:**
- Logstash container running
- Configuration file exists
- Parses application logs
- Sends logs to Elasticsearch
- No pipeline errors

**Ask team:**
- "Show me Logstash configuration"
- "Which logs are being collected?"

[↑ Back to checklist](#quick-checklist)

---

<a name="elk-kibana"></a>
### ✓ Kibana Running

**What to check:** Kibana dashboard accessible

**How to verify:**

**Check container:**
```bash
docker ps | grep kibana
```

**Access Kibana:**
1. Open browser: `http://localhost:5601`
2. Kibana dashboard should load
3. Should connect to Elasticsearch

**Pass criteria:**
- Kibana container running
- Web interface accessible
- Connected to Elasticsearch
- Can view logs
- Dashboards configured (optional)

[↑ Back to checklist](#quick-checklist)

---

<a name="elk-logs"></a>
### ✓ Logs Collected

**What to check:** Application logs flow to ELK stack

**How to verify:**
1. Open Kibana: `http://localhost:5601`
2. Go to Discover section
3. Should see application logs
4. Perform action (login, play game)
5. New logs should appear

**Pass criteria:**
- Backend logs collected
- Frontend logs collected (optional)
- Logs searchable in Kibana
- Log format structured
- Timestamps correct
- Log levels present (info, warn, error)

**Check log entry:**
- Should include: timestamp, level, message, source

[↑ Back to checklist](#quick-checklist)

---

<a name="monitor-prom"></a>
### ✓ Module: Monitoring - Prometheus [MINOR]

**What to check:** Prometheus deployed for metrics

**How to verify:**

**Check docker-compose.yml:**
```bash
cat docker-compose.yml | grep -i prometheus
```

**Check container:**
```bash
docker ps | grep prometheus
```

**Access Prometheus:**
```bash
curl http://localhost:9090
# Or open in browser
```

**Pass criteria:**
- Prometheus container running
- Web interface accessible
- Scraping metrics from application
- Targets configured
- Metrics being collected

[↑ Back to checklist](#quick-checklist)

---

<a name="monitor-grafana"></a>
### ✓ Grafana Dashboards

**What to check:** Grafana visualizes metrics

**How to verify:**

**Check container:**
```bash
docker ps | grep grafana
```

**Access Grafana:**
1. Open: `http://localhost:3001` (or configured port)
2. Login (default: admin/admin)
3. Should see dashboards

**Pass criteria:**
- Grafana container running
- Connected to Prometheus
- At least 1 dashboard created
- Displays application metrics
- Graphs update in real-time

**Expected metrics:**
- Request rate
- Response time
- Error rate
- Active users
- Game sessions

[↑ Back to checklist](#quick-checklist)

---

<a name="monitor-alerts"></a>
### ✓ Alerts Configured

**What to check:** Alert rules defined

**How to verify:**

**Check Prometheus alerts:**
1. Open Prometheus: `http://localhost:9090/alerts`
2. Should see alert rules

**Or check configuration:**
```bash
find . -name "alert*.yml" -o -name "prometheus.yml"
cat path/to/alerts.yml
```

**Pass criteria:**
- Alert rules configured
- Alerts for critical metrics:
  - High error rate
  - Service down
  - High memory usage
- Alerts can fire (test if possible)
- Notification channels configured (optional)

[↑ Back to checklist](#quick-checklist)

---

<a name="micro-independent"></a>
### ✓ Module: Microservices - Services Independent [MAJOR]

**What to check:** Services loosely coupled

**How to verify:**

**Check architecture:**
```bash
cat docker-compose.yml
# Should see multiple independent services
```

**Test independence:**
1. Stop one service: `docker stop <service>`
2. Other services should continue running
3. Restart service: `docker start <service>`
4. Should reconnect automatically

**Pass criteria:**
- Multiple services (3+)
- Each service in separate container
- Services don't directly depend on each other
- Can restart services independently
- Failures isolated

**Expected services:**
- Frontend
- Backend/API
- Game server
- Chat service
- Database
- etc.

[↑ Back to checklist](#quick-checklist)

---

<a name="micro-discovery"></a>
### ✓ Service Discovery [MAJOR]

**What to check:** Services can discover each other

**How to verify:**

**Ask team:**
- "How do services find each other?"
- "Do you use service discovery?"

**Check methods:**
- Docker DNS (service names in docker-compose)
- Consul/Eureka (advanced)
- Environment variables
- API Gateway

**Pass criteria:**
- Services communicate via service names (not hardcoded IPs)
- Dynamic service discovery (advanced) or DNS-based
- Services can connect after restart
- Configuration managed centrally

**Example:**
```javascript
// Good: Uses service name
fetch('http://backend:3000/api/users')

// Bad: Hardcoded IP
fetch('http://192.168.1.100:3000/api/users')
```

[↑ Back to checklist](#quick-checklist)

---

<a name="micro-gateway"></a>
### ✓ API Gateway [MAJOR]

**What to check:** API Gateway routes requests

**How to verify:**

**Check docker-compose.yml:**
```bash
cat docker-compose.yml | grep -i "gateway\|nginx\|traefik"
# Should have gateway service
```

**Test routing:**
1. Make request to gateway
2. Gateway should route to correct service
3. No direct service access from frontend

**Pass criteria:**
- API Gateway service exists
- Routes requests to backend services
- Single entry point for API
- Load balancing (optional)
- Authentication at gateway (optional)

**Common gateways:**
- Nginx
- Traefik
- Kong
- Custom Node.js gateway

[↑ Back to checklist](#quick-checklist)

---

[↑ Back to top](#table-of-contents)

<a name="part10-details"></a>
## 🎨 PART 10: GRAPHICS & ACCESSIBILITY - DETAILED STEPS

<a name="graphics-babylon"></a>
### ✓ Module: 3D Graphics - Babylon.js [MAJOR]

**What to check:** Uses Babylon.js for 3D rendering

**How to verify:**

**Check dependencies:**
```bash
cat frontend/package.json | grep babylon
# Should show: "@babylonjs/core" or similar
```

**Check code:**
```bash
grep -r "babylon\|Babylon\|BABYLON" frontend/src/
# Should find Babylon.js imports
```

**Visual check:**
1. Navigate to 3D game
2. Should see 3D rendered environment
3. Not 2D canvas

**Pass criteria:**
- Babylon.js in dependencies
- 3D Pong game renders in 3D
- Uses Babylon.js engine
- Team can explain 3D implementation

[↑ Back to checklist](#quick-checklist)

---

<a name="graphics-3d"></a>
### ✓ 3D Pong Game [MAJOR]

**What to check:** Pong rendered in 3D environment

**How to verify:**
1. Start 3D Pong game
2. Should see:
   - 3D paddles (with depth)
   - 3D ball (sphere)
   - 3D playing field
   - Camera perspective

**Pass criteria:**
- Game uses 3D models (not 2D sprites)
- Perspective camera view
- 3D environment visible
- Game playable in 3D
- All Pong rules still apply

**Test:**
- Rotate camera (if possible)
- Observe depth/perspective
- Paddles and ball have 3D geometry

[↑ Back to checklist](#quick-checklist)

---

<a name="graphics-advanced"></a>
### ✓ Advanced 3D Techniques [MAJOR]

**What to check:** Uses lighting, textures, materials

**How to verify:**

**Visual inspection:**
1. Play 3D game
2. Look for:
   - Lighting effects (shadows, highlights)
   - Textures on surfaces
   - Materials (shiny, matte, etc.)
   - Shadows (optional)

**Ask team:**
- "What 3D techniques did you implement?"
- "Show me lighting setup"
- "What materials are used?"

**Pass criteria:**
- At least basic lighting
- Textures or materials applied
- 3D scene looks polished
- Not just basic colored shapes

[↑ Back to checklist](#quick-checklist)

---

<a name="graphics-perf"></a>
### ✓ 3D Performance [MAJOR]

**What to check:** 3D rendering performs smoothly

**How to verify:**
1. Play 3D game
2. Check FPS (frames per second)
3. Should be 30+ FPS minimum, preferably 60 FPS

**Pass criteria:**
- Smooth rendering (no stuttering)
- Consistent frame rate
- No lag during gameplay
- Loads in reasonable time
- Works on mid-range hardware

**Browser check:**
- Press F12 → Performance tab
- Record while playing
- Check FPS metrics

[↑ Back to checklist](#quick-checklist)

---

<a name="responsive-desktop"></a>
### ✓ Module: Responsive Design - Desktop [MINOR]

**What to check:** Works on desktop screens

**How to verify:**
1. Open site on desktop browser
2. Test various resolutions:
   - 1920x1080 (Full HD)
   - 1366x768 (common laptop)
   - 2560x1440 (2K)

**Pass criteria:**
- Layout works on all desktop sizes
- No broken elements
- Content readable
- No excessive scrolling
- UI elements accessible

[↑ Back to checklist](#quick-checklist)

---

<a name="responsive-mobile"></a>
### ✓ Mobile Responsive [MINOR]

**What to check:** Works on mobile devices

**How to verify:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test mobile sizes:
   - iPhone (375x667)
   - Android (360x640)
   - iPad (768x1024)

**Pass criteria:**
- Layout adapts to mobile
- No horizontal scrolling
- Text readable (not too small)
- Buttons large enough to tap
- Menu accessible (hamburger menu, etc.)

[↑ Back to checklist](#quick-checklist)

---

<a name="responsive-touch"></a>
### ✓ Touch Input [MINOR]

**What to check:** Touch controls work on mobile

**How to verify:**
1. Use mobile device or touch simulation
2. Test:
   - Tap buttons
   - Swipe/scroll
   - Game controls on touch screen

**Pass criteria:**
- Touch events work
- Buttons respond to taps
- Game playable with touch (if applicable)
- No need for mouse
- Touch targets large enough (44x44px minimum)

[↑ Back to checklist](#quick-checklist)

---

<a name="browser-firefox"></a>
### ✓ Module: Browser Compatibility - Firefox [MINOR]

**What to check:** Works on latest Firefox

**Requirement:** Firefox support is MANDATORY

**How to verify:**
1. Open site in latest stable Firefox
2. Test all features
3. Should work without issues

**Pass criteria:**
- Site loads in Firefox
- All features functional
- No console errors specific to Firefox
- Layout correct
- Game playable

[↑ Back to checklist](#quick-checklist)

---

<a name="browser-second"></a>
### ✓ Second Browser Support [MINOR]

**What to check:** Works on one additional browser

**Supported browsers:**
- Chrome/Chromium
- Safari
- Edge
- Other modern browser

**How to verify:**
1. Open site in second browser
2. Test core features
3. Should work correctly

**Pass criteria:**
- Site functional in second browser
- Major features work
- Acceptable to have minor visual differences
- No critical bugs

**Ask team:** "Which browsers did you test?"

[↑ Back to checklist](#quick-checklist)

---

<a name="lang-switcher"></a>
### ✓ Module: Multi-Language - Language Switcher [MINOR]

**What to check:** Can switch between languages

**How to verify:**
1. Find language selector (usually top-right, flags or dropdown)
2. Click to change language
3. Site text should change
4. Preference should persist

**Pass criteria:**
- Language switcher visible
- Easy to find and use
- Changes take effect immediately
- Selection saved (cookie/localStorage)

[↑ Back to checklist](#quick-checklist)

---

<a name="lang-three"></a>
### ✓ Three Languages Supported [MINOR]

**What to check:** At least 3 languages available

**Common combinations:**
- English, French, Spanish
- English, German, Japanese
- Any 3 languages

**How to verify:**
1. Open language selector
2. Should see at least 3 options
3. Switch between all 3
4. All should work

**Pass criteria:**
- Minimum 3 languages
- All text translated
- No untranslated strings
- Language names clear

[↑ Back to checklist](#quick-checklist)

---

<a name="lang-translate"></a>
### ✓ Translations Complete [MINOR]

**What to check:** All text properly translated

**How to verify:**
1. Switch to non-English language
2. Navigate entire site
3. All text should be translated

**Pass criteria:**
- UI elements translated
- Buttons translated
- Error messages translated
- Help text translated
- No English fallbacks (except proper nouns)

**Check coverage:**
- Homepage
- Game interface
- Settings
- Profile pages
- Error messages

[↑ Back to checklist](#quick-checklist)

---

<a name="access-screen"></a>
### ✓ Module: Accessibility - Screen Reader [MINOR]

**What to check:** Screen reader compatible

**How to verify:**

**Check HTML:**
```bash
curl http://localhost | grep -i "aria\|role\|alt"
# Should see ARIA labels and semantic HTML
```

**Ask team:**
- "Did you test with screen reader?"
- "Show me ARIA labels"

**Pass criteria:**
- ARIA labels on interactive elements
- Semantic HTML (nav, main, article)
- Images have alt text
- Form inputs have labels
- Keyboard navigable

[↑ Back to checklist](#quick-checklist)

---

<a name="access-alt"></a>
### ✓ Alt Text on Images [MINOR]

**What to check:** All images have descriptive alt text

**How to verify:**

**Inspect page:**
1. Right-click images → Inspect
2. Check for `alt` attribute
3. Alt text should describe image

**Check code:**
```bash
grep -r "<img" frontend/src/ | head -20
# All should have alt="..."
```

**Pass criteria:**
- All `<img>` tags have `alt` attribute
- Alt text descriptive (not just "image")
- Decorative images: `alt=""`
- Informative images: meaningful alt text

[↑ Back to checklist](#quick-checklist)

---

<a name="access-keyboard"></a>
### ✓ Keyboard Navigation [MINOR]

**What to check:** Full keyboard navigation possible

**How to verify:**
1. Load site
2. Try navigating with TAB key only
3. Should be able to:
   - Navigate menus
   - Click buttons (ENTER)
   - Fill forms
   - Play game (if keyboard controls)

**Pass criteria:**
- All interactive elements reachable via Tab
- Focus indicators visible
- Tab order logical
- Can activate buttons with Enter/Space
- Can close modals with Escape

**Test:**
- Tab through entire page
- No focus traps
- Can reach all features

[↑ Back to checklist](#quick-checklist)

---

<a name="access-contrast"></a>
### ✓ High Contrast Mode [MINOR]

**What to check:** High contrast option available

**How to verify:**
1. Check settings for contrast/theme toggle
2. Or: Built-in high contrast mode
3. Switch to high contrast
4. Text should be more visible

**Pass criteria:**
- High contrast option exists
- Significant contrast improvement
- All text readable
- WCAG AA compliance (4.5:1 ratio minimum)

**Tools to check:**
- Browser DevTools → Lighthouse → Accessibility
- WebAIM Contrast Checker

[↑ Back to checklist](#quick-checklist)

---

<a name="ssr-impl"></a>
### ✓ Module: Server-Side Rendering [MINOR]

**What to check:** Pages rendered on server first

**How to verify:**

**View page source:**
1. Right-click page → "View Page Source"
2. Should see actual HTML content (not just empty div)
3. Not just: `<div id="root"></div>`

**Check for SSR:**
```bash
curl http://localhost | grep -i "<h1>\|<title>"
# Should see actual content in HTML
```

**Pass criteria:**
- HTML content in page source
- Not purely client-side rendered
- Initial page load shows content
- SEO-friendly
- Faster perceived load time

**Ask team:** "Did you implement SSR? How?"

[↑ Back to checklist](#quick-checklist)

---

<a name="ssr-seo"></a>
### ✓ SEO Friendly [MINOR]

**What to check:** Pages optimized for search engines

**How to verify:**

**Check meta tags:**
```bash
curl http://localhost | grep -i "<meta\|<title>"
```

**Should see:**
- `<title>` tag with descriptive title
- Meta description
- Open Graph tags (optional)
- Proper heading structure (H1, H2, H3)

**Pass criteria:**
- Title tags on all pages
- Meta descriptions
- Semantic HTML structure
- Content accessible to crawlers

[↑ Back to checklist](#quick-checklist)

---

<a name="ssr-hydration"></a>
### ✓ Hydration Works [MINOR]

**What to check:** Client-side JavaScript enhances SSR content

**How to verify:**
1. Load page (SSR content visible immediately)
2. JavaScript loads and "hydrates"
3. Interactive features become active
4. No content flash/reload

**Pass criteria:**
- SSR content displays first
- JavaScript enhances without re-render
- Smooth transition from SSR to interactive
- No hydration errors in console

**Check console:**
- Should NOT see hydration mismatch warnings
- Content should match between server and client

[↑ Back to checklist](#quick-checklist)

---

[↑ Back to top](#table-of-contents)

<a name="part11-details"></a>
## 🎮 PART 11: SERVER-SIDE PONG - DETAILED STEPS

<a name="server-logic"></a>
### ✓ Module: Server-Side Pong - Game Logic on Server [MAJOR]

**What to check:** Pong game runs on server backend

**How to verify:**

**Check code structure:**
```bash
ls -la backend/src/services/ | grep -i "game\|pong"
# Should see game-related files

grep -r "gameLoop\|updateGame\|ballPosition" backend/src/
# Should find server-side game logic
```

**Ask team:**
- "Where is the game logic implemented?"
- "Show me server-side game code"
- "How does server calculate ball position?"

**Pass criteria:**
- Game logic in backend code (not just frontend)
- Server calculates physics
- Server is authoritative
- Clients receive updates from server

[↑ Back to checklist](#quick-checklist)

---

<a name="server-physics"></a>
### ✓ Ball Physics on Server [MAJOR]

**What to check:** Ball movement calculated server-side

**How to verify:**

**Code inspection:**
```bash
grep -r "ball.*velocity\|ball.*speed\|ball.*physics" backend/src/
# Should find ball physics calculations
```

**Test:**
1. Start game
2. Open browser DevTools → Network tab
3. Should see WebSocket messages with ball position updates from server

**Pass criteria:**
- Server calculates ball trajectory
- Ball physics not dependent on client
- Position updates sent to clients
- Consistent physics across all clients

**Ask team:** "Show me ball physics code on server"

[↑ Back to checklist](#quick-checklist)

---

<a name="server-api"></a>
### ✓ API Endpoints for Game [MAJOR]

**What to check:** REST or WebSocket API for game control

**How to verify:**

**Check routes:**
```bash
grep -r "game.*route\|/game" backend/src/api/
# Should find game endpoints

cat backend/src/api/tournament.ts | grep "app\.\|fastify\."
# Check for game-related routes
```

**Test endpoints:**
```bash
# Example checks (adjust to their API)
curl http://localhost:3000/api/game/status
curl http://localhost:3000/api/game/start -X POST
```

**Pass criteria:**
- API endpoints for game actions
- Start game, stop game, get status
- WebSocket connection for real-time updates
- Proper error handling

[↑ Back to checklist](#quick-checklist)

---

<a name="server-sync"></a>
### ✓ Client-Server Synchronization [MAJOR]

**What to check:** Game state synchronized between server and clients

**How to verify:**

**Test with two players:**
1. Open game in two browser windows
2. Play game
3. Both should see same ball position
4. No desync issues

**Network inspection:**
```bash
# In browser DevTools → Network → WS tab
# Watch for game state messages
# Should see frequent position updates
```

**Pass criteria:**
- Both clients show same game state
- Minimal lag (< 100ms acceptable)
- No position jumps or glitches
- Server is source of truth

**Red flags:**
- Different ball positions on each client
- Clients can manipulate game state
- No server validation

[↑ Back to checklist](#quick-checklist)

---

<a name="server-cheat"></a>
### ✓ Server-Side Validation

**What to check:** Server validates all game moves

**How to verify:**

**Ask team:**
- "How do you prevent cheating?"
- "Does server validate paddle movements?"
- "Can client manipulate ball position?"

**Try to cheat:**
1. Open browser console during game
2. Try to modify game variables
3. Should not affect actual game state

**Pass criteria:**
- Server validates all moves
- Client cannot set own score
- Client cannot move ball directly
- Paddle speed limits enforced by server

[↑ Back to checklist](#quick-checklist)

---

<a name="cli-pong"></a>
### ✓ CLI Pong Application [MAJOR]

**What to check:** Command-line Pong client exists

**How to verify:**

**Find CLI app:**
```bash
find . -name "*cli*" -o -name "*terminal*" | grep -i pong
ls -la | grep -i cli
```

**Check for CLI code:**
```bash
grep -r "readline\|terminal\|cli" backend/ | grep -i game
```

**Run CLI:**
```bash
# Team should show you how to run it
# Might be something like:
node backend/cli-pong.js
# or
npm run cli-game
```

**Pass criteria:**
- CLI application exists
- Can be run from terminal
- Displays game in text/ASCII
- Playable from command line

**Ask team:** "Show me how to run CLI Pong"

[↑ Back to checklist](#quick-checklist)

---

<a name="cli-play"></a>
### ✓ CLI Game Playable [MAJOR]

**What to check:** CLI Pong is actually playable

**How to verify:**
1. Launch CLI Pong
2. Should show game board (ASCII art)
3. Keyboard controls work
4. Can play a full game

**Features to check:**
- Shows paddles and ball
- Responds to keyboard input
- Displays score
- Game ends when score reached
- Shows winner

**Pass criteria:**
- Fully functional game in terminal
- Smooth gameplay
- All Pong rules apply
- Properly displays game state

[↑ Back to checklist](#quick-checklist)

---

<a name="cli-web"></a>
### ✓ CLI vs Web Player Match [MAJOR]

**What to check:** CLI player can play against web player

**How to verify:**

**Test cross-platform match:**
1. Start game from web browser (Player 1)
2. Start CLI app (Player 2)
3. Join same game session
4. Should be able to play against each other

**Pass criteria:**
- CLI connects to same game server
- CLI sees web player's moves
- Web sees CLI player's moves
- Game synchronizes correctly
- Both can play simultaneously

**Ask team:**
- "How do CLI and web players connect?"
- "Can they join same game room?"
- "Demo CLI vs web match"

**Red flags:**
- CLI and web are separate implementations
- Cannot connect to same game
- Different game servers

[↑ Back to checklist](#quick-checklist)

---

<a name="cli-connection"></a>
### ✓ CLI Connection Method [MAJOR]

**What to check:** CLI connects to game server properly

**How to verify:**

**Check connection code:**
```bash
grep -r "WebSocket\|ws://\|socket" backend/cli* frontend/cli*
# Should find WebSocket or socket connection
```

**Ask team:**
- "How does CLI connect to server?"
- "Same WebSocket as web client?"
- "Show me connection code"

**Pass criteria:**
- CLI uses WebSocket or similar for real-time
- Connects to same backend as web
- Shares game server infrastructure
- Not a separate implementation

[↑ Back to checklist](#quick-checklist)

---

[↑ Back to top](#table-of-contents)

<a name="part12-details"></a>
## 🎁 PART 12: BONUS EVALUATION - DETAILED STEPS

<a name="bonus-eligibility"></a>
### ✓ Bonus Eligibility

**What to check:** Project qualifies for bonus points

**Requirements for bonus:**
1. Mandatory part 100% complete
2. At least 7 major modules implemented
3. All security requirements met
4. No critical bugs or issues

**How to verify:**
1. Confirm all mandatory checks passed
2. Count major modules (marked [MAJOR])
3. Verify security sections complete

**Pass criteria:**
- All mandatory features working
- 7+ major modules functional
- No security vulnerabilities
- Project stable and polished

**Red flags - NO BONUS if:**
- Security issues present
- Mandatory features missing
- Project crashes frequently
- Critical bugs unfixed

[↑ Back to checklist](#quick-checklist)

---

<a name="bonus-modules"></a>
### ✓ Count Bonus Modules

**What to check:** Additional modules beyond required 7

**How to count:**
1. List all implemented major modules
2. First 7 major modules = mandatory (100%)
3. Modules 8+ = bonus (extra points)

**Module categories (MAJOR):**
- Web: Fastify, Tailwind/Bootstrap
- Game: Remote players, Multiplayer, Alternative game
- User: Standard auth, OAuth, Friends
- Gameplay: Live chat, AI opponent
- Cybersecurity: WAF, HashiCorp Vault, GDPR
- DevOps: ELK, Monitoring, Microservices
- Graphics: 3D graphics (Babylon.js)
- Server-Side: Server-side Pong

**Bonus calculation:**
- Each MAJOR module beyond 7th = +10 points potential
- MINOR modules = +5 points potential
- Quality of implementation affects final bonus

**Example:**
- 7 major modules = 100% (no bonus)
- 8 major modules = 100% + up to 10 bonus
- 9 major modules = 100% + up to 20 bonus
- + minor modules = additional small bonuses

[↑ Back to checklist](#quick-checklist)

---

<a name="bonus-quality"></a>
### ✓ Implementation Quality

**What to check:** Extra modules well-implemented, not just checked boxes

**Quality factors:**
- Code quality (clean, maintainable)
- Error handling
- User experience
- Performance
- Documentation
- Testing

**How to verify:**
1. Test bonus modules thoroughly
2. Check for bugs and edge cases
3. Verify they integrate well with main project
4. Should not feel "tacked on"

**Pass criteria:**
- Bonus features fully functional
- Same quality as mandatory features
- Well integrated
- Properly documented
- No critical bugs

**Red flags - reduce bonus:**
- Half-implemented features
- Buggy or unstable
- Poor user experience
- No error handling
- Looks rushed

[↑ Back to checklist](#quick-checklist)

---

<a name="bonus-innovation"></a>
### ✓ Innovation and Polish

**What to check:** Project shows extra effort, creativity, polish

**Look for:**
- Exceptional UI/UX design
- Creative features beyond requirements
- Outstanding performance
- Comprehensive documentation
- Thoughtful details
- Professional quality

**Examples of polish:**
- Smooth animations
- Helpful error messages
- Intuitive navigation
- Consistent design
- Loading states
- Empty states

**Bonus consideration:**
Extra points for:
- Exceptional quality
- Innovative solutions
- Going above and beyond
- Professional-grade implementation

[↑ Back to checklist](#quick-checklist)

---

<a name="bonus-score"></a>
### ✓ Calculate Bonus Score

**Scoring formula:**

**Base score: 100% from 7 major modules**

**Bonus points (examples):**
- Module 8 (MAJOR): +10 points
- Module 9 (MAJOR): +10 points
- Module 10 (MAJOR): +10 points
- MINOR module: +5 points each
- Exceptional quality: +5 to +15 points
- Innovation: +5 to +10 points

**Maximum bonus:** Typically capped (check eval scale)

**Example calculation:**
```
Base (7 major modules):     100%
8th major module:           +10
9th major module:           +10
2 minor modules:            +10 (5×2)
Exceptional quality:        +10
-----------------------------------
Total:                      140%
```

**Final score capped:** Usually at 125% or as per eval scale

[↑ Back to checklist](#quick-checklist)

---

<a name="final-check"></a>
### ✓ Final Verification

**Complete final checks:**

**1. Mandatory requirements:**
- [ ] HTTPS working
- [ ] Passwords hashed
- [ ] SQL injection protected
- [ ] XSS protected
- [ ] No credentials in repo
- [ ] Docker setup works

**2. Module count:**
- [ ] Count all MAJOR modules
- [ ] Verify each works correctly
- [ ] At least 7 for 100%

**3. Bonus modules:**
- [ ] Count extra major modules
- [ ] Count minor modules
- [ ] Test quality of each

**4. Overall quality:**
- [ ] Project stable
- [ ] Good user experience
- [ ] No critical bugs
- [ ] Well documented

[↑ Back to checklist](#quick-checklist)

---

<a name="eval-notes"></a>
### ✓ Evaluation Notes Template

**Use this template for your evaluation:**

```
EVALUATION NOTES - ft_transcendence
===================================

Student(s): _______________
Date: _______________
Evaluator: _______________

MANDATORY PART:
---------------
Setup & Deployment:     [ OK / Issues: ___ ]
Security - CRITICAL:    [ OK / Issues: ___ ]
Game & Tournament:      [ OK / Issues: ___ ]
User Management:        [ OK / Issues: ___ ]

MAJOR MODULES IMPLEMENTED:
--------------------------
1. [ ] ____________________ [ OK / Issues ]
2. [ ] ____________________ [ OK / Issues ]
3. [ ] ____________________ [ OK / Issues ]
4. [ ] ____________________ [ OK / Issues ]
5. [ ] ____________________ [ OK / Issues ]
6. [ ] ____________________ [ OK / Issues ]
7. [ ] ____________________ [ OK / Issues ]
8. [ ] ____________________ [ OK / Issues ] (BONUS)
9. [ ] ____________________ [ OK / Issues ] (BONUS)

MINOR MODULES (BONUS):
----------------------
1. [ ] ____________________ [ OK / Issues ]
2. [ ] ____________________ [ OK / Issues ]

BONUS EVALUATION:
-----------------
Extra major modules:     ___ × 10 pts = ___
Extra minor modules:     ___ × 5 pts  = ___
Quality & polish:                      ___
Innovation:                            ___
                                       --------
Total bonus:                           ___ pts

ISSUES FOUND:
-------------
Critical: _______________
Major:    _______________
Minor:    _______________

FINAL SCORE:
------------
Base score:              100%
Bonus:                  +___ %
                        ------
Total:                   ___ %

RATING:
-------
[ ] Outstanding
[ ] Excellent  
[ ] OK
[ ] Incomplete
[ ] Empty Work
[ ] Cheat
```

[↑ Back to checklist](#quick-checklist)

---

<a name="eval-decision"></a>
### ✓ Final Evaluation Decision

**Make your final decision:**

**PASS (OK) if:**
- All mandatory requirements met
- At least 7 major modules working
- No critical security issues
- Project stable and functional

**FAIL (Incomplete) if:**
- Mandatory requirements missing
- Less than 7 major modules
- Critical security vulnerabilities
- Project doesn't run properly

**OUTSTANDING if:**
- All requirements exceeded
- 9+ major modules implemented
- Exceptional quality
- Professional-grade implementation
- No issues found

**Ask yourself:**
- Would I use this application?
- Is it secure and stable?
- Does it meet all requirements?
- Is the code quality good?

**Document your decision:**
Write clear justification for your rating, noting:
- What worked well
- What issues you found
- Why you gave the score you did
- Suggestions for improvement (if applicable)

[↑ Back to checklist](#quick-checklist)

---

[↑ Back to top](#table-of-contents)

---

## 📊 EVALUATION SUMMARY

### Module Scoring Reference

**MAJOR MODULES (10 points each):**
Required 7 for 100%, extras count as bonus

**Web:**
- Fastify backend framework
- Tailwind CSS or Bootstrap

**Game:**
- Remote players (multiplayer)
- Multiplayer (4+ players)
- Alternative game (not Pong)

**User Management:**
- Standard authentication
- OAuth 2.0 (Google, etc.)
- Friends system

**Gameplay:**
- Live chat
- AI opponent

**Cybersecurity:**
- WAF (ModSecurity)
- HashiCorp Vault
- GDPR compliance

**DevOps:**
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Monitoring (Prometheus, Grafana)
- Microservices architecture

**Graphics:**
- 3D graphics (Babylon.js)

**Server-Side:**
- Server-side Pong game logic

**MINOR MODULES (5 points each):**
Additional features, bonus only

- Responsive design
- Browser compatibility
- Multi-language support
- Accessibility features
- Server-Side Rendering

### How to Reach 100%

**Minimum requirements:**
1. All mandatory features working
2. Exactly 7 major modules implemented and functional
3. All security requirements met
4. Docker deployment works
5. No critical bugs

**Example combinations to reach 7 major modules:**

**Web-focused:**
1. Fastify + 2. Tailwind + 3. Remote players + 4. Standard auth + 5. Friends + 6. Live chat + 7. GDPR

**Game-focused:**
1. Fastify + 2. Tailwind + 3. Remote players + 4. Multiplayer + 5. Alternative game + 6. Standard auth + 7. AI opponent

**DevOps-focused:**
1. Fastify + 2. Tailwind + 3. Remote players + 4. Standard auth + 5. ELK Stack + 6. Monitoring + 7. Microservices

### Bonus Calculation

**Formula:**
```
Base score: 100% (from 7 major modules)
+ (Extra MAJOR modules × 10 points)
+ (MINOR modules × 5 points)
+ Quality bonus (0-15 points)
= Total score (typically capped at 125%)
```

**Example 1:**
- 7 major modules = 100%
- 2 extra major = +20
- 3 minor modules = +15
- Quality bonus = +10
- **Total: 145% → Capped at 125%**

**Example 2:**
- 7 major modules = 100%
- 1 extra major = +10
- 1 minor module = +5
- **Total: 115%**

### Important Notes

**Security is NON-NEGOTIABLE:**
- HTTPS must work
- Passwords must be hashed
- Must prevent SQL injection
- Must prevent XSS
- No credentials in repository

**If security fails → Project fails**

**Module must be FULLY functional:**
- Partially implemented = doesn't count
- Buggy implementation = evaluator discretion
- Must integrate with rest of project
- Must be documented

**Ask when in doubt:**
- If unsure if module qualifies, ask team to explain
- Have them demonstrate functionality
- Check code if necessary
- Document your reasoning

### Rating Options

**Outstanding (125%):**
Exceeds all requirements, professional quality, 9+ modules, innovative

**Excellent (110-125%):**
Exceeds requirements, high quality, 8+ modules, polished

**OK (100-110%):**
Meets all requirements, 7 modules working, good quality

**Incomplete (0%):**
Missing requirements, <7 modules, security issues, critical bugs

**Empty Work (0%):**
Project doesn't run or is mostly empty

**Cheat (0%):**
Plagiarism detected, prohibited features used

---

## 📚 REFERENCE DOCUMENTS

This interactive guide was compiled from:
- **subject.md** - Project requirements and module descriptions
- **eval.md** - Evaluation guidelines and scoring rubric
- **MANUAL_EVALUATION_CHECKLIST.md** - Quick reference checklist
- **EVALUATION_TOOL_COMPLETE.md** - Detailed verification steps

For the most authoritative and up-to-date requirements, always refer to the official subject.md from your campus.

---

## ✅ EVALUATION COMPLETE

Thank you for using this interactive evaluation guide!

**Tips for evaluators:**
- Take your time - thorough evaluation is important
- Document everything you test
- Ask questions when unclear
- Be fair and consistent
- Provide constructive feedback

**Remember:**
- Security is mandatory
- 7 major modules = 100%
- Quality matters as much as quantity
- Be thorough but fair

**Good luck with your evaluation! 🚀**

[↑ Back to top](#table-of-contents)

---

*End of Interactive Evaluation Guide*
