# Setup Instructions for Linux (Parrot/Ubuntu/Debian)

## Prerequisites

### 1. Fix Node.js/npm issues (IMPORTANT for Parrot Linux!)
```bash
# Remove old Node.js versions
sudo apt remove nodejs npm

# Install Node.js 18+ via NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify versions (should be Node 18+ and npm 9+)
node --version
npm --version

# Install build tools for npm packages
sudo apt install build-essential python3-dev

# Fix npm permissions (avoid sudo for npm install)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### 2. Install Docker and Docker Compose:
```bash
# Update package index
sudo apt update

# Install Docker
sudo apt install docker.io docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (to avoid sudo)
sudo usermod -aG docker $USER
# Log out and back in for this to take effect
```

## Quick Check for Adrian (Parrot Linux)
```bash
# Check current versions
node --version  # Should be v18+ or v20+
npm --version   # Should be 9+ or 10+

# If versions are old (like v12 or npm 6), follow the Node.js setup above
# If you get "command not found", install Node.js first
```

## Running the Project
1. Clone the repository:
```bash
git clone https://github.com/BekRobot99/42-ft_transcendence.git
cd 42-ft_transcendence
```

2. Build and run containers:
```bash
# If you added yourself to docker group and logged back in:
docker-compose up --build -d

# Or if you need sudo:
sudo docker-compose up --build -d
```

3. Check if containers are running:
```bash
docker-compose ps
# or
sudo docker-compose ps
```

4. Access the website:
- HTTPS: https://localhost:8080
- HTTP: http://localhost:8000

## Troubleshooting

### npm/Node.js Issues (Common on Parrot Linux):
```bash
# If you get "npm ERR! code EACCES" or permission errors:
sudo chown -R $(whoami) ~/.npm
npm cache clean --force

# If build fails with "gyp ERR!":
sudo apt install build-essential python3-dev node-gyp

# If "node: command not found":
sudo apt update && sudo apt install nodejs npm
# Then follow the Node.js setup above

# Check if npm is working:
npm --version
node --version
```

### Docker Issues:
- If port 8080 is busy: `sudo lsof -i :8080` to find what's using it
- If Docker permission denied: Make sure you're in the docker group or use sudo
- If containers fail to start: Check logs with `docker-compose logs`
- If SSL certificate issues: The app should work on HTTP port 8000

## Stop the application
```bash
docker-compose down
# or
sudo docker-compose down
```
