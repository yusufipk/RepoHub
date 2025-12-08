# Docker Deployment Guide

This guide provides detailed instructions for deploying RepoHub using Docker.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Production Deployment](#production-deployment)
- [Development Setup](#development-setup)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/yusufipk/RepoHub.git
cd RepoHub
cp .env.example .env

# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Access the application at http://localhost:3002
```

## 🏗️ Architecture

The Docker setup consists of two main services:

### Services

1. **postgres** - PostgreSQL 16 Alpine
   - Database for storing package information
   - Persistent volume for data storage
   - Health checks enabled
   - Port: 5432

2. **app** - Next.js Application
   - Multi-stage build for optimization
   - Automatic database initialization
   - Health checks enabled
   - Port: 3002

### Volumes

- `postgres-data` - Persistent storage for PostgreSQL data

### Networks

- `repohub-network` - Bridge network for inter-container communication

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database Configuration
DB_HOST=postgres              # Use 'postgres' for Docker, 'localhost' for local dev
DB_PORT=5432
DB_NAME=repohub
DB_USER=repohub_user
DB_PASSWORD=repohub_password  # Change in production!

# Next.js Configuration
NODE_ENV=production           # Use 'development' for dev mode
NEXT_PUBLIC_API_URL=http://localhost:3002

# Sync Configuration (Optional)
SYNC_SERVER_ONLY=false        # Set to 'true' to require authentication
SYNC_SECRET=your-secret-key   # Required if SYNC_SERVER_ONLY=true
```

### Security Recommendations

For production deployments:

1. **Change default credentials:**
   ```bash
   DB_USER=your_secure_username
   DB_PASSWORD=your_very_secure_password_here
   ```

2. **Enable sync authentication:**
   ```bash
   SYNC_SERVER_ONLY=true
   SYNC_SECRET=generate_a_long_random_secret_key
   ```

3. **Use strong passwords:**
   - Use a password manager to generate strong passwords
   - Minimum 32 characters for secrets
   - Mix of uppercase, lowercase, numbers, and symbols

## 🚀 Production Deployment

### Using docker-compose.yml

The main `docker-compose.yml` is optimized for production:

```bash
# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove all data (⚠️ Warning: destroys database!)
docker-compose down -v
```

### Build Process

The Dockerfile uses a multi-stage build:

1. **deps stage** - Installs dependencies
2. **builder stage** - Builds the Next.js application
3. **runner stage** - Creates minimal production image

Total image size: ~200MB (optimized)

### Database Initialization

The application automatically:
1. Waits for PostgreSQL to be ready
2. Creates the database if it doesn't exist
3. Applies the schema
4. Runs all pending migrations

This happens automatically when the container starts.

## 🛠️ Development Setup

### Option 1: Database Only in Docker

Run only PostgreSQL in Docker, run the app locally:

```bash
# Start database
docker-compose -f docker-compose.dev.yml up -d

# In .env, set:
# DB_HOST=localhost

# Install dependencies and run
pnpm install
pnpm dev

# Application runs at http://localhost:3002 with hot-reload
```

Benefits:
- Hot-reload enabled
- Faster iteration
- Direct access to source code
- Easy debugging

### Option 2: Full Stack in Docker with Development Mode

```bash
# Build with development mode
docker-compose -f docker-compose.yml up -d --build

# The app will run in production mode
# For development mode, you'll need to modify the Dockerfile
```

## 🐛 Troubleshooting

### Container won't start

```bash
# Check container logs
docker-compose logs app
docker-compose logs postgres

# Check container status
docker-compose ps

# Restart containers
docker-compose restart
```

### Database connection issues

```bash
# Verify PostgreSQL is running
docker-compose exec postgres pg_isready -U repohub_user -d repohub

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection manually
docker-compose exec postgres psql -U repohub_user -d repohub -c "SELECT version();"
```

### Port already in use

```bash
# Find what's using port 3002
lsof -i :3002  # macOS/Linux
netstat -ano | findstr :3002  # Windows

# Change port in .env or docker-compose.yml
# For example, use 3003:3002 in docker-compose.yml
```

### Application not accessible

1. **Check if containers are running:**
   ```bash
   docker-compose ps
   ```

2. **Check if ports are exposed:**
   ```bash
   docker-compose port app 3002
   ```

3. **Check application logs:**
   ```bash
   docker-compose logs -f app
   ```

4. **Check health status:**
   ```bash
   docker inspect repohub-app | grep Health
   ```

### Reset everything

```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker-compose down --rmi all -v

# Start fresh
docker-compose up -d --build
```

## 🔧 Advanced Usage

### Running Database Migrations

Migrations run automatically on startup, but you can run them manually:

```bash
# Enter the container
docker-compose exec app sh

# Run migrations
node scripts/init-db.js
```

### Accessing the Database

```bash
# Using psql
docker-compose exec postgres psql -U repohub_user -d repohub

# Export database
docker-compose exec postgres pg_dump -U repohub_user repohub > backup.sql

# Import database
cat backup.sql | docker-compose exec -T postgres psql -U repohub_user -d repohub
```

### Syncing Packages

```bash
# Sync all platforms
curl -X POST http://localhost:3002/api/sync \
  -H "Content-Type: application/json" \
  -d '{"platform": "all"}'

# Sync specific platform
curl -X POST http://localhost:3002/api/sync \
  -H "Content-Type: application/json" \
  -d '{"platform": "ubuntu"}'

# With authentication (if SYNC_SERVER_ONLY=true)
curl -X POST http://localhost:3002/api/sync \
  -H "Content-Type: application/json" \
  -H "x-sync-secret: your-secret-key" \
  -d '{"platform": "all"}'
```

### Custom Build

Build with custom tag:

```bash
# Build custom image
docker build -t repohub:custom .

# Run with custom image
docker run -d \
  --name repohub-custom \
  -p 3002:3002 \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_NAME=repohub \
  -e DB_USER=repohub_user \
  -e DB_PASSWORD=repohub_password \
  repohub:custom
```

### Health Checks

The application includes health checks:

```bash
# Check application health
curl http://localhost:3002/api/platforms

# Check database health
docker-compose exec postgres pg_isready -U repohub_user -d repohub
```

### Viewing Metrics

```bash
# Container stats
docker stats repohub-app repohub-postgres

# Detailed container info
docker inspect repohub-app
docker inspect repohub-postgres
```

### Scaling (Future)

For multiple instances:

```bash
# Scale the application (requires load balancer setup)
docker-compose up -d --scale app=3
```

## 📊 Monitoring

### Logs

```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100

# With timestamps
docker-compose logs -f --timestamps
```

### Resource Usage

```bash
# Real-time stats
docker stats repohub-app repohub-postgres

# Disk usage
docker system df

# Detailed volume info
docker volume inspect repohub_postgres-data
```

## 🔐 Security Best Practices

1. **Never commit `.env` file**
2. **Use strong passwords in production**
3. **Enable sync authentication in production**
4. **Regularly update base images:**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```
5. **Limit container capabilities**
6. **Use Docker secrets for sensitive data (in Swarm mode)**
7. **Keep Docker and Docker Compose updated**
8. **Regular backups of database volume**

## 🆘 Getting Help

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify configuration in `.env`
3. Check [GitHub Issues](https://github.com/yusufipk/RepoHub/issues)
4. Read the main [README.md](./README.md)

## 📝 License

This project is part of RepoHub. See [LICENSE](./LICENSE) for details.

