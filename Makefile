# ft_transcendence Makefile
# ======================

# Colors for output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[0;33m
BLUE = \033[0;34m
PURPLE = \033[0;35m
CYAN = \033[0;36m
WHITE = \033[0;37m
RESET = \033[0m

# Project configuration
PROJECT_NAME = ft_transcendence
COMPOSE_FILE = docker-compose.yml
DEV_COMPOSE_FILE = docker-compose.dev.yml
DOCKER_COMPOSE := $(shell if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then echo docker compose; elif command -v docker-compose >/dev/null 2>&1; then echo docker-compose; else echo ""; fi)
# DOCKER := docker

# PROJECT_VOLUMES := backend_data vault_data vault_logs waf_logs

# Default target
.DEFAULT_GOAL := help

# Help target - shows available commands
help: ## Show this help message
	@echo "$(CYAN)========================================$(RESET)"
	@echo "$(CYAN)  🏓 $(PROJECT_NAME) - Make Commands$(RESET)"
	@echo "$(CYAN)========================================$(RESET)"
	@echo ""
	@echo "$(YELLOW)📦 SETUP COMMANDS:$(RESET)"
	@awk '/^[a-zA-Z_-]+:.*?##.*setup/ { printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, substr($$0, index($$0, "##") + 3) }' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)🚀 PRODUCTION COMMANDS:$(RESET)"
	@awk '/^[a-zA-Z_-]+:.*?##.*prod/ { printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, substr($$0, index($$0, "##") + 3) }' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)🛠️  DEVELOPMENT COMMANDS:$(RESET)"
	@awk '/^[a-zA-Z_-]+:.*?##.*dev/ { printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, substr($$0, index($$0, "##") + 3) }' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)🔍 MONITORING COMMANDS:$(RESET)"
	@awk '/^[a-zA-Z_-]+:.*?##.*monitor/ { printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, substr($$0, index($$0, "##") + 3) }' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)🧹 CLEANUP COMMANDS:$(RESET)"
	@awk '/^[a-zA-Z_-]+:.*?##.*clean/ { printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, substr($$0, index($$0, "##") + 3) }' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(BLUE)💡 Quick Start:$(RESET)"
	@echo "  1. $(GREEN)make install$(RESET)     - Install prerequisites"
	@echo "  2. $(GREEN)make up$(RESET)          - Start production mode"
	@echo "  3. $(GREEN)make dev$(RESET)         - Start development mode"
	@echo "  4. Visit $(CYAN)https://localhost:8080$(RESET)"
	@echo ""

# Installation and setup
install: ## setup - Check and install prerequisites (Docker, Docker Compose)
	@echo "$(YELLOW)🔍 Checking prerequisites...$(RESET)"
	@command -v docker >/dev/null 2>&1 || { echo "$(RED)❌ Docker is not installed. Please install Docker first.$(RESET)"; exit 1; }
	@$(DOCKER_COMPOSE) version >/dev/null 2>&1 || { echo "$(RED)❌ Docker Compose is not installed. Please install Docker Compose first.$(RESET)"; exit 1; }
	@echo "$(GREEN)✅ Docker is installed$(RESET)"
	@echo "$(GREEN)✅ Docker Compose is installed$(RESET)"
	@echo "$(GREEN)🎉 All prerequisites are ready!$(RESET)"

# rootless-check: ## setup - Ensure Docker runs in rootless mode within /goinfre
# 	@echo "$(YELLOW)🔐 Verifying rootless Docker runtime...$(RESET)"
# 	@root_dir=`$(DOCKER) info --format '{{.DockerRootDir}}' 2>/dev/null`; \
# 	if [ -z "$$root_dir" ]; then \
# 		echo "$(RED)❌ Unable to determine Docker root directory. Is Docker running?$(RESET)"; \
# 		exit 1; \
# 	fi; \
# 	if ! $(DOCKER) info --format '{{json .SecurityOptions}}' 2>/dev/null | grep -qi rootless; then \
# 		echo "$(RED)❌ Docker daemon is not running in rootless mode. Start it with dockerd-rootless-setuptool.sh start.$(RESET)"; \
# 		exit 1; \
# 	fi; \
# 	if ! echo "$$root_dir" | grep -Eq '^/(g|sg)oinfre/'; then \
# 		echo "$(RED)❌ Docker root directory ($$root_dir) is not in /goinfre or /sgoinfre.$(RESET)"; \
# 		echo "$(YELLOW)➡️  Reinstall rootless Docker with DOCKER_DATA_ROOT pointing to /goinfre/$$USER/docker.$(RESET)"; \
# 		exit 1; \
# 	fi; \
# 	echo "$(GREEN)✅ Rootless Docker runtime detected in $$root_dir$(RESET)"

# ensure-busybox:
# 	@$(DOCKER) image inspect busybox:latest >/dev/null 2>&1 || { \
# 		echo "$(YELLOW)⬇️  Pulling busybox helper image...$(RESET)"; \
# 		$(DOCKER) pull busybox:latest >/dev/null; \
# 	}

# prepare-volumes: ensure-busybox ## setup - Create named volumes and fix permissions
# 	@echo "$(YELLOW)📦 Preparing named volumes...$(RESET)"
# 	@for vol in $(PROJECT_VOLUMES); do \
# 		if ! $(DOCKER) volume inspect $(PROJECT_NAME)_$$vol >/dev/null 2>&1; then \
# 			$(DOCKER) volume create $(PROJECT_NAME)_$$vol >/dev/null; \
# 			echo "  $(GREEN)Created volume $(PROJECT_NAME)_$$vol$(RESET)"; \
# 		fi; \
# 	done
# 	@$(DOCKER) run --rm -v $(PROJECT_NAME)_vault_data:/vault/data busybox sh -c "mkdir -p /vault/data && chown -R 100:100 /vault/data && chmod 700 /vault/data" >/dev/null
# 	@$(DOCKER) run --rm -v $(PROJECT_NAME)_vault_logs:/vault/logs busybox sh -c "mkdir -p /vault/logs && chown -R 100:100 /vault/logs && chmod 750 /vault/logs" >/dev/null
# 	@$(DOCKER) run --rm -v $(PROJECT_NAME)_waf_logs:/var/log/modsecurity busybox sh -c "mkdir -p /var/log/modsecurity && chmod 750 /var/log/modsecurity" >/dev/null
# 	@echo "$(GREEN)✅ Named volumes ready$(RESET)"

# preflight: rootless-check prepare-volumes ## setup - Rootless sanity checks before running containers
# 	@true

# Production commands

build: ## prod - Build production containers
	@echo "$(YELLOW)🏗️  Building production containers...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) build --no-cache
	@echo "$(GREEN)✅ Production build complete!$(RESET)"

up: build ## prod - Start production environment (build + run)
	@echo "$(YELLOW)🚀 Starting production environment...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)✅ Production environment is running!$(RESET)"
	@echo "$(CYAN)🌐 Visit: https://localhost:8080$(RESET)"
	@echo "$(PURPLE)📝 Note: You may need to accept SSL certificate warning$(RESET)"

start: ## prod - Start existing production containers
	@echo "$(YELLOW)▶️  Starting production containers...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) start
	@echo "$(GREEN)✅ Production containers started!$(RESET)"

stop: ## prod - Stop production containers
	@echo "$(YELLOW)⏹️  Stopping production containers...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) stop
	@echo "$(GREEN)✅ Production containers stopped!$(RESET)"

restart: ## prod - Restart production containers
	@echo "$(YELLOW)🔄 Restarting production containers...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) restart
	@echo "$(GREEN)✅ Production containers restarted!$(RESET)"

down: ## prod - Stop and remove production containers
	@echo "$(YELLOW)⬇️  Stopping and removing production containers...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down --remove-orphans
	@echo "$(GREEN)✅ Production environment stopped!$(RESET)"

# Development commands
dev-build: ## dev - Build development containers
	@echo "$(YELLOW)🏗️  Building development containers...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(DEV_COMPOSE_FILE) build --no-cache
	@echo "$(GREEN)✅ Development build complete!$(RESET)"

dev: dev-build ## dev - Start development environment (build + run with hot reload)
	@echo "$(YELLOW)🛠️  Starting development environment...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(DEV_COMPOSE_FILE) down --remove-orphans 2>/dev/null || true
	@$(DOCKER_COMPOSE) -f $(DEV_COMPOSE_FILE) up -d
	@echo "$(GREEN)✅ Development environment is running!$(RESET)"
	@echo "$(CYAN)🌐 Visit: https://localhost:8080$(RESET)"
	@echo "$(PURPLE)📝 Note: Hot reload enabled for TypeScript files$(RESET)"

dev-start: ## dev - Start existing development containers
	@echo "$(YELLOW)▶️  Starting development containers...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(DEV_COMPOSE_FILE) start
	@echo "$(GREEN)✅ Development containers started!$(RESET)"

dev-stop: ## dev - Stop development containers
	@echo "$(YELLOW)⏹️  Stopping development containers...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(DEV_COMPOSE_FILE) stop
	@echo "$(GREEN)✅ Development containers stopped!$(RESET)"

dev-restart: ## dev - Restart development containers
	@echo "$(YELLOW)🔄 Restarting development containers...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(DEV_COMPOSE_FILE) restart
	@echo "$(GREEN)✅ Development containers restarted!$(RESET)"

dev-down: ## dev - Stop and remove development containers
	@echo "$(YELLOW)⬇️  Stopping and removing development containers...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(DEV_COMPOSE_FILE) down --remove-orphans
	@echo "$(GREEN)✅ Development environment stopped!$(RESET)"

# Monitoring commands
status: ## monitor - Show container status
	@echo "$(YELLOW)📊 Production containers status:$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) ps
	@echo ""
	@echo "$(YELLOW)📊 Development containers status:$(RESET)"
	@$(DOCKER_COMPOSE) -f $(DEV_COMPOSE_FILE) ps

logs: ## monitor - Show production logs
	@echo "$(YELLOW)📋 Production logs:$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f

logs-backend: ## monitor - Show production backend logs
	@echo "$(YELLOW)📋 Production backend logs:$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f backend

logs-frontend: ## monitor - Show production frontend logs  
	@echo "$(YELLOW)📋 Production frontend logs:$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f frontend

dev-logs: ## monitor - Show development logs
	@echo "$(YELLOW)📋 Development logs:$(RESET)"
	@$(DOCKER_COMPOSE) -f $(DEV_COMPOSE_FILE) logs -f

dev-logs-backend: ## monitor - Show development backend logs
	@echo "$(YELLOW)📋 Development backend logs:$(RESET)"
	@$(DOCKER_COMPOSE) -f $(DEV_COMPOSE_FILE) logs -f backend

dev-logs-frontend: ## monitor - Show development frontend logs
	@echo "$(YELLOW)📋 Development frontend logs:$(RESET)"
	@$(DOCKER_COMPOSE) -f $(DEV_COMPOSE_FILE) logs -f ts-watcher

shell-backend: ## monitor - Open shell in backend container
	@echo "$(YELLOW)🐚 Opening backend container shell...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec backend sh || $(DOCKER_COMPOSE) -f $(DEV_COMPOSE_FILE) exec backend sh

shell-frontend: ## monitor - Open shell in frontend container
	@echo "$(YELLOW)🐚 Opening frontend container shell...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec frontend sh || $(DOCKER_COMPOSE) -f $(DEV_COMPOSE_FILE) exec web sh

db: ## monitor - Connect to SQLite database
	@echo "$(YELLOW)🗄️  Connecting to database...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec backend sh -c 'apk add --no-cache sqlite && sqlite3 /app/database/transcendence.sqlite' || \
	$(DOCKER_COMPOSE) -f $(DEV_COMPOSE_FILE) exec backend sh -c 'apk add --no-cache sqlite && sqlite3 /app/database/transcendence.sqlite'

# Cleanup commands
clean: ## clean - Remove all containers, images, and volumes
	@echo "$(YELLOW)🧹 Cleaning up all containers and images...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down --remove-orphans --volumes --rmi all 2>/dev/null || true
	@$(DOCKER_COMPOSE) -f $(DEV_COMPOSE_FILE) down --remove-orphans --volumes --rmi all 2>/dev/null || true
	@echo "$(GREEN)✅ Cleanup complete!$(RESET)"

clean-containers: ## clean - Remove all containers only
	@echo "$(YELLOW)🧹 Removing containers...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down --remove-orphans 2>/dev/null || true
	@$(DOCKER_COMPOSE) -f $(DEV_COMPOSE_FILE) down --remove-orphans 2>/dev/null || true
	@echo "$(GREEN)✅ Containers removed!$(RESET)"

clean-images: ## clean - Remove project Docker images
	@echo "$(YELLOW)🧹 Removing Docker images...$(RESET)"
	@docker rmi $$(docker images | grep ft_transcendence | awk '{print $$3}') 2>/dev/null || true
	@echo "$(GREEN)✅ Images removed!$(RESET)"

clean-volumes: ## clean - Remove Docker volumes
	@echo "$(YELLOW)🧹 Removing Docker volumes...$(RESET)"
	@docker volume prune -f
	@echo "$(GREEN)✅ Volumes removed!$(RESET)"

reset: clean install ## clean - Full reset (clean + install)
	@echo "$(GREEN)🎉 Full reset complete! Ready to start fresh.$(RESET)"

# Test and validation
test: ## setup - Run basic connectivity tests
	@echo "$(YELLOW)🧪 Running basic tests...$(RESET)"
	@echo "$(BLUE)Testing HTTPS connection...$(RESET)"
	@curl -k -s -o /dev/null -w "Status: %{http_code}\n" https://localhost:8080 || echo "$(RED)❌ HTTPS test failed$(RESET)"
	@echo "$(BLUE)Testing HTTP connection...$(RESET)"  
	@curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8000 || echo "$(RED)❌ HTTP test failed$(RESET)"
	@echo "$(GREEN)✅ Basic tests complete!$(RESET)"

# Info commands
info: ## setup - Show project information
	@echo "$(CYAN)========================================$(RESET)"
	@echo "$(CYAN)  🏓 $(PROJECT_NAME) Project Info$(RESET)"
	@echo "$(CYAN)========================================$(RESET)"
	@echo "$(YELLOW)Project:$(RESET) ft_transcendence - Ping Pong Web Game"
	@echo "$(YELLOW)Frontend:$(RESET) TypeScript, Canvas 2D, Babylon.js 3D"
	@echo "$(YELLOW)Backend:$(RESET) Node.js, Fastify, SQLite"
	@echo "$(YELLOW)Auth:$(RESET) JWT, Google OAuth, 2FA"
	@echo "$(YELLOW)Deployment:$(RESET) Docker, nginx, HTTPS"
	@echo ""
	@echo "$(BLUE)Ports:$(RESET)"
	@echo "  HTTPS: https://localhost:8080"
	@echo "  HTTP:  http://localhost:8000"
	@echo ""
	@echo "$(BLUE)Features:$(RESET)"
	@echo "  ✅ 2D Pong Game (Canvas)"
	@echo "  ✅ 3D Pong Game (Babylon.js)"
	@echo "  ✅ User Authentication"
	@echo "  ✅ Tournament System"
	@echo "  ✅ Real-time WebSocket"
	@echo "  ✅ SSL/HTTPS Support"

# Production deployment commands
render-build: ## prod - Build for Render.com deployment
	@echo "$(YELLOW)🏗️  Building for Render deployment...$(RESET)"
	@$(DOCKER_COMPOSE) build --no-cache
	@echo "$(GREEN)✅ Render build complete!$(RESET)"

render-start: ## prod - Start for Render.com (keeps container alive)
	@echo "$(YELLOW)🚀 Starting for Render deployment...$(RESET)"
	@$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✅ Render deployment started!$(RESET)"
	@echo "$(BLUE)📡 Keeping service alive...$(RESET)"

health: ## prod - Health check endpoint
	@echo "$(YELLOW)🏥 Checking service health...$(RESET)"
	@curl -f http://localhost:8080/ -o /dev/null -s -w "Status: %{http_code}\n" || echo "$(RED)❌ Health check failed$(RESET)"

deploy-info: ## prod - Show deployment information
	@echo "$(CYAN)========================================$(RESET)"
	@echo "$(CYAN)  🌐 Deployment Information$(RESET)"
	@echo "$(CYAN)========================================$(RESET)"
	@echo "$(YELLOW)Platform:$(RESET) Render.com"
	@echo "$(YELLOW)Config File:$(RESET) render.yaml"
	@echo "$(YELLOW)Build Command:$(RESET) make render-build"
	@echo "$(YELLOW)Start Command:$(RESET) make render-start"
	@echo "$(YELLOW)Port:$(RESET) 8080 (HTTPS)"
	@echo "$(YELLOW)Auto Deploy:$(RESET) On push to ali2 branch"
	@echo ""
	@echo "$(BLUE)Team Workflow:$(RESET)"
	@echo "  1. Push to ali2 branch → Auto deploy"
	@echo "  2. Create PR → Review → Merge → Auto deploy"
	@echo "  3. Manual deploy from Render dashboard"

# Phony targets
# .PHONY: help install rootless-check ensure-busybox prepare-volumes preflight build up start stop restart down dev-build dev dev-start dev-stop dev-restart dev-down status logs logs-backend logs-frontend dev-logs dev-logs-backend dev-logs-frontend shell-backend shell-frontend db clean clean-containers clean-images clean-volumes reset test info render-build render-start health deploy-info
.PHONY: help install build up start stop restart down dev-build dev dev-start dev-stop dev-restart dev-down status logs logs-backend logs-frontend dev-logs dev-logs-backend dev-logs-frontend shell-backend shell-frontend db clean clean-containers clean-images clean-volumes reset test info render-build render-start health deploy-info
