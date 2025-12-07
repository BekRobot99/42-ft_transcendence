# ft_transcendence - Detailed Evaluation Guide - PART 1: SETUP & PRELIMINARY

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
