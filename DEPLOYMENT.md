# Render.com Deployment Guide for ft_transcendence

## 🌐 Deployment Setup

### Step 1: Prepare for Render.com

1. **Create render.yaml in your project root**
2. **Update your Dockerfile for production**
3. **Set up environment variables**
4. **Configure automatic deployments**

### Step 2: Connect to Render.com

1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub repository
3. Choose "Web Service" deployment
4. Select your `ali2` branch (or main branch)

### Step 3: Deployment Configuration

**Service Type**: Web Service
**Build Command**: `make build` (or `docker build`)
**Start Command**: `make up` (or custom start script)
**Port**: 8080 (HTTPS) or 8000 (HTTP)

### Step 4: Environment Variables

Set these in Render dashboard:
- `NODE_ENV=production`
- `PORT=8080`
- `DATABASE_PATH=/opt/render/project/src/database/transcendence.sqlite`

## 🔄 Team Workflow

### Automatic Deployments

When any team member:
1. **Pushes to main branch** → Render automatically deploys
2. **Merges pull request** → Render automatically deploys
3. **Creates a release** → Render deploys tagged version

### Manual Deployments

Team members can also trigger manual deployments:
- From Render dashboard
- Using Render CLI
- Via GitHub Actions

### Development Workflow

```bash
# Team member workflow
git clone https://github.com/BekRobot99/42-ft_transcendence.git
cd 42-ft_transcendence
git checkout -b feature/new-feature

# Make changes
make dev          # Test locally

# When ready
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Create pull request → merge → auto-deploy!
```

## 📋 Render.yaml Configuration

Render can use this file for automatic configuration:

```yaml
services:
  - type: web
    name: ft-transcendence
    env: docker
    plan: free  # or starter/pro
    region: oregon
    branch: ali2
    buildCommand: make build
    startCommand: make start-production
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT  
        value: 8080
    healthCheckPath: /
    autoDeploy: true
```

## 🎯 Make Commands for Production

Add these to your Makefile for Render compatibility:

```makefile
# Production commands for Render.com
start-production: ## Start for Render.com deployment
	@echo "🚀 Starting production server for Render..."
	@docker-compose up -d
	@echo "✅ Production server started!"

render-build: ## Build for Render.com
	@echo "🏗️ Building for Render deployment..."
	@docker-compose build --no-cache
	@echo "✅ Render build complete!"

health-check: ## Health check endpoint
	@curl -f http://localhost:8080/health || exit 1
```
