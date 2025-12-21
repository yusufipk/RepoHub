#!/bin/sh
set -e

echo "🚀 RepoHub Docker Container Starting..."

# Function to wait for PostgreSQL
wait_for_postgres() {
  echo "⏳ Waiting for PostgreSQL to be ready..."
  
  max_attempts=30
  attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if nc -z ${DB_HOST:-postgres} ${DB_PORT:-5432}; then
      echo "✅ PostgreSQL port is open!"
      sleep 2  # Give it a moment to fully start
      return 0
    fi
    
    attempt=$((attempt + 1))
    echo "Attempt $attempt/$max_attempts - PostgreSQL not ready yet..."
    sleep 2
  done
  
  echo "❌ PostgreSQL did not become ready in time"
  exit 1
}

# Wait for PostgreSQL to be available
wait_for_postgres

# Initialize database
echo "🔧 Initializing database..."
if node scripts/init-db.js; then
  echo "✅ Database initialized successfully"
else
  echo "⚠️  Database initialization had some issues, but continuing..."
fi

# Execute the main command
echo "🎯 Starting application..."
exec "$@"

