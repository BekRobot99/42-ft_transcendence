# ft_transcendence - Complete Detailed Evaluation Guide

**Version:** 18.0 | **Complete Guide (All Parts Combined)**

This comprehensive guide provides step-by-step instructions for manually evaluating the ft_transcendence project.

**Table of Contents:**
- Part 1: Setup & Preliminary (Repository, Docker, Code Quality)
- Part 2: Security (HTTPS, Passwords, SQL Injection, XSS)
- Part 3: Game & Gameplay (Pong, Tournament, AI, Remote)
- Part 4: Modules (Web, User Mgmt, Chat, Cybersecurity, AI)
- Part 5: Advanced Modules (DevOps, Graphics, Accessibility, Server-Side Pong)

---
**Version:** 18.0 | **Part 1 of 5**

This guide provides step-by-step instructions on HOW to verify each requirement.

---

## Part 1: Repository & Initial Setup

### 1.1 Repository Clean Clone

**What to check:** Git repository is properly cloned

**How to verify:**
1. Open terminal
2. Navigate to empty folder: `cd ~/evaluation_test`
3. Clone repository: `git clone <repository_url> project`
4. Check clone succeeded without errors
5. Verify `.git` folder exists: `ls -la project/.git`

**Pass criteria:** Repository clones successfully, no error messages

---

### 1.2 No Malicious Code

**What to check:** No aliases or malicious code tricks

**How to verify:**
1. Open terminal in project root
2. Check bash/zsh config: `cat ~/.bashrc ~/.zshrc` (look for suspicious aliases)
3. Search for eval/exec in codebase: `grep -r "eval(" .`
4. Check Makefile for suspicious commands: `cat Makefile`
5. Review docker-compose.yml for unusual volume mounts: `cat docker-compose.yml`

**Pass criteria:** No suspicious code, no hidden command execution

---

### 1.3 Environment Variables (.env file)

**What to check:** Credentials in .env file, NOT in Git

**How to verify:**
1. Check if .env exists: `ls -la .env`
2. Open .env file: `cat .env`
3. Verify it contains:
   - Database credentials
   - API keys
   - OAuth client secrets
   - JWT secrets
4. Check .env is in .gitignore: `cat .gitignore | grep .env`
5. Verify .env NOT committed: `git log --all --full-history -- .env`

**Pass criteria:** 
- `.env` file exists with secrets
- `.env` in `.gitignore`
- No .env in git history

**Red flags:** Secrets in code files, API keys committed to Git

---

### 1.4 Docker Compose File Exists

**What to check:** docker-compose.yaml at root

**How to verify:**
1. Check file exists: `ls -la docker-compose.yml` or `ls -la docker-compose.yaml`
2. Open file: `cat docker-compose.yml`
3. Verify services defined (backend, frontend, database, etc.)
4. Check port mappings exist
5. Check volumes defined

**Pass criteria:** File exists, properly formatted YAML, services defined

---

### 1.5 Docker Build & Launch

**What to check:** Docker builds and runs with single command

**How to verify:**
1. Stop any running containers: `docker-compose down`
2. Build containers: `docker-compose up --build`
3. Watch output - should see:
   - Building images
   - Starting containers
   - Services running (no exit errors)
4. Check containers running: `docker ps`
5. Verify all services show "Up" status

**Pass criteria:** 
- Builds without errors
- All containers start
- No exit/restart loops

**Common issues to check:**
- Port conflicts (address already in use)
- Missing dependencies
- Build failures
- Container crashes immediately

---

### 1.6 Website Accessible

**What to check:** Can access website after Docker launch

**How to verify:**
1. After `docker-compose up`, note the URL (usually in output)
2. Open Firefox browser
3. Navigate to: `https://localhost` or `https://localhost:<port>`
4. Accept self-signed certificate warning (click Advanced > Accept Risk)
5. Verify page loads

**Pass criteria:** Website loads, shows homepage or login screen

**Red flags:** 
- Connection refused
- 502 Bad Gateway
- Page doesn't load

---

## Part 2: Code Quality & Libraries

### 2.1 No Complete Solution Libraries

**What to check:** No libraries that solve entire features

**How to verify:**
1. Open `package.json` in backend: `cat backend/package.json`
2. Open `package.json` in frontend: `cat frontend/package.json`
3. Review dependencies list
4. Ask team about each major library:
   - "What does [library-name] do?"
   - "Which part of the project uses it?"
   - "What feature does it implement?"

**Examples of PROHIBITED libraries:**
- Complete admin panels
- Full authentication systems (if not in module)
- Ready-made chat applications
- Complete game engines (if mandatory Pong)

**Examples of ALLOWED libraries:**
- Express/Fastify (if backend framework module chosen)
- Socket.io (for WebSocket communication)
- bcrypt (for password hashing)
- jsonwebtoken (for JWT)

**Pass criteria:** Team can justify each library, none solve entire features

---

### 2.2 Follow Third-Party Instructions

**What to check:** Direct library instructions followed

**How to verify:**
1. Read subject PDF module requirements
2. Check if module says "must use [technology]"
3. Verify that technology is used:
   - Example: "Backend Framework: Must use Fastify"
   - Check: `grep -r "fastify" backend/package.json`
4. Check if module says "cannot use [technology]"
5. Verify that technology is NOT used

**Pass criteria:** All "must use" technologies present, "cannot use" absent

---

### 2.3 Small Libraries Justified

**What to check:** Small utility libraries properly used

**How to verify:**
1. Review package.json dependencies
2. For each utility library, ask:
   - "What specific task does this solve?"
   - "Where in code is it used?"
   - "Could you implement it yourself?"
3. Check library does ONE simple task (not full feature)

**Examples of acceptable small libraries:**
- `validator` - for email/URL validation
- `uuid` - for generating unique IDs
- `date-fns` - for date formatting

**Pass criteria:** Each small library solves specific sub-task, not full feature

---

### 2.4 No Unhandled Errors in Console

**What to check:** Browser console has no errors

**How to verify:**
1. Open Firefox
2. Navigate to website
3. Open Developer Tools: Press `F12`
4. Click "Console" tab
5. Interact with website (click buttons, navigate pages, play game)
6. Monitor console for:
   - Red error messages
   - Yellow warning messages (acceptable if minor)
   - Failed network requests (red)

**Pass criteria:** No red errors, only minor warnings acceptable

