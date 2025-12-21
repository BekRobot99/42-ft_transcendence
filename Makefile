# ft_transcendence Makefile
# Simple commands for evaluation

# Colors
GREEN = \033[0;32m
YELLOW = \033[0;33m
CYAN = \033[0;36m
RESET = \033[0m

# Configuration
COMPOSE_FILE = docker-compose.yml
DOCKER_COMPOSE := docker compose

.DEFAULT_GOAL := help

help: ## Show available commands
	@echo "$(CYAN)========================================$(RESET)"
	@echo "$(CYAN)  ft_transcendence - Commands$(RESET)"
	@echo "$(CYAN)========================================$(RESET)"
	@echo ""
	@echo "$(GREEN)make up$(RESET)       - Build and start containers"
	@echo "$(GREEN)make down$(RESET)     - Stop and remove containers"
	@echo "$(GREEN)make restart$(RESET)  - Restart containers"
	@echo "$(GREEN)make logs$(RESET)     - Show all logs"
	@echo "$(GREEN)make clean$(RESET)    - Clean everything"
	@echo ""
	@echo "$(YELLOW)Visit: https://localhost:8080$(RESET)"
	@echo ""

up: ## Build and start containers
	@echo "$(YELLOW)Building and starting containers...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up --build -d
	@echo "$(GREEN)✅ Containers running!$(RESET)"
	@echo "$(CYAN)Visit: https://localhost:8080$(RESET)"

down: ## Stop and remove containers
	@echo "$(YELLOW)Stopping containers...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down
	@echo "$(GREEN)✅ Containers stopped!$(RESET)"

restart: ## Restart containers
	@echo "$(YELLOW)Restarting containers...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) restart
	@echo "$(GREEN)✅ Containers restarted!$(RESET)"

logs: ## Show container logs
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f

clean: ## Remove everything (containers, images, volumes)
	@echo "$(YELLOW)Cleaning up...$(RESET)"
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down --volumes --rmi all
	@echo "$(GREEN)✅ Cleanup complete!$(RESET)"

# Phony targets
# .PHONY: help install rootless-check ensure-busybox prepare-volumes preflight build up start stop restart down dev-build dev dev-start dev-stop dev-restart dev-down status logs logs-backend logs-frontend dev-logs dev-logs-backend dev-logs-frontend shell-backend shell-frontend db clean clean-containers clean-images clean-volumes reset test info render-build render-start health deploy-info
.PHONY: help install build up start stop restart down dev-build dev dev-start dev-stop dev-restart dev-down status logs logs-backend logs-frontend dev-logs dev-logs-backend dev-logs-frontend shell-backend shell-frontend db clean clean-containers clean-images clean-volumes reset test info render-build render-start health deploy-info
