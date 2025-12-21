.PHONY: help build up down logs restart clean dev-db stop status shell db-shell test validate

# Default target
help:
	@echo "RepoHub - Docker Management Commands"
	@echo ""
	@echo "Production Commands:"
	@echo "  make build        - Build Docker images"
	@echo "  make up           - Start all services (production)"
	@echo "  make down         - Stop all services"
	@echo "  make restart      - Restart all services"
	@echo "  make logs         - View logs (follow mode)"
	@echo "  make status       - Show container status"
	@echo "  make stop         - Stop containers without removing"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev-db       - Start only database for local development"
	@echo "  make dev-down     - Stop development database"
	@echo ""
	@echo "Shell Access:"
	@echo "  make shell        - Access app container shell"
	@echo "  make db-shell     - Access PostgreSQL shell"
	@echo ""
	@echo "Maintenance Commands:"
	@echo "  make clean        - Remove containers and volumes (⚠️  destroys data!)"
	@echo "  make validate     - Validate package presets"
	@echo "  make db-backup    - Backup database to backup.sql"
	@echo "  make db-restore   - Restore database from backup.sql"
	@echo ""
	@echo "Testing:"
	@echo "  make test         - Run tests"
	@echo ""

# Production commands
build:
	@echo "🔨 Building Docker images..."
	docker-compose build

up:
	@echo "🚀 Starting RepoHub (production mode)..."
	docker-compose up -d
	@echo "✅ Services started! Application available at http://localhost:3002"

down:
	@echo "🛑 Stopping all services..."
	docker-compose down

restart:
	@echo "🔄 Restarting services..."
	docker-compose restart

logs:
	@echo "📋 Showing logs (Ctrl+C to exit)..."
	docker-compose logs -f

status:
	@echo "📊 Container status:"
	docker-compose ps

stop:
	@echo "⏸️  Stopping containers..."
	docker-compose stop

# Development commands
dev-db:
	@echo "🔧 Starting development database..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ Database started! Connect at localhost:5432"
	@echo "ℹ️  Set DB_HOST=localhost in your .env file"
	@echo "ℹ️  Run 'pnpm dev' to start the application locally"

dev-down:
	@echo "🛑 Stopping development database..."
	docker-compose -f docker-compose.dev.yml down

# Shell access
shell:
	@echo "🐚 Accessing app container shell..."
	docker-compose exec app sh

db-shell:
	@echo "🐘 Accessing PostgreSQL shell..."
	docker-compose exec postgres psql -U repohub_user -d repohub

# Maintenance
clean:
	@echo "⚠️  WARNING: This will remove all containers and volumes!"
	@echo "⚠️  All database data will be lost!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "🗑️  Cleaning up..."; \
		docker-compose down -v; \
		echo "✅ Cleanup complete"; \
	else \
		echo "❌ Cleanup cancelled"; \
	fi

validate:
	@echo "🔍 Validating package presets..."
	pnpm run validate:presets -- --all

db-backup:
	@echo "💾 Creating database backup..."
	docker-compose exec -T postgres pg_dump -U repohub_user repohub > backup.sql
	@echo "✅ Backup saved to backup.sql"

db-restore:
	@echo "📥 Restoring database from backup.sql..."
	@if [ ! -f backup.sql ]; then \
		echo "❌ backup.sql not found!"; \
		exit 1; \
	fi
	cat backup.sql | docker-compose exec -T postgres psql -U repohub_user -d repohub
	@echo "✅ Database restored"

# Testing
test:
	@echo "🧪 Running tests..."
	pnpm run type-check
	@echo "✅ Tests complete"

# Quick start helper
quick-start: build up
	@echo ""
	@echo "🎉 RepoHub is now running!"
	@echo "📱 Application: http://localhost:3002"
	@echo "🐘 PostgreSQL: localhost:5432"
	@echo ""
	@echo "Run 'make logs' to view logs"
	@echo "Run 'make help' for more commands"