**Common errors to look for:**
- "404 Not Found" - missing resources
- "Failed to load resource" - broken links
- "Uncaught TypeError" - JavaScript errors
- "CORS policy" - CORS configuration issues

---

### 2.5 No Segfaults or Crashes

**What to check:** Application doesn't crash during defense

**How to verify:**
1. During entire evaluation, monitor:
   - Terminal running docker-compose
   - Browser tabs
   - Container logs: `docker-compose logs -f`
2. Try edge cases:
   - Empty form submissions
   - Invalid inputs
   - Rapid clicking
   - Multiple tabs open
3. Check containers still running: `docker ps`

**Pass criteria:** No crashes, containers stay running, website remains accessible

**Red flags:**
- Container exits
- "Exited (1)" status
- White screen
- "Cannot connect" errors

---

## Part 3: Memory & Performance

### 3.1 Memory Leaks Check

**What to check:** No memory leaks in application

**How to verify:**

**Option A - Docker Stats:**
1. Run: `docker stats`
2. Monitor memory usage of each container
3. Use application for 5-10 minutes (play games, navigate)
4. Check if memory continuously increases without dropping

**Option B - Browser Memory:**
1. Open Firefox Developer Tools (F12)
2. Go to "Memory" tab
3. Click "Take snapshot"
4. Use website for 5 minutes
5. Take another snapshot
6. Compare memory usage - should be similar

**Option C - Server-side (if Node.js):**
1. SSH into backend container: `docker exec -it <container> sh`
2. Run: `node --expose-gc app.js` (if they allow)
3. Monitor with: `ps aux | grep node`

**Pass criteria:** Memory usage stable, no continuous growth

**Red flags:** Memory grows indefinitely, reaches container limit

---

### 3.2 Performance Check

**What to check:** Application responds quickly

**How to verify:**
1. Open website in Firefox
2. Navigate between pages - should be instant (SPA)
3. Click buttons - response within 1 second
4. Start Pong game - game starts immediately
5. Play Pong - smooth 60fps gameplay, no lag
6. Send chat message (if module) - appears immediately
7. Load user profile - data loads within 2 seconds

**Pass criteria:** UI responsive, game smooth, no hanging

**Red flags:**
- Buttons delay >3 seconds
- Game stutters/lags
- Pages take >5 seconds to load

---

### 3.3 Network Tab Check

**What to check:** API calls succeed, assets load

**How to verify:**
1. Open Firefox Developer Tools (F12)
2. Click "Network" tab
3. Reload page
4. Check all requests:
   - Green/200 status = good
   - Red/404 status = missing file
   - Red/500 status = server error
5. Click around website, monitor new requests
6. Verify:
   - JavaScript files load (200)
   - CSS files load (200)
   - API calls succeed (200)
   - WebSocket connects (101)

**Pass criteria:** All requests succeed (200-299 status codes)

**Red flags:** 
- Multiple 404s
- 500 Internal Server Errors
- Failed WebSocket connection

---

## Part 4: Technology Stack Verification

### 4.1 Frontend - TypeScript Check

**What to check:** Frontend uses TypeScript

**How to verify:**
1. Check `frontend/tsconfig.json` exists: `cat frontend/tsconfig.json`
2. Look for `.ts` files in frontend: `ls frontend/src/*.ts`
3. Check build script uses TypeScript: `cat frontend/package.json` (look for `tsc` command)
4. Verify compiled JavaScript has source maps: Check browser sources tab

**Pass criteria:** TypeScript config exists, .ts files present, compiles to JS

---

### 4.2 Backend - PHP or Framework Check

**What to check:** Backend follows subject requirements

**How to verify:**

**If MANDATORY (No Framework Module):**
1. Check for `.php` files: `ls backend/*.php`
2. Verify NO framework: `cat backend/composer.json` (should be empty or no Laravel/Symfony)
3. Check raw PHP used

**If FRAMEWORK MODULE chosen:**
1. Verify Fastify + Node.js: `cat backend/package.json | grep fastify`
2. Check server file: `cat backend/src/server.ts` (look for `import Fastify`)

**Pass criteria:** Matches chosen module or mandatory requirement

---

### 4.3 Database - SQLite Check

**What to check:** SQLite used (if database module or default)

**How to verify:**
1. Check for `.db` file: `find . -name "*.db"`
2. Check database config: `cat backend/src/config/database.ts`
3. Look for SQLite import: `grep -r "sqlite" backend/`
4. Verify connection code uses SQLite

**Alternative (if PostgreSQL module):**
1. Check docker-compose.yml for postgres service
2. Verify PostgreSQL connection

**Pass criteria:** Database type matches module choice

---

### 4.4 Docker Single Command Launch

**What to check:** Launches with one command

**How to verify:**
1. Stop containers: `docker-compose down`
2. Verify ONLY ONE command needed:
   - `docker-compose up --build` OR
   - `make` (if Makefile wraps docker-compose)
3. Should NOT require:
   - Multiple terminal windows
   - Manual npm install
   - Separate database initialization
   - Multiple docker commands

**Pass criteria:** Entire stack launches with single command

---

### 4.5 Single Page Application (SPA)

**What to check:** Website is SPA, browser buttons work

**How to verify:**
1. Open website in Firefox
2. Navigate to different page (e.g., Login → Profile → Game)
3. Observe:
   - Page does NOT fully reload (no white flash)
   - URL changes
   - Content changes
4. Click Browser BACK button
5. Verify:
   - Goes to previous page
   - No full page reload
6. Click Browser FORWARD button
7. Verify same behavior

**Pass criteria:** Navigation instant, no full reloads, browser buttons work

**How to technically verify:**
1. Open Network tab (F12)
2. Navigate between pages
3. Should NOT see full HTML document requests (except first load)
4. Should see only API calls

---

### 4.6 Firefox Compatibility

**What to check:** Works on latest Firefox

**How to verify:**
1. Check Firefox version: Menu → Help → About Firefox
2. Verify latest stable version (as of Dec 2024: ~121+)
3. Test all features in Firefox:
   - Page loads
   - Game works
   - Forms submit
   - WebSocket connects

**Pass criteria:** Everything works in latest stable Firefox

---

## Summary Checklist for Part 1

