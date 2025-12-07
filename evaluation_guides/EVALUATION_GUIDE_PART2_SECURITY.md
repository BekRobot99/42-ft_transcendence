# ft_transcendence - Detailed Evaluation Guide - PART 2: SECURITY

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
