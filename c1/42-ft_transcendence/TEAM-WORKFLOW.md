# 👥 Team Workflow Guide

## 🌐 Render.com Deployment Setup

### Quick Setup Steps

1. **Go to [render.com](https://render.com)**
2. **Connect your GitHub repository**
3. **Create new Web Service**
4. **Configure as follows:**
   - **Repository**: `BekRobot99/42-ft_transcendence`
   - **Branch**: `ali2`
   - **Build Command**: `make render-build`
   - **Start Command**: `./start-render.sh`
   - **Port**: `8080`

## 🔄 Team Development Workflow

### For New Team Members

```bash
# 1. Clone the repository
git clone https://github.com/BekRobot99/42-ft_transcendence.git
cd 42-ft_transcendence

# 2. Start local development
make install    # Check prerequisites  
make dev       # Start development environment

# 3. Make changes and test
# Edit files...
make dev-logs  # Check if everything works

# 4. Push changes (triggers auto-deploy)
git add .
git commit -m "Your changes"
git push origin ali2
```

### For Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Develop locally
make dev
# Make your changes...

# 3. Test thoroughly
make test
make health

# 4. Push feature branch
git push origin feature/your-feature-name

# 5. Create Pull Request on GitHub
# 6. After review and merge → Auto-deploy to Render!
```

## 🚀 Deployment Triggers

### Automatic Deployments
- ✅ **Push to `ali2` branch** → Immediate deploy
- ✅ **Merge Pull Request** → Immediate deploy  
- ✅ **GitHub Release** → Deploy tagged version

### Manual Deployments
- 🖱️ **Render Dashboard** → "Manual Deploy" button
- 📱 **Render Mobile App** → Deploy on-the-go
- ⌨️ **Render CLI** → `render deploy`

## 🛠️ Available Make Commands

### Local Development
```bash
make help          # Show all commands
make install       # Check prerequisites
make dev          # Start development (hot reload)
make up           # Start production locally
make logs         # View logs
make clean        # Clean up
```

### Render.com Specific  
```bash
make render-build    # Build for Render
make render-start    # Start for Render
make deploy-info     # Show deployment info
make health         # Check service health
```

## 🔧 Environment Configuration

### Local (.env.local)
```bash
NODE_ENV=development
PORT=8080
DATABASE_PATH=./database/transcendence.sqlite
```

### Render.com (Environment Variables)
```bash
NODE_ENV=production
PORT=8080  
DATABASE_PATH=/opt/render/project/src/database/transcendence.sqlite
```

## 📊 Monitoring & Debugging

### Check Deployment Status
1. **Render Dashboard** → Your service → "Events" tab
2. **Build Logs** → See build process
3. **Deploy Logs** → See startup process

### Debug Issues
```bash
# Local debugging
make logs           # Check local logs
make shell-backend  # Access backend container
make db            # Check database

# Render debugging
# Check Render dashboard logs
# Use Render shell access
```

## 🎯 Best Practices

### Code Quality
- ✅ Test locally with `make dev` before pushing
- ✅ Run `make test` before committing
- ✅ Use meaningful commit messages
- ✅ Create feature branches for new features

### Deployment
- 🚀 `ali2` branch is your production branch
- 🔄 Auto-deploy keeps your live site updated
- 📱 Monitor Render dashboard after deployments
- 🛡️ Use environment variables for sensitive data

### Team Coordination
- 💬 Communicate before pushing to `ali2`
- 📝 Use Pull Requests for code review
- 🏷️ Tag releases for major versions
- 📋 Update this guide when workflow changes

## 🆘 Troubleshooting

### Common Issues

**Build Fails on Render**
```bash
# Check render.yaml configuration
# Verify Dockerfile works locally
make render-build  # Test build command locally
```

**Service Won't Start**
```bash
# Check start-render.sh script
# Verify port configuration (8080)
make render-start  # Test start command locally
```

**Database Issues**
```bash
# Render provides persistent disk storage
# Database file: /opt/render/project/src/database/transcendence.sqlite
```

**SSL Certificate Issues**
- Render automatically provides HTTPS
- No need for custom SSL certificates
- Remove local certificate setup for Render

## 🎉 Success Checklist

- [ ] Repository connected to Render
- [ ] Auto-deploy configured on `ali2` branch
- [ ] Team members can push and trigger deploys
- [ ] Make commands work for local development
- [ ] Render service starts successfully
- [ ] Website accessible on Render URL
- [ ] Database persists between deployments