Quick reference - mark when verified:
- [ ] Repository cloned successfully
- [ ] No malicious code detected
- [ ] .env file present with secrets
- [ ] .env not committed to Git
- [ ] docker-compose.yml exists
- [ ] Docker builds without errors
- [ ] All containers start successfully
- [ ] Website accessible in browser
- [ ] No prohibited libraries
- [ ] Required libraries present
- [ ] No console errors
- [ ] No crashes during testing
- [ ] Memory usage stable
- [ ] Performance acceptable
- [ ] TypeScript frontend confirmed
- [ ] Backend stack matches requirement
- [ ] Database type correct
- [ ] Single command launch works
- [ ] SPA navigation verified
- [ ] Firefox compatibility confirmed

**Next:** Continue to PART 2 - Security & Authentication

---

**Version:** 18.0 | **Part 2 of 5**

This guide provides step-by-step instructions for verifying security requirements.

---

## ⚠️ CRITICAL: Security is MANDATORY - Stop Evaluation if Missing!

If ANY security requirement fails, the project receives grade 0. Verify carefully.

---

## Part 1: HTTPS/TLS Verification

### 1.1 HTTPS Connection

**What to check:** Website uses HTTPS (not HTTP)

**How to verify:**
1. Open Firefox
2. Navigate to website
3. Check URL bar:
   - Should show `https://localhost` or `https://...`
   - Should have padlock icon 🔒
4. Click padlock icon
5. Verify "Connection is secure" message

**Technical verification:**
1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Check first request shows "https://"
4. Verify no mixed content warnings

**Pass criteria:** URL starts with `https://`, padlock present

**FAIL if:** URL shows `http://` (without 's')

---

### 1.2 TLS Certificate Check

**What to check:** Valid TLS/SSL certificates

**How to verify:**
1. Click padlock icon in Firefox
2. Click "Connection secure" → "More information"
3. Click "View Certificate"
4. Check certificate details:
   - Issued to: localhost (or domain)
   - Valid dates
   - Certificate chain present

**Alternative check via terminal:**
```bash
openssl s_client -connect localhost:443 -servername localhost
```
Look for "Verify return code: 0 (ok)" or self-signed notice

**Pass criteria:** 
- Certificate present
- Self-signed is OK for development
- Certificate not expired

**Red flags:** No certificate, expired certificate

---

### 1.3 WebSocket Security (WSS)

**What to check:** WebSockets use WSS (not WS)

**How to verify:**
1. Open website
2. Navigate to game or chat (features using WebSocket)
3. Open Developer Tools (F12)
4. Go to "Network" tab
5. Filter by "WS" (WebSocket)
6. Start game or send message
7. Click WebSocket connection
8. Verify URL shows `wss://` (not `ws://`)

**Pass criteria:** WebSocket connections use `wss://`

**FAIL if:** WebSocket shows `ws://` (unencrypted)

---

## Part 2: Password Security

### 2.1 Password Hashing in Database

**What to check:** Passwords stored as hashes, NOT plaintext

**How to verify:**

**Method A - Direct Database Check:**
1. Connect to database container:
   ```bash
   docker exec -it <database_container> sh
   ```
2. Open database:
   ```bash
   sqlite3 /path/to/database.db
   # or
   psql -U postgres
   ```
3. Query users table:
   ```sql
   SELECT username, password FROM users LIMIT 5;
   ```
4. Check password field:
   - Should show long hash string (e.g., `$2b$10$abc123...`)
   - Should NOT show readable text

**Method B - Via Code Review:**
1. Check password service: `cat backend/src/services/pass_service.ts`
2. Verify usage of:
   - `bcrypt.hash()` or `bcrypt.hashSync()`
   - `bcrypt.compare()` for verification
3. Check registration endpoint: `cat backend/src/api/registerRoutes.ts`
4. Verify password hashed before database insert

**Pass criteria:** 
- Passwords in DB are hashed (look like random strings)
- Code uses bcrypt or similar

**FAIL if:** 
- Passwords readable in database
- No hashing code found
- Passwords stored as plaintext

---

### 2.2 Password Hashing Algorithm

**What to check:** Uses proper hashing (bcrypt, argon2, scrypt)

**How to verify:**
1. Check package.json: `cat backend/package.json | grep -E "bcrypt|argon2|scrypt"`
2. Check password service code
3. Verify algorithm:
   - bcrypt (most common) ✓
   - argon2 ✓
   - scrypt ✓
   - MD5 ✗ (FAIL - insecure)
   - SHA1 ✗ (FAIL - insecure)

**Pass criteria:** Uses bcrypt, argon2, or scrypt

**FAIL if:** Uses MD5, SHA1, or no hashing

---

## Part 3: SQL Injection Protection

### 3.1 Prepared Statements / Parameterized Queries

**What to check:** Queries use prepared statements, not string concatenation

**How to verify:**

**Code Review - Look for BAD patterns:**
```javascript
// BAD - SQL Injection vulnerable:
const query = "SELECT * FROM users WHERE id = " + userId;
const query = `SELECT * FROM users WHERE name = '${username}'`;
```

**Look for GOOD patterns:**
```javascript
// GOOD - Parameterized:
db.query("SELECT * FROM users WHERE id = ?", [userId]);
db.query("SELECT * FROM users WHERE name = $1", [username]);
```

**Files to check:**
1. Database service: `cat backend/src/config/database.ts`
2. User routes: `cat backend/src/api/userRoutes.ts`
3. Auth routes: `cat backend/src/api/signinRoutes.ts`
4. Any file with SQL queries: `grep -r "SELECT" backend/src/`

**Pass criteria:** 
- All queries use parameterized statements (`?` or `$1` placeholders)
- No string concatenation in queries

**FAIL if:** 
- Direct string concatenation: `"... WHERE id = " + id`
- Template literals with user input: `` `... WHERE id = ${id}` ``

---

### 3.2 SQL Injection Testing

**What to check:** Application rejects SQL injection attempts

**How to verify:**

**Test 1 - Login Form:**
1. Go to login page
2. In username field, enter: `admin' OR '1'='1`
3. In password field, enter: `password`
4. Click login
5. **Should FAIL** - not logged in

**Test 2 - Registration Form:**
1. Go to registration
2. Try username: `'; DROP TABLE users; --`
3. Submit
4. Check if error handled gracefully
5. Verify users table still exists in database

