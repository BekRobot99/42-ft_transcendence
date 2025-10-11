# Security Guidelines

## 🚨 NEVER Commit These Files

### 1. Environment Variables
- ❌ `.env` files (contain API keys, secrets, passwords)
- ✅ `.env.example` (template without real values) - OK to commit

### 2. Private Keys & Certificates
- ❌ `*.key` files (private SSL/TLS keys)
- ❌ `*.pem` files (private keys)
- ✅ `*.crt` files (public certificates) - Usually OK

### 3. Database Files
- ❌ `*.sqlite`, `*.db` files (contain user data)
- ✅ Database schema/migration files - OK

### 4. Credentials
- ❌ Any file with passwords, tokens, API keys
- ❌ `config/secrets.json`
- ✅ Config templates - OK

## Setup for New Developers

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd 42-ft_transcendence
   ```

2. **Create your `.env` file:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your actual values
   ```

3. **Install dependencies:**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

4. **Generate SSL certificates (for local dev):**
   ```bash
   # Self-signed certificates for HTTPS
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout certificates/nginx.key \
     -out certificates/nginx.crt
   ```

## What's Already Protected

Our `.gitignore` already blocks:
- ✅ All `node_modules/` directories
- ✅ Environment files (`.env*`)
- ✅ Private keys (`*.key`, `*.pem`)
- ✅ Database files (`*.sqlite`, `*.db`)
- ✅ Build outputs (`dist/`, `build/`)
- ✅ IDE configs (`.vscode/`, `.idea/`)

## If You Accidentally Committed Secrets

1. **Remove from Git history:**
   ```bash
   git rm --cached path/to/secret/file
   git commit -m "Remove sensitive file"
   ```

2. **Rotate the compromised credentials:**
   - Change passwords
   - Regenerate API keys
   - Revoke tokens
   - Create new SSL certificates

3. **Never reuse compromised credentials!**

## Checking Before Commit

Always review what you're committing:
```bash
git status          # See what will be committed
git diff            # See actual changes
git add .           # Add files
git status          # Double-check!
git commit -m "..."
```
