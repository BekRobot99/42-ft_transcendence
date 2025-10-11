# 🚀 Development Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Docker & Docker Compose (optional)

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/BekRobot99/42-ft_transcendence.git
cd 42-ft_transcendence

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Create Environment Files

Each developer needs their own `.env` file with their credentials:

```bash
# Copy the example file
cp backend/.env.example backend/.env

# Edit with your own values
nano backend/.env  # or use your preferred editor
```

**backend/.env** should contain:
```bash
JWT_SECRET=your_random_secret_here_make_it_long_and_secure
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://localhost:8080/auth/google/callback
```

#### How to Get Your Values:

**JWT_SECRET:**
```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Google OAuth Credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://localhost:8080/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env`

### 3. Generate SSL Certificates (for HTTPS)

The `certificates/nginx.key` is private and not in Git. Generate your own:

```bash
# Create certificates directory if it doesn't exist
mkdir -p certificates

# Generate self-signed certificate (valid for 365 days)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certificates/nginx.key \
  -out certificates/nginx.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

This creates:
- `nginx.key` - Private key (stays on your machine only!)
- `nginx.crt` - Public certificate (can be shared)

### 4. Initialize Database

The database file is created automatically on first run, but you can initialize it:

```bash
cd backend
# The database will be created at backend/database/transcendence.sqlite
# on first run with default tables
```

### 5. Run the Project

**Option A: Using Docker (Recommended)**
```bash
docker-compose up
```

**Option B: Manual Setup**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Option C: Using Makefile**
```bash
make dev
```

### 6. Access the Application

- Frontend: https://localhost:3000
- Backend API: https://localhost:8080
- Accept the self-signed certificate warning in your browser

## File Structure

```
├── backend/
│   ├── .env              ← YOU CREATE THIS (not in Git)
│   ├── .env.example      ← Template (in Git)
│   ├── database/
│   │   └── transcendence.sqlite  ← Auto-created (not in Git)
│   └── src/
├── frontend/
│   └── src/
├── certificates/
│   ├── nginx.key         ← YOU CREATE THIS (not in Git)
│   └── nginx.crt         ← Auto-created (not in Git)
└── .gitignore            ← Protects secrets
```

## What's NOT in Git (You Create Locally)

These files are in `.gitignore` and each developer creates their own:

✅ **backend/.env** - Your personal API keys and secrets
✅ **certificates/nginx.key** - Your local SSL private key
✅ **backend/database/transcendence.sqlite** - Your local database
✅ **node_modules/** - Auto-installed via `npm install`

## Common Issues

### "Module not found"
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Port already in use"
```bash
# Check what's using the port
lsof -i :8080
# Kill the process
kill -9 <PID>
```

### "SSL Certificate Error"
This is normal for self-signed certificates. In Chrome:
1. Click "Advanced"
2. Click "Proceed to localhost (unsafe)"

### "Google OAuth Error"
1. Check your `.env` file has correct Google credentials
2. Verify redirect URI matches in Google Console
3. Make sure you're using `https://localhost` (not `http://`)

## Team Workflow

### Don't Share:
❌ Your `.env` file
❌ Your `nginx.key` file
❌ Your database file

### Do Share:
✅ Code changes via Git
✅ Updated `package.json` (if you added dependencies)
✅ Documentation updates
✅ `.env.example` (if you added new env variables)

## Security Reminders

- Never commit `.env` files
- Never commit `*.key` or `*.pem` files
- Never commit database files with user data
- If you accidentally commit secrets, rotate them immediately!

## Need Help?

- Read `SECURITY.md` for security guidelines
- Check `TEAM-WORKFLOW.md` for Git workflow
- Ask in team chat