**Test 3 - Search/Profile:**
1. If there's search functionality, try: `%' OR '1'='1' --`
2. Should not return all users

**Pass criteria:** 
- SQL injection attempts rejected
- Application doesn't crash
- Database not affected

**FAIL if:** 
- SQL injection successful
- Gets admin access
- Database deleted/corrupted

---

## Part 4: XSS (Cross-Site Scripting) Protection

### 4.1 Output Sanitization

**What to check:** User input displayed safely (no script execution)

**How to verify:**

**Test 1 - Username/Profile:**
1. Register with username: `<script>alert('XSS')</script>`
2. Log in and view profile
3. **Should NOT** show alert popup
4. Check page source - script should be escaped as `&lt;script&gt;`

**Test 2 - Chat Messages (if chat module):**
1. Send message: `<img src=x onerror=alert('XSS')>`
2. **Should NOT** trigger alert
3. Message displayed as plain text or safely rendered

**Test 3 - Bio/Description Fields:**
1. Edit profile bio
2. Enter: `<b onmouseover=alert('XSS')>hover</b>`
3. Save and view
4. **Should NOT** execute JavaScript on hover

**Pass criteria:** 
- No JavaScript execution from user input
- HTML tags escaped or sanitized

**FAIL if:** 
- Alert popups appear
- Arbitrary JavaScript executes

---

### 4.2 Content Security Policy

**What to check:** CSP headers present (optional but recommended)

**How to verify:**
1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Click first HTML request
4. Check "Response Headers"
5. Look for: `Content-Security-Policy` header

**Example good CSP:**
```
Content-Security-Policy: default-src 'self'; script-src 'self'
```

**Pass criteria:** CSP header present (bonus points)

**Note:** Not mandatory, but shows good security practice

---

## Part 5: Form Validation - Server-Side

### 5.1 Server-Side Validation Exists

**What to check:** Server validates ALL form inputs (not just client-side)

**How to verify:**

**Test - Bypass Client Validation:**
1. Open Developer Tools (F12)
2. Go to "Console" tab
3. Disable client-side validation:
   ```javascript
   document.querySelectorAll('input').forEach(i => i.removeAttribute('required'));
   document.querySelector('form').onsubmit = () => true;
   ```
4. Submit form with invalid data (empty fields, wrong format)
5. Server **SHOULD** reject it with error message

**Code Review:**
1. Check validation service: `cat backend/src/services/validators.ts`
2. Check route handlers: `cat backend/src/api/*.ts`
3. Verify validation before database operations

**Pass criteria:** 
- Server validates and rejects invalid input
- Error messages returned

**FAIL if:** 
- Invalid data accepted
- No server-side checks

---

### 5.2 Email Validation

**What to check:** Email format validated on server

**How to verify:**

**Test invalid emails:**
1. Try registering with: `notanemail`
2. Try: `user@`
3. Try: `@domain.com`
4. Server should reject all

**Test valid email:**
1. Use: `user@example.com`
2. Should be accepted

**Pass criteria:** Only valid email formats accepted

---

### 5.3 Input Length Limits

**What to check:** Server enforces length limits

**How to verify:**

**Test - Very Long Input:**
1. Open browser console
2. Generate long string:
   ```javascript
   'A'.repeat(100000)
   ```
3. Submit in form field
4. Server should reject with "too long" error

**Test - Very Long Password:**
1. Try password with 10,000 characters
2. Should be rejected

**Pass criteria:** Server enforces reasonable limits

---

## Part 6: Input Sanitization

### 6.1 User Input Cleaned

**What to check:** Special characters handled safely

**How to verify:**

**Test special characters in username:**
1. Try: `<>'"&`
2. Try: `../../etc/passwd`
3. Try: `${eval('alert(1)')}`
4. All should be handled safely

**Code check:**
1. Look for sanitization functions: `grep -r "sanitize" backend/`
2. Check for escaping: `grep -r "escape" backend/`
3. Verify input cleaning before storage

**Pass criteria:** 
- Special characters escaped or rejected
- No code execution

---

## Part 7: Authentication Token Security

### 7.1 Session/JWT Security

**What to check:** Authentication tokens handled securely

**How to verify:**

**Check JWT (if JWT module):**
1. Log in to website
2. Open Developer Tools → Application → Cookies (or Local Storage)
3. Find JWT token
4. Copy token
5. Go to https://jwt.io
6. Paste token
7. Verify:
   - Token is signed (has signature)
   - Expiration time present (`exp` field)
   - Short lifetime (<24 hours recommended)

**Check Session Cookie:**
1. Open DevTools → Application → Cookies
2. Find session cookie
3. Verify flags:
   - `HttpOnly` ✓ (prevents JavaScript access)
   - `Secure` ✓ (HTTPS only)
   - `SameSite=Strict` or `Lax` ✓

**Pass criteria:** 
- Tokens expire
- Secure flags set on cookies

---

## Part 8: CORS Configuration

### 8.1 CORS Headers Check

**What to check:** CORS properly configured

**How to verify:**
1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Make API request
4. Click request
5. Check "Response Headers"
6. Look for:
   ```
   Access-Control-Allow-Origin: https://localhost
   Access-Control-Allow-Credentials: true
   ```

**Pass criteria:** 
- CORS headers present
- Origin restricted (not `*`)

**Red flag:** `Access-Control-Allow-Origin: *` with credentials

---

## Part 9: File Upload Security (if avatars)

### 9.1 File Type Validation

**What to check:** Only allowed file types accepted

**How to verify:**
1. Go to avatar upload
2. Try uploading:
   - `.exe` file → Should be rejected
   - `.php` file → Should be rejected
   - `.html` file → Should be rejected
   - `.jpg` file → Should be accepted
   - `.png` file → Should be accepted

**Pass criteria:** Only image types accepted

---

### 9.2 File Size Limit

**What to check:** File size restricted

**How to verify:**
1. Try uploading 100MB image
2. Should be rejected with size error
3. Try normal 2MB image
4. Should be accepted

**Pass criteria:** Size limit enforced (e.g., <5MB)

---

### 9.3 File Storage Location

**What to check:** Uploaded files stored safely

**How to verify:**
1. Check upload directory:
   ```bash
   ls backend/uploads/avatars/
   ```
2. Verify:
   - Files stored outside web root
   - Files renamed (not original filename)
   - No executable permissions

**Code check:**
```bash
cat backend/src/api/avatarRoutes.ts
```
Look for path validation

**Pass criteria:** 
- Files stored safely
- Filenames sanitized

---

## Part 10: Environment Variables Security

### 10.1 Secrets Not in Code

**What to check:** No hardcoded secrets

**How to verify:**
1. Search for API keys in code:
   ```bash
   grep -r "sk_live_" .
   grep -r "api_key" . | grep -v ".env"
   grep -r "secret" . | grep -v ".env"
   ```
2. Check for:
   - API keys
   - Database passwords
   - JWT secrets
   - OAuth secrets

**Pass criteria:** All secrets in `.env` file

**FAIL if:** Secrets hardcoded in source files

---

### 10.2 .env Not Committed

**What to check:** .env file not in Git history

**How to verify:**
```bash
git log --all --full-history -- .env
git log --all --full-history -- "*.env"
```

**Should return:** No results

**Pass criteria:** .env never committed

**FAIL if:** .env found in Git history (even if deleted later)

---

## Part 11: Security Summary Checklist

Quick verification checklist:

### Critical (Must Pass All):
- [ ] Website uses HTTPS (https://)
- [ ] WebSocket uses WSS (wss://)
- [ ] Passwords hashed in database
- [ ] Passwords use bcrypt/argon2/scrypt
- [ ] SQL queries use prepared statements
- [ ] SQL injection tests fail
- [ ] XSS tests don't execute scripts
- [ ] Server-side validation present
- [ ] Server validates email format
- [ ] Server enforces input limits
- [ ] Special characters sanitized
- [ ] Auth tokens have expiration
- [ ] Cookies have security flags
- [ ] File upload validates types
- [ ] File upload limits size
- [ ] No secrets in code
- [ ] .env not in Git history

### Security Bonus (Recommended):
- [ ] CSP headers present
- [ ] CORS properly configured
- [ ] 2FA implemented (if module)
- [ ] Rate limiting on login
- [ ] Account lockout after failed attempts

---

## ⚠️ STOP EVALUATION IF ANY CRITICAL ITEM FAILS

**If ANY mandatory security requirement is missing:**
1. Stop evaluation immediately
2. Mark project as failed
3. Grade: 0

**Next:** Continue to PART 3 - Game & Gameplay Features

---

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

---

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

---

**Version:** 18.0 | **Part 5 of 5**

This guide covers DevOps, Graphics, Accessibility, and Server-Side Pong modules.

---

## V.7 DEVOPS MODULES

### Infrastructure - ELK Stack [MAJOR - 2 points]

**Requirements:**
- Elasticsearch (log storage)
- Logstash (log processing)
- Kibana (visualization)

#### Verification Steps:

**1. Check Containers Running:**
```bash
docker-compose ps
```
Should see:
- elasticsearch
- logstash
- kibana

**2. Access Kibana:**
1. Open browser
2. Navigate to: `http://localhost:5601`
3. Kibana interface should load

**3. Check Elasticsearch:**
```bash
curl http://localhost:9200
```
Should return JSON with cluster info

**4. Verify Logs Collection:**
1. In Kibana, go to "Discover" or "Logs"
2. Select index pattern (e.g., `logs-*`)
3. Should see application logs
4. Filter by:
   - Service name
   - Log level (info, error, warn)
   - Timestamp

**5. Test Log Flow:**
1. Perform action on website (e.g., login, play game)
2. Check Kibana within 30 seconds
3. New logs should appear

**6. Check Logstash Pipeline:**
```bash
docker exec -it <logstash_container> cat /usr/share/logstash/pipeline/logstash.conf
```
Should show input, filter, output configuration

**7. Query Logs:**
In Kibana, try searches:
- `level: "error"` (show only errors)
- `service: "backend"` (backend logs)
- `message: "login"` (login-related logs)

**8. Check Index Management:**
1. In Kibana, go to Management → Index Management
2. Verify indices created
3. Check index size and document count

**Pass criteria:**
- [ ] All 3 services running
- [ ] Kibana accessible
- [ ] Elasticsearch stores logs
- [ ] Logstash processes logs
- [ ] Logs searchable in Kibana
- [ ] Real-time log collection works

---

### Monitoring - Prometheus & Grafana [MINOR - 1 point]

**Requirements:**
- Prometheus (metrics collection)
- Grafana (metrics visualization)

#### Verification Steps:

**1. Check Containers:**
```bash
docker-compose ps | grep -E "prometheus|grafana"
```

**2. Access Prometheus:**
1. Open browser
2. Navigate to: `http://localhost:9090`
3. Prometheus UI should load
4. Click "Status" → "Targets"
5. Verify targets are "UP"

**3. Query Metrics:**
In Prometheus:
1. Go to "Graph" tab
2. Try queries:
   - `up` (service availability)
   - `http_requests_total` (request count)
   - `node_cpu_seconds_total` (CPU usage)
3. Click "Execute"
4. Should see data

**4. Access Grafana:**
1. Navigate to: `http://localhost:3001`
2. Login (default: admin/admin)
3. Grafana dashboard should load

**5. Check Data Source:**
1. In Grafana, go to Configuration → Data Sources
2. Should see Prometheus configured
3. Click "Test" → Should show "Data source is working"

**6. View Dashboards:**
1. Go to Dashboards
2. Should see pre-configured dashboards:
   - System metrics
   - Application metrics
   - Request rates
3. Verify graphs show real data

**7. Test Real-Time Updates:**
1. Watch dashboard for 30 seconds
2. Metrics should update
3. Play a game on website
4. Check if request metrics increase

**8. Check Alerts (if configured):**
1. In Grafana, go to Alerting → Alert Rules
2. Verify alert rules exist (optional)

**Pass criteria:**
- [ ] Prometheus running
- [ ] Grafana running
- [ ] Prometheus collecting metrics
- [ ] Grafana connected to Prometheus
- [ ] Dashboards show real data
- [ ] Metrics update in real-time
- [ ] System health visible

---

### Microservices Architecture [MAJOR - 2 points]

**Requirements:**
- Backend split into loosely-coupled services
- Service independence
- Inter-service communication

#### Verification Steps:

**1. Check Service Separation:**
```bash
docker-compose ps
```
Should see multiple backend services:
- auth-service
- game-service
- user-service
- chat-service
- etc.

**2. Verify docker-compose.yml:**
```bash
cat docker-compose.yml
```
Look for multiple service definitions, each in separate container

**3. Check Service Independence:**
1. Stop one service:
   ```bash
   docker-compose stop auth-service
   ```
2. Test if other services still work
3. Verify graceful degradation

**4. Service Discovery:**
```bash
cat backend/auth-service/src/config.ts
```
Look for service URLs:
```typescript
USER_SERVICE_URL: 'http://user-service:3001'
GAME_SERVICE_URL: 'http://game-service:3002'
```

**5. Check API Gateway (if used):**
```bash
docker ps | grep gateway
```
Verify API gateway routes requests to services

**6. Inter-Service Communication:**
1. Trace a request flow:
   - User logs in → auth-service
   - Auth-service calls → user-service
   - User-service returns data → auth-service
   - Auth-service responds to client
2. Check logs to verify communication

**7. Database Isolation:**
```bash
ls backend/*/database/
```
Each service should have isolated data OR use separate DB schemas

**8. Test Service Scaling:**
```bash
docker-compose up --scale game-service=3
```
Verify multiple instances can run

**9. Check Service Contracts:**
Ask team:
- "Show me how services communicate"
- "What protocol? (REST? gRPC?)"
- "How do you handle service failures?"

**Pass criteria:**
- [ ] Multiple backend services
- [ ] Each service in separate container
- [ ] Services communicate via API
- [ ] Services independently deployable
- [ ] Data isolation between services
- [ ] Service discovery implemented
- [ ] Graceful failure handling
- [ ] Team explains architecture

---

## V.8 GRAPHICS MODULE

### 3D Techniques - Babylon.js [MAJOR - 2 points]

**Requirements:**
- Use Babylon.js for 3D rendering
- Advanced 3D visuals for Pong

#### Verification Steps:

**1. Check Package.json:**
```bash
cat frontend/package.json | grep babylon
```
Should show: `"@babylonjs/core"`

**2. Find 3D Game:**
1. Navigate main menu
2. Look for "3D Pong" or "3D Game" option
3. Launch 3D mode

**3. Verify 3D Rendering:**
1. Game should render in 3D
2. Observe:
   - 3D paddles (not flat)
   - 3D ball (sphere)
   - 3D playing field
   - Perspective camera view

**4. Check Camera Controls:**
1. Test if camera can:
   - Rotate around field OR
   - Follow ball OR
   - Switch views
2. Verify 3D perspective changes

**5. Test 3D Lighting:**
1. Observe lighting effects:
   - Shadows on paddles
   - Highlights on ball
   - Light sources visible
2. Should NOT be flat 2D

**6. Check Textures/Materials:**
1. Paddles should have materials (color, reflection)
2. Ball should have texture
3. Field should have surface material

**7. Performance Check:**
1. Play 3D game
2. Should run smoothly (30+ fps)
3. Check browser console for WebGL errors

**8. Code Review:**
```bash
cat frontend/src/views/GamePage3D.ts | head -50
```
Look for:
```typescript
import * as BABYLON from '@babylonjs/core';
const scene = new BABYLON.Scene(engine);
const camera = new BABYLON.ArcRotateCamera(...);
```

**9. Ask Team:**
- "Why did you choose Babylon.js over Three.js?"
- "What 3D techniques did you use?"
- "Show me the scene setup code"

**Pass criteria:**
- [ ] Babylon.js installed
- [ ] Game renders in 3D
- [ ] 3D camera implemented
- [ ] 3D lighting present
- [ ] Materials/textures applied
- [ ] Smooth performance
- [ ] Advanced 3D techniques used
- [ ] Team understands 3D concepts

---

## V.9 ACCESSIBILITY MODULES

### Responsive Design [MINOR - 1 point]

**Requirements:**
- Works on desktop, mobile, tablet

#### Verification Steps:

**1. Desktop Test:**
1. Open website in Firefox on desktop
2. Verify:
   - Layout looks good
   - All elements visible
   - No overflow/scrolling issues

**2. Mobile Test - Browser DevTools:**
1. Open Firefox DevTools (F12)
2. Click "Responsive Design Mode" (Ctrl+Shift+M)
3. Select device: iPhone 12
4. Test:
   - Layout adapts
   - Text readable
   - Buttons touchable (large enough)
   - Navigation accessible

**3. Tablet Test:**
1. In Responsive Design Mode
2. Select: iPad
3. Verify layout adapts

**4. Test Different Orientations:**
1. Switch portrait ↔ landscape
2. Layout should adjust

**5. Touch Input:**
1. In mobile view
2. Try tapping buttons
3. Verify touch targets large enough (min 44x44px)

**6. Test Game on Mobile:**
1. Load game in mobile view
2. Verify:
   - Touch controls available OR
   - On-screen buttons OR
   - Swipe controls
3. Game should be playable

**7. Check CSS:**
```bash
cat frontend/styles.css | grep "@media"
```
Should see media queries:
```css
@media (max-width: 768px) { ... }
@media (min-width: 1024px) { ... }
```

**Pass criteria:**
- [ ] Works on desktop (1920x1080)
- [ ] Works on mobile (375x667)
- [ ] Works on tablet (768x1024)
- [ ] Layout adapts responsively
- [ ] Touch controls work
- [ ] No horizontal scrolling
- [ ] Text readable on small screens

---

### Browser Compatibility [MINOR - 1 point]

**Requirements:**
- Firefox (mandatory)
- One additional browser

#### Verification Steps:

**1. Firefox Test:**
1. Open in Firefox
2. Verify everything works
3. Check version: Menu → Help → About
4. Must be latest stable

**2. Test Second Browser:**

**For Chrome/Chromium:**
1. Open in Chrome
2. Test all features:
   - Page loads
   - Game works
   - Forms submit
   - WebSocket connects
3. Check console for errors

**For Safari:**
1. Open in Safari
2. Test all features
3. Check for compatibility issues

**For Edge:**
1. Open in Edge
2. Test all features

**3. Check for Polyfills:**
```bash
cat frontend/package.json | grep -E "polyfill|core-js"
```

**4. Test Browser-Specific Features:**
1. WebRTC (if video chat)
2. WebGL (if 3D graphics)
3. WebSocket
4. Local Storage

**5. Check CSS Prefixes:**
```bash
grep -r "\-webkit-\|\-moz-" frontend/
```
Should see vendor prefixes for compatibility

**Pass criteria:**
- [ ] Works in Firefox
- [ ] Works in one other browser
- [ ] No major bugs in either
- [ ] Same functionality in both
- [ ] Polyfills used where needed

---

### Multi-Language Support [MINOR - 1 point]

**Requirements:**
- Support 3+ languages
- Language switcher

#### Verification Steps:

**1. Find Language Switcher:**
1. Open website
2. Look for language dropdown/selector
3. Usually in: header, footer, or settings

**2. Test Language Switch:**
1. Note current language (e.g., English)
2. Click language switcher
3. Select different language (e.g., French)
4. Verify:
   - Page content changes
   - Buttons translated
   - Menu items translated
   - Error messages translated

**3. Test All Languages:**
Required minimum 3:
- [ ] Language 1: ____________
- [ ] Language 2: ____________
- [ ] Language 3: ____________

Test each language displays correctly

**4. Check Translation Files:**
```bash
find frontend -name "*.json" | grep -E "lang|i18n|translation"
cat frontend/src/locales/en.json
cat frontend/src/locales/fr.json
```

**5. Test Persistence:**
1. Select language (e.g., Spanish)
2. Navigate to different page
3. Verify language stays Spanish
4. Refresh page
5. Should still be Spanish

**6. Check Code:**
```bash
cat frontend/src/languageService.ts
```
Look for translation service

**7. Test During Gameplay:**
1. Change language
2. Start game
3. Verify game UI translated (Score, Win/Loss messages)

**8. RTL Support (if applicable):**
If Arabic/Hebrew supported:
- Text should align right
- Layout should mirror

**Pass criteria:**
- [ ] Language switcher present
- [ ] 3+ languages supported
- [ ] All UI text translated
- [ ] Language preference persists
- [ ] No untranslated strings
- [ ] Game UI also translated

---

### Visually Impaired Support [MINOR - 1 point]

**Requirements:**
- Screen reader compatibility
- Alt text on images
- High contrast mode
- Text resizing
- Keyboard navigation

#### Verification Steps:

**1. Screen Reader Test:**

**Using NVDA/JAWS (Windows) or VoiceOver (Mac):**
1. Enable screen reader
2. Navigate website with Tab key
3. Verify:
   - Buttons announced
   - Links read aloud
   - Form labels read
   - Images described

**Alternative - Check HTML:**
```bash
curl -k https://localhost | grep -E "aria-|role="
```
Should see ARIA attributes

**2. Alt Text Check:**
1. View page source
2. Find all images:
   ```html
   <img src="avatar.jpg" alt="User profile picture">
   ```
3. Verify every `<img>` has `alt` attribute
4. Alt text should be descriptive

**3. Form Labels:**
```bash
curl -k https://localhost/login | grep -E "<label"
```
Every input should have associated label:
```html
<label for="username">Username</label>
<input id="username" type="text">
```

**4. High Contrast Mode:**
1. Look for "High Contrast" toggle in settings
2. Enable high contrast
3. Verify:
   - Background: dark (#000)
   - Text: bright (#FFF or #FFFF00)
   - Contrast ratio: >7:1

**5. Text Resizing:**
1. In browser: Ctrl + "+" (zoom in)
2. Increase to 200%
3. Verify:
   - Text enlarges
   - Layout doesn't break
   - No text cutoff
   - Still usable

**6. Keyboard Navigation:**
1. Unplug mouse
2. Use only keyboard:
   - Tab: next element
   - Shift+Tab: previous element
   - Enter: activate button/link
   - Arrow keys: select options
3. Test:
   - Can navigate entire site
   - Focus indicator visible
   - Can play game with keyboard
   - Can submit forms

**7. Focus Indicators:**
1. Press Tab to navigate
2. Each focused element should have:
   - Visible outline or border
   - Color change
   - Some visual indication

**8. Check CSS:**
```bash
cat frontend/styles.css | grep "focus"
```
Should have focus styles:
```css
button:focus {
  outline: 2px solid blue;
}
```

**9. Color Contrast:**
Use browser extension: "WAVE" or "axe DevTools"
1. Install extension
2. Run accessibility scan
3. Check contrast ratio
4. Fix any issues flagged

**Pass criteria:**
- [ ] Screen reader compatible
- [ ] All images have alt text
- [ ] Form labels present
- [ ] High contrast mode available
- [ ] Text can be resized
- [ ] Full keyboard navigation
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA (4.5:1)

---

### Server-Side Rendering (SSR) [MINOR - 1 point]

**Requirements:**
- Initial page render on server
- SEO optimization

#### Verification Steps:

**1. View Page Source:**
1. Open website in browser
2. Right-click → View Page Source
3. Check HTML:
   - Should contain actual content (not just `<div id="root"></div>`)
   - Meta tags present
   - Title tag filled

**Example SSR:**
```html
<html>
  <head>
    <title>ft_transcendence - Play Pong Online</title>
    <meta name="description" content="...">
  </head>
  <body>
    <h1>Welcome to ft_transcendence</h1>
    <!-- Pre-rendered content -->
  </body>
