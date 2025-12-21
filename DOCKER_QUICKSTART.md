# Docker Quick Start Guide

Get RepoHub running in less than 5 minutes with Docker!

## Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yusufipk/RepoHub.git
cd RepoHub
```

### 2. Setup Environment

```bash
cp .env.example .env
```

That's it! Default settings work out of the box.

### 3. Start the Application

```bash
docker-compose up -d
```

Or if you have Make installed:

```bash
make up
```

### 4. Access the Application

Open your browser and go to:

**http://localhost:3002**

## What Just Happened?

Docker Compose automatically:
- ✅ Downloaded PostgreSQL 16
- ✅ Created a database
- ✅ Built the Next.js application
- ✅ Applied database schema and migrations
- ✅ Started both services

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View running containers
docker-compose ps
```

With Make:

```bash
make logs     # View logs
make down     # Stop services
make restart  # Restart services
make status   # View status
```

## Development Mode

Want to develop with hot-reload?

```bash
# Start only database
make dev-db

# In another terminal
pnpm install
pnpm dev
```

Now you can edit code and see changes instantly!

## Need Help?

- 📖 Full guide: [DOCKER.md](./DOCKER.md)
- 🤝 Contributing: [CONTRIBUTING.md](./CONTRIBUTING.md)
- 📚 Main docs: [README.md](./README.md)

## Troubleshooting

### Port 3002 already in use?

```bash
# Find what's using the port
lsof -i :3002  # macOS/Linux

# Or change port in docker-compose.yml
# Change "3002:3002" to "3003:3002"
```

### Database connection issues?

```bash
# Check if PostgreSQL is healthy
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres
```

### Want to start fresh?

```bash
# Remove everything (⚠️ destroys data!)
docker-compose down -v

# Start again
docker-compose up -d
```

## Next Steps

1. 🎨 Customize your `.env` file
2. 📦 Sync package repositories (see README.md)
3. 🚀 Deploy to production (see DOCKER.md)
4. 🤝 Contribute to the project (see CONTRIBUTING.md)

---

**Happy coding! 🎉**
