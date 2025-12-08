# Changelog

All notable changes to RepoHub will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Docker support for easy deployment and development
  - Multi-stage Dockerfile for optimized production builds
  - docker-compose.yml for production environment
  - docker-compose.dev.yml for development environment
  - Automatic database initialization on container startup
  - Health checks for both application and database
- Comprehensive documentation
  - DOCKER.md with detailed Docker deployment guide
  - CONTRIBUTING.md with contribution guidelines (English & Turkish)
  - Enhanced README.md with Docker installation instructions
  - Enhanced README.tr.md with Docker installation instructions (Turkish)
- Development tools
  - Makefile with convenient commands for Docker management
  - .env.example with all configuration options
  - .env.local.example for local development setup
- Docker entrypoint script with PostgreSQL health check
- .dockerignore for optimized Docker builds

### Changed
- next.config.js now includes standalone output mode for Docker
- .gitignore updated to allow .env.example files
- Port changed from 3000 to 3002 in documentation

### Infrastructure
- PostgreSQL 16 Alpine as database image
- Node.js 20 Alpine as application base image
- Persistent volumes for database data
- Bridge network for inter-container communication
- Optimized multi-stage builds (~200MB final image)

## Previous Changes

See git history for changes before Docker implementation:
```bash
git log --oneline
```