</html>
```

**Example CSR (Client-Side Render - NOT SSR):**
```html
<html>
  <body>
    <div id="root"></div>
    <script src="bundle.js"></script>
  </body>
</html>
```

**2. Disable JavaScript:**
1. In Firefox: about:config
2. Set `javascript.enabled` to false
3. Reload page
4. Verify:
   - Content visible (even without JS)
   - Basic HTML structure present

**3. Check Network Tab:**
1. Open DevTools → Network
2. Clear network log
3. Refresh page
4. Check first HTML response
5. Content should be in initial HTML (not loaded by JS)

**4. SEO Meta Tags:**
View source, verify presence:
```html
<meta name="description" content="...">
<meta name="keywords" content="...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
```

**5. Test with curl:**
```bash
curl -k https://localhost
```
HTML should contain readable content

**6. Check Framework:**
```bash
cat frontend/package.json | grep -E "next|nuxt|remix"
```
SSR frameworks: Next.js, Nuxt.js, Remix

**7. Performance Check:**
1. Open Lighthouse in DevTools
2. Run audit
3. Check "First Contentful Paint"
4. Should be fast (<1.5s)

**Pass criteria:**
- [ ] Initial HTML contains content
- [ ] Meta tags present for SEO
- [ ] Content visible without JavaScript
- [ ] Fast first paint
- [ ] SSR framework used
- [ ] Team can explain SSR benefits

---

## V.10 SERVER-SIDE PONG MODULE

### Server-Side Logic + API [MAJOR - 2 points]

**Requirements:**
- Pong logic runs on server
- API for game control
- Client displays game state

#### Verification Steps:

**1. Verify Game Logic on Server:**
```bash
cat backend/src/services/GameEngine.ts
# or
cat backend/game-service/src/pong.ts
```
Look for:
- Ball physics calculations
- Paddle collision detection
- Score tracking
All should be SERVER-SIDE

**2. Check Client Code:**
```bash
cat frontend/src/views/GamePage.ts
```
Client should:
- Send inputs (paddle moves)
- Receive game state
- Render received state
Client should NOT:
- Calculate ball position
- Detect collisions

**3. Test API Endpoints:**

**Initialize game:**
```bash
curl -X POST -k https://localhost/api/game/init \
  -H "Content-Type: application/json" \
  -d '{"player1": "Alice", "player2": "Bob"}'
