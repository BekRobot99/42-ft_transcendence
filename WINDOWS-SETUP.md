# Windows Setup Guide for Mila 🪟

## Prerequisites

1. **Install Docker Desktop for Windows**
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and restart your computer
   - Make sure Docker Desktop is running (check system tray)

2. **Install Git for Windows** (if not installed)
   - Download from: https://git-scm.com/download/win

## Setup Steps

### 1. Clone the Repository

Open **PowerShell** or **Git Bash** and run:

```bash
git clone https://github.com/BekRobot99/42-ft_transcendence.git
cd 42-ft_transcendence
```

### 2. Checkout the Test Branch

```bash
git checkout test
git pull origin test
```

### 3. Start the Development Environment

#### Option A: Using PowerShell
```powershell
docker-compose -f docker-compose.dev.yml up --build
```

#### Option B: Using Git Bash (recommended)
```bash
docker-compose -f docker-compose.dev.yml up --build
```

**Note:** The first time will take a few minutes to download and build everything. ☕

### 4. Access the Website

Once you see "VITE ready" in the terminal, open your browser:

- **HTTPS:** https://localhost:8080
- **HTTP:** http://localhost:8000

**Important:** You may see a security warning for HTTPS - click "Advanced" and "Continue" (this is normal for development).

## Development Features ✨

- **Hot Reload:** When you edit frontend files, the page automatically refreshes!
- **Live Updates:** No need to restart Docker for frontend changes
- **Vite Dev Server:** Fast development experience

## Common Issues & Solutions

### Issue 1: "docker-compose: command not found"

**Solution:** Use `docker compose` (without hyphen):
```bash
docker compose -f docker-compose.dev.yml up --build
```

### Issue 2: Port Already in Use

**Solution:** Stop other containers first:
```bash
docker-compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml down
```

Then start again:
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Issue 3: Docker Desktop Not Running

**Solution:**
1. Open Docker Desktop from Start Menu
2. Wait for it to fully start (whale icon in system tray)
3. Try the command again

### Issue 4: WSL 2 Backend Error

**Solution:**
1. Open PowerShell as Administrator
2. Run: `wsl --update`
3. Restart Docker Desktop

## Stopping the Development Environment

Press `Ctrl + C` in the terminal, then run:

```bash
docker-compose -f docker-compose.dev.yml down
```

## Testing the Frontend

1. Login with test credentials:
   - Username: `ali`
   - Password: `123456`

2. Make a change to test hot reload:
   - Open `frontend/src/views/HomePage.ts`
   - Change some text
   - Watch the browser automatically update! 🎉

## Files You'll Be Working With

As frontend developer, you'll mainly edit:

```
frontend/
├── src/
│   ├── views/          # Pages (HomePage, GamePage, etc.)
│   ├── ui/             # UI Components (Buttons, Forms, etc.)
│   └── app.ts          # Main application
├── styles.css          # Global styles
└── index.html          # HTML entry point
```

## Useful Commands

```bash
# View running containers
docker ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# View frontend logs only
docker-compose -f docker-compose.dev.yml logs -f vite

# Restart just the frontend
docker-compose -f docker-compose.dev.yml restart vite

# Clean everything and start fresh
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up --build
```

## Need Help?

Ask Ali or the team! 💬

---

**Happy coding! 🚀**

*Note: The homepage has a fun surprise waiting for you! 😄*
