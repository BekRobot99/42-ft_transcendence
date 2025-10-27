# 🏓 ft_transcendence - The Ultimate Ping Pong Experience

[![42 School](https://img.shields.io/badge/42-School-000000?style=flat&logo=42&logoColor=white)](https://42.fr/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)

> **The final and most ambitious project at 42 School** - A full-stack, real-time multiplayer Ping Pong web application featuring both 2D and 3D gameplay modes!

## 🎮 Features

- **🏓 Dual Game Modes**: Classic 2D Canvas Pong & Immersive 3D Babylon.js Pong
- **👥 Real-time Multiplayer**: WebSocket-powered live gameplay
- **🔐 Secure Authentication**: JWT tokens, Google OAuth integration, 2FA support
- **🏆 Tournament System**: Organize and participate in competitive tournaments
- **👤 User Profiles**: Customizable avatars and player statistics
- **🌐 Modern Web Stack**: TypeScript, Node.js, Fastify, SQLite
- **🔒 HTTPS Ready**: SSL certificates and secure deployment
- **🐳 Docker Containerized**: One-command deployment

## 🚀 Quick Start

### Option 1: Using Make Commands (Recommended)

```bash
# Clone the repository
git clone https://github.com/BekRobot99/42-ft_transcendence.git
cd 42-ft_transcendence

# Install prerequisites and start production
make install
make up

# Visit https://localhost:8080
```
<!--
> ℹ️ `make up` automatically runs a rootless preflight that verifies Docker is running in `/goinfre` and prepares all named volumes with the right permissions. You can run it separately with `make preflight` if you want to sanity-check your setup.
-->

### Option 2: Manual Docker Commands

```bash
# Build and start production environment  
docker-compose up --build -d

# Visit https://localhost:8080
```

## 📋 Available Make Commands

Run `make help` to see all available commands:

```bash
make help          # Show all available commands
make install       # Check and install prerequisites
make up           # Start production environment
make dev          # Start development environment (hot reload)
make down         # Stop and remove containers
make logs         # View logs
make clean        # Clean up everything
```

## 🛠️ Development

For development with hot reload:

```bash
make dev
# Changes to TypeScript files will automatically rebuild
```

View development logs:
```bash
make dev-logs
```

## 🏗️ Architecture

```
ft_transcendence/
├── 📁 frontend/          # TypeScript SPA
│   ├── src/
│   │   ├── app.ts       # Main application
│   │   ├── views/       # Game pages (2D/3D)
│   │   └── ui/          # UI components
│   ├── assets/          # Images and static files
│   └── index.html       # Main HTML file
├── 📁 backend/           # Node.js API
│   ├── src/
│   │   ├── server.ts    # Fastify server
│   │   ├── api/         # REST endpoints
│   │   ├── services/    # Business logic
│   │   └── websocket.ts # Real-time features
│   └── database/        # SQLite database
├── 📁 certificates/      # SSL certificates
├── 🐳 docker-compose.yml # Production setup
├── 🐳 dockerfile        # Frontend container
├── 📄 Makefile          # Build automation
└── 📖 README.md         # This file
```

## 🎯 Game Modes

### 🎮 2D Pong (Canvas)
- Classic retro-style Pong gameplay
- Smooth canvas animations
- Keyboard controls (WASD + Arrow keys)
- Real-time score tracking

### 🌟 3D Pong (Babylon.js)  
- Immersive 3D environment
- Advanced physics and lighting
- 3D camera controls
- Modern graphics rendering

## 🔧 Technology Stack

### Frontend
- **TypeScript**: Type-safe JavaScript
- **Canvas API**: 2D game rendering
- **Babylon.js**: 3D graphics engine  
- **WebSocket**: Real-time communication
- **CSS3**: Modern styling

### Backend
- **Node.js**: JavaScript runtime
- **Fastify**: High-performance web framework
- **SQLite**: Embedded database
- **JWT**: Secure authentication
- **WebSocket**: Real-time features

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **nginx**: Web server and reverse proxy
- **SSL/TLS**: HTTPS encryption

## 📚 Detailed Setup Instructions

### Prerequisites

Ensure you have Docker and Docker Compose installed:

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)

Check installation:
```bash
make install  # Automatically checks prerequisites
```

### Production Mode

Perfect for deployment and testing the final application:

```bash
# Build and start production environment
make up
# Or manually: docker-compose up --build -d

# Visit https://localhost:8080
# Note: Accept the SSL certificate warning (self-signed certificate)

# Stop the application
make down
# Or manually: docker-compose down
```

### Development Mode  

Ideal for active development with hot reload:

```bash
# Start development environment
make dev
# Or manually: docker-compose -f docker-compose.dev.yml up --build -d

# View logs in real-time
make dev-logs

# Stop development environment  
make dev-down
```

**Development Features:**
- 🔥 Hot reload for TypeScript changes
- 📋 Real-time log monitoring  
- 🐚 Easy container shell access
- 🗄️ Database inspection tools
<!--
## 🧰 Rootless Docker Workflow (42 Campus)

This project is tuned for the 42 school constraints:

- ✅ Docker daemon must run in **rootless mode** from `/goinfre` (or `/sgoinfre`).
- ✅ Only **named volumes** are used—no bind mounts—so the campus storage policies are respected.
- ✅ Containers run as UID `0` internally to avoid permission issues inside rootless directories.

Run the automated checks and volume preparation anytime:

```bash
make preflight   # Verify rootless Docker + prep named volumes
```

If the check fails, follow the on-screen guidance to relocate your rootless Docker data to `/goinfre/$USER/docker` and restart the daemon via `dockerd-rootless-setuptool.sh`.
-->

## 🔍 Monitoring & Debugging

### View Application Status
```bash
make status           # Show all container status
make logs            # Production logs
make dev-logs        # Development logs
```

### Access Container Shells
```bash
make shell-backend   # Backend container shell
make shell-frontend  # Frontend container shell
```

### Database Access
```bash
make db             # Connect to SQLite database
```

Inside the database shell:
```sql
-- View all users
SELECT id, username, created_at FROM users;

-- View user with specific username
SELECT * FROM users WHERE username = 'your_username';
```

## 🧹 Cleanup & Maintenance

```bash
make clean          # Remove all containers, images, and volumes
make clean-containers  # Remove containers only
make clean-images   # Remove images only  
make reset          # Full reset (clean + install)
```

## 🧪 Testing

### Basic Connectivity Tests
```bash
make test           # Test HTTPS and HTTP connections
```

### Manual Testing
1. **Registration**: Create a new user account
2. **Authentication**: Test login/logout functionality
3. **2D Game**: Play classic Pong game
4. **3D Game**: Experience 3D Pong with Babylon.js
5. **Profile**: Update user profile and avatar
6. **Tournament**: Create and join tournaments

## 🔒 Security Features

- **HTTPS**: SSL/TLS encryption for all communications
- **JWT Authentication**: Secure token-based authentication
- **Google OAuth**: Third-party authentication integration
- **2FA Support**: Two-factor authentication for enhanced security
- **Password Hashing**: Secure password storage with bcrypt
- **Input Validation**: Protection against injection attacks

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
make down           # Stop any running containers
make clean-containers  # Clean up orphaned containers
```

**SSL Certificate Warnings**
- This is expected with self-signed certificates
- Click "Advanced" → "Proceed to localhost" in your browser

**Docker Permission Issues**
```bash
sudo docker-compose up --build -d  # Run with sudo if needed
```

**Database Locked**
```bash
make down           # Stop containers to release database lock
make up             # Restart
```

### Getting Help

1. **Check Status**: `make status`
2. **View Logs**: `make logs` or `make dev-logs`  
3. **Full Reset**: `make reset`
4. **Manual Commands**: Use Docker commands directly if make fails

## 🤝 Contributing

This project was developed as part of the 42 School curriculum. Feel free to:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

This project is part of the 42 School curriculum and follows the school's academic guidelines.

## 🎯 42 School Project Requirements

This project fulfills the following 42 requirements:
- ✅ **Web Framework**: Modern backend framework (Fastify)
- ✅ **Database**: SQL database with user management (SQLite) 
- ✅ **Authentication**: Secure user authentication (JWT + OAuth)
- ✅ **Real-time**: WebSocket implementation
- ✅ **Security**: HTTPS, input validation, secure storage
- ✅ **Game**: Interactive Pong game with multiplayer
- ✅ **Responsive**: Mobile-friendly design
- ✅ **Docker**: Containerized deployment

## 🏆 Credits

Developed with ❤️ by the 42 School students as the final transcendence project.

---

**🎮 Ready to play? Run `make up` and visit [https://localhost:8080](https://localhost:8080)!**