```
Should return game ID

**Send player input:**
```bash
curl -X POST -k https://localhost/api/game/1/move \
  -H "Content-Type: application/json" \
  -d '{"player": 1, "direction": "up"}'
```

**Get game state:**
```bash
curl -k https://localhost/api/game/1/state
```
Should return:
```json
{
  "ball": {"x": 250, "y": 200},
  "paddle1": {"y": 150},
  "paddle2": {"y": 200},
  "score": {"player1": 3, "player2": 2}
}
```

**4. Test Real-Time Updates:**
1. Open two browser windows
2. Start game
3. Move paddle on Browser 1
4. Observe Browser 2:
   - Should see paddle move
   - Ball movement synced
5. Server sends updates via WebSocket

**5. Verify Server Authority:**
1. Open browser console
2. Try to cheat:
   ```javascript
   // Try to manipulate game state
   paddle1.y = 0;
   ball.x = 500;
   ```
3. Changes should NOT persist
4. Server state should override

**6. Check WebSocket:**
```bash
cat backend/src/websocket.ts
```
Look for game state broadcasts:
```typescript
io.emit('gameState', gameState);
```

**7. Test Validation:**
1. Try invalid move via API:
   ```bash
   curl -X POST -k https://localhost/api/game/1/move \
     -d '{"player": 1, "direction": "left"}'
   ```
2. Should be rejected (paddles only move up/down)

**Pass criteria:**
- [ ] Game logic runs on server
- [ ] API endpoints for game control
- [ ] Client receives game state
- [ ] Client renders state (doesn't calculate)
- [ ] Server validates all inputs
- [ ] Real-time updates via WebSocket
- [ ] Impossible to cheat from client

---

### CLI Gameplay [MAJOR - 2 points]

**Requirements:**
- Command-line Pong application
- Connects via API
- Can play against web users

#### Verification Steps:

**1. Find CLI Application:**
```bash
ls cli/
# or
ls pong-cli/
```

**2. Check CLI Code:**
```bash
cat cli/main.py
# or
cat cli/pong-cli.js
```

**3. Run CLI:**
```bash
cd cli
python3 pong-cli.py
# or
node pong-cli.js
```

**4. CLI Login:**
1. CLI should prompt: "Username:"
2. Enter test username
3. CLI should authenticate with API

**5. CLI Game Start:**
1. CLI shows menu:
   ```
   1. Find Match
   2. Challenge Player
   3. View Stats
   4. Exit
   ```
2. Select "Find Match"
3. CLI connects to matchmaking

**6. Test Cross-Platform Play:**
1. Web User: Open website, start matchmaking
2. CLI User: Run CLI, find match
3. Verify they match against each other

**7. CLI Controls:**
During game, CLI should show:
```
Score: You 3 - 2 Opponent

