# Setup Instructions for Linux (Parrot/Ubuntu/Debian)

## Prerequisites
1. Install Docker and Docker Compose:
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
