#!/bin/sh
set -e

echo "🚀 RepoHub Docker Container Starting..."

# Function to wait for PostgreSQL
wait_for_postgres() {
  echo "⏳ Waiting for PostgreSQL to be ready..."
  
  # Install pg temporarily for connection testing
  npm install -g pg > /dev/null 2>&1
  
  max_attempts=30
  attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if node -e "
      const { Pool } = require('pg');
      const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: 'postgres',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || ''
      });
      pool.query('SELECT 1')
        .then(() => {
          console.log('✅ PostgreSQL is ready');
          pool.end();
          process.exit(0);
        })
        .catch((err) => {
          console.error('Waiting...', err.message);
          pool.end();
          process.exit(1);
        });
    " 2>/dev/null; then
      echo "✅ PostgreSQL is ready!"
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