==========
|    O   |  <- Ball
|        |
==========

Controls: W (up) | S (down) | Q (quit)
```

**8. Test Controls:**
1. Press W → Paddle moves up
2. Press S → Paddle moves down
3. Verify updates in real-time

**9. Verify API Communication:**
```bash
# Run CLI with debug mode
DEBUG=true node pong-cli.js
```
Should show API calls:
```
POST /api/game/join
WS connected to wss://localhost/game
Received gameState: {ball: ..., paddle: ...}
```

**10. Check Documentation:**
```bash
cat cli/README.md
```
Should explain:
- How to install
- How to run
- How to play
- Controls

**11. Test Against Web Player:**
1. Browser: User A logged in, starts game
2. CLI: User B joins same game
3. Both play in real-time
4. Verify synchronization

**Pass criteria:**
- [ ] CLI application exists
- [ ] CLI authenticates via API
- [ ] Can join matches
- [ ] Can play against web users
- [ ] Real-time synchronization
- [ ] Controls work (keyboard input)
- [ ] Game state displays in terminal
- [ ] Documentation provided
- [ ] Team demonstrates CLI gameplay

---

## Final Module Summary Checklist

### DevOps:
- [ ] ELK Stack (Elasticsearch, Logstash, Kibana)
- [ ] Monitoring (Prometheus, Grafana)
- [ ] Microservices architecture

### Graphics:
- [ ] 3D Babylon.js implementation

### Accessibility:
- [ ] Responsive design (desktop/mobile/tablet)
- [ ] Browser compatibility (+1 browser)
- [ ] Multi-language (3+ languages)
- [ ] Visually impaired support
- [ ] Server-Side Rendering (SSR)

### Server-Side Pong:
- [ ] Server-side game logic + API
- [ ] CLI gameplay application

---

## Bonus Module Scoring

For modules beyond the required 7:

| Module Type | Points |
|-------------|--------|
| Major module | +10 |
| Minor module | +5 |

---

## Team Understanding Questions

For ANY module, evaluator should ask:

1. **"Why did you choose this module?"**
   - Should explain strategic choice

2. **"How does this module work?"**
   - Should explain architecture/flow

3. **"Show me the key code for this module"**
   - Should navigate to code confidently

4. **"What challenges did you face?"**
   - Should discuss technical problems solved

5. **"How did you test this?"**
   - Should explain testing methodology

---

## Evaluation Complete!

You have now verified all aspects of the ft_transcendence project.

**Final Steps:**
1. Calculate score (mandatory + modules)
2. Verify minimum 7 major modules for 100%
3. Count bonus modules
4. Complete evaluation form
5. Provide feedback to team

**Remember:**
- Security failure = automatic 0
- Mandatory part must be perfect for bonus
- Team must be able to explain all code
- Live code modification may be requested

---

**End of Part 5 - Evaluation Guide Complete**
