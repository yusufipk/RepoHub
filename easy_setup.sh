#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

if [ ! -f package.json ] || [ ! -f pnpm-lock.yaml ]; then
  echo "This script must be run from the RepoHub project root."
  exit 1
fi

ENV_EXISTED=0
OLD_DB_HOST=""
OLD_DB_PORT=""
OLD_DB_NAME=""
OLD_DB_USER=""
OLD_DB_PASSWORD=""
OLD_FRONTEND_PORT=""

if [ -f .env ]; then
  ENV_EXISTED=1
  OLD_DB_HOST=$(grep '^DB_HOST=' .env | tail -n1 | cut -d= -f2-)
  OLD_DB_PORT=$(grep '^DB_PORT=' .env | tail -n1 | cut -d= -f2-)
  OLD_DB_NAME=$(grep '^DB_NAME=' .env | tail -n1 | cut -d= -f2-)
  OLD_DB_USER=$(grep '^DB_USER=' .env | tail -n1 | cut -d= -f2-)
  OLD_DB_PASSWORD=$(grep '^DB_PASSWORD=' .env | tail -n1 | cut -d= -f2-)
  LINE=$(grep '^NEXTAUTH_URL=' .env | tail -n1 || true)
  if [ -n "$LINE" ]; then
    URL=${LINE#NEXTAUTH_URL=}
    URL=${URL#\"}
    URL=${URL%\"}
    if echo "$URL" | grep -q ':[0-9][0-9]*'; then
      OLD_FRONTEND_PORT=${URL##*:}
    fi
  fi
fi

FRONTEND_PORT_DEFAULT=${OLD_FRONTEND_PORT:-3002}
DB_HOST_DEFAULT=${OLD_DB_HOST:-localhost}
DB_PORT_DEFAULT=${OLD_DB_PORT:-5432}
DB_NAME_DEFAULT=${OLD_DB_NAME:-repohub}
DB_USER_DEFAULT=${OLD_DB_USER:-repohub}

echo
echo "======================="
echo " RepoHub easy setup"
echo "======================="
echo

read -p "Frontend port [${FRONTEND_PORT_DEFAULT}]: " FRONTEND_PORT
if [ -z "$FRONTEND_PORT" ]; then
  FRONTEND_PORT=$FRONTEND_PORT_DEFAULT
fi

read -p "Database host [${DB_HOST_DEFAULT}]: " DB_HOST
if [ -z "$DB_HOST" ]; then
  DB_HOST=$DB_HOST_DEFAULT
fi

read -p "Database port [${DB_PORT_DEFAULT}]: " DB_PORT
if [ -z "$DB_PORT" ]; then
  DB_PORT=$DB_PORT_DEFAULT
fi

read -p "Database name [${DB_NAME_DEFAULT}]: " DB_NAME
if [ -z "$DB_NAME" ]; then
  DB_NAME=$DB_NAME_DEFAULT
fi

read -p "Database user [${DB_USER_DEFAULT}]: " DB_USER
if [ -z "$DB_USER" ]; then
  DB_USER=$DB_USER_DEFAULT
fi

DB_PASSWORD=""
PASSWORD_CHANGED=0

if [ "$ENV_EXISTED" -eq 1 ] && [ -n "$OLD_DB_PASSWORD" ]; then
  printf "Database password (empty = keep current): "
  stty -echo
  read DB_PASSWORD_INPUT
  stty echo
  echo
  if [ -z "$DB_PASSWORD_INPUT" ]; then
    DB_PASSWORD="$OLD_DB_PASSWORD"
    PASSWORD_CHANGED=0
  else
    DB_PASSWORD="$DB_PASSWORD_INPUT"
    PASSWORD_CHANGED=1
  fi
else
  printf "Database password (leave empty to auto-generate): "
  stty -echo
  read DB_PASSWORD_INPUT
  stty echo
  echo
  if [ -z "$DB_PASSWORD_INPUT" ]; then
    DB_PASSWORD=$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 24)
    echo "Generated database password: ${DB_PASSWORD}"
    PASSWORD_CHANGED=1
  else
    DB_PASSWORD="$DB_PASSWORD_INPUT"
    PASSWORD_CHANGED=1
  fi
fi

echo
read -p "Use Docker to run PostgreSQL? [Y/n]: " USE_DOCKER
if [ -z "$USE_DOCKER" ]; then
  USE_DOCKER=Y
fi

echo
echo "Available platforms: debian ubuntu arch aur fedora homebrew winget windows macos all"
read -p "Initial platforms to sync (space separated, empty to skip): " SYNC_PLATFORMS
echo

USER_CHANGED=0
NAME_CHANGED=0
PORT_CHANGED=0

if [ "$ENV_EXISTED" -eq 1 ]; then
  if [ "$DB_USER" != "$OLD_DB_USER" ]; then
    USER_CHANGED=1
  fi
  if [ "$DB_NAME" != "$OLD_DB_NAME" ]; then
    NAME_CHANGED=1
  fi
  if [ "$DB_PORT" != "$OLD_DB_PORT" ]; then
    PORT_CHANGED=1
  fi
fi

echo "[1/4] Writing .env configuration..."

if [ ! -f .env ]; then
  cp .env.example .env
fi

sed -i "s/^DB_HOST=.*/DB_HOST=${DB_HOST}/" .env
sed -i "s/^DB_PORT=.*/DB_PORT=${DB_PORT}/" .env
sed -i "s/^DB_NAME=.*/DB_NAME=${DB_NAME}/" .env
sed -i "s/^DB_USER=.*/DB_USER=${DB_USER}/" .env
sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" .env
sed -i "s|^NEXTAUTH_URL=.*|NEXTAUTH_URL=http://localhost:${FRONTEND_PORT}|" .env
sed -i "s|^API_BASE_URL=.*|API_BASE_URL=http://localhost:${FRONTEND_PORT}/api|" .env

if grep -q '^REPOHUB_SYNC_PLATFORMS=' .env; then
  sed -i "s|^REPOHUB_SYNC_PLATFORMS=.*|REPOHUB_SYNC_PLATFORMS=\"${SYNC_PLATFORMS}\"|" .env
else
  echo "REPOHUB_SYNC_PLATFORMS=\"${SYNC_PLATFORMS}\"" >> .env
fi

export REPOHUB_PORT="$FRONTEND_PORT"

echo "[2/4] Aligning dev script and Tauri devUrl with port ${FRONTEND_PORT}..."

node << 'EOF'
const fs = require('fs');
const path = require('path');

const port = process.env.REPOHUB_PORT || '3002';

const pkgPath = path.join(process.cwd(), 'package.json');
const pkgRaw = fs.readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(pkgRaw);
if (!pkg.scripts) pkg.scripts = {};
const devScript = pkg.scripts.dev || 'next dev';
const parts = devScript.split(' ');
const pIndex = parts.indexOf('-p');
const portIndex = parts.indexOf('--port');
if (pIndex !== -1 && parts.length > pIndex + 1) {
  parts[pIndex + 1] = port;
} else if (portIndex !== -1 && parts.length > portIndex + 1) {
  parts[portIndex + 1] = port;
} else {
  parts.push('-p', port);
}
pkg.scripts.dev = parts.join(' ');
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

const cfgPath = path.join(process.cwd(), 'src-tauri', 'tauri.conf.json');
if (fs.existsSync(cfgPath)) {
  const cfgRaw = fs.readFileSync(cfgPath, 'utf8');
  const cfg = JSON.parse(cfgRaw);
  if (!cfg.build) cfg.build = {};
  cfg.build.devUrl = `http://localhost:${port}`;
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
}
EOF

echo "[3/4] Ensuring PostgreSQL is running..."

DB_READY=0
DOCKER_ID=""

if [ "$USE_DOCKER" = "Y" ] || [ "$USE_DOCKER" = "y" ]; then
  if ! command -v docker >/dev/null 2>&1; then
    echo "Docker not found, skipping PostgreSQL container."
  else
    CONTAINER_EXISTS=0
    if docker ps -a --format '{{.Names}}' | grep -q '^repohub-db$'; then
      CONTAINER_EXISTS=1
    fi
    if [ "$CONTAINER_EXISTS" -eq 1 ] && { [ "$PASSWORD_CHANGED" -eq 1 ] || [ "$USER_CHANGED" -eq 1 ] || [ "$NAME_CHANGED" -eq 1 ] || [ "$PORT_CHANGED" -eq 1 ]; }; then
      echo "Existing PostgreSQL container 'repohub-db' detected."
      echo "Database settings changed. To apply them, the container must be recreated."
      read -p "Recreate PostgreSQL container now? [y/N]: " RECREATE
      if [ "$RECREATE" = "y" ] || [ "$RECREATE" = "Y" ]; then
        docker rm -f repohub-db >/dev/null 2>&1 || true
        CONTAINER_EXISTS=0
      fi
    fi
    if [ "$CONTAINER_EXISTS" -eq 0 ]; then
      docker run -d \
        --name repohub-db \
        -e POSTGRES_DB="${DB_NAME}" \
        -e POSTGRES_USER="${DB_USER}" \
        -e POSTGRES_PASSWORD="${DB_PASSWORD}" \
        -p "${DB_PORT}:5432" \
        postgres:16
    fi
    DOCKER_ID=$(docker inspect -f '{{.Id}}' repohub-db 2>/dev/null || echo "")
    if [ -n "$DOCKER_ID" ]; then
      echo "$DOCKER_ID" > .docker_id
    fi
    if ! docker ps --format '{{.ID}}' | grep -q "$(echo "$DOCKER_ID" | cut -c1-12)"; then
      docker start "$DOCKER_ID" >/dev/null
    fi
    echo "Waiting for PostgreSQL to be ready..."
    for i in $(seq 1 30); do
      if docker exec "$DOCKER_ID" pg_isready -U "${DB_USER}" -d "${DB_NAME}" >/dev/null 2>&1; then
        DB_READY=1
        break
      fi
      sleep 1
    done
    if [ "$DB_READY" -eq 1 ]; then
      echo "PostgreSQL is ready."
    else
      echo "PostgreSQL did not become ready in time."
    fi
  fi
else
  rm -f .docker_id || true
  echo "Docker not selected. Make sure a PostgreSQL instance is running with the same .env settings."
fi

echo "[4/4] Applying schema, migrations and installing dependencies..."
: > setup-init-db.log

if [ -n "$DOCKER_ID" ] && [ "$DB_READY" -eq 1 ]; then
  set +e
  docker exec "$DOCKER_ID" psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT to_regclass('public.packages');" >>setup-init-db.log 2>&1
  CHECK_STATUS=$?
  set -e
  if [ "$CHECK_STATUS" -eq 0 ]; then
    TABLE_EXISTS=$(docker exec "$DOCKER_ID" psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT to_regclass('public.packages');" 2>>setup-init-db.log | tr -d '[:space:]')
    if [ "$TABLE_EXISTS" = "public.packages" ]; then
      echo "Schema already exists, skipping creation."
    else
      set +e
      docker exec -i "$DOCKER_ID" psql -U "$DB_USER" -d "$DB_NAME" < src/lib/database/schema.sql >>setup-init-db.log 2>&1
      for f in scripts/migrations/*.sql; do
        if [ -f "$f" ]; then
          docker exec -i "$DOCKER_ID" psql -U "$DB_USER" -d "$DB_NAME" < "$f" >>setup-init-db.log 2>&1
        fi
      done
      set -e
      echo "Schema and migrations applied."
    fi
  else
    echo "Could not check existing schema. See setup-init-db.log for details."
  fi
else
  echo "Skipping automatic schema apply because Docker container is not available or database is not ready."
fi

pnpm install

echo
echo "======================="
echo " Setup complete"
echo "======================="
echo
echo "Frontend URL: http://localhost:${FRONTEND_PORT}"
echo
echo "Database settings written to .env:"
echo "  DB_HOST=${DB_HOST}"
echo "  DB_PORT=${DB_PORT}"
echo "  DB_NAME=${DB_NAME}"
echo "  DB_USER=${DB_USER}"
echo "  DB_PASSWORD=${DB_PASSWORD}"
echo

if [ -n "${SYNC_PLATFORMS}" ]; then
  echo "Selected platforms to sync: ${SYNC_PLATFORMS}"
  echo "After starting the app you can sync via the UI or with:"
  echo "  curl -X POST \"http://localhost:${FRONTEND_PORT}/api/sync\" \\"
  echo "    -H \"Content-Type: application/json\" \\"
  echo "    -d '{\"platform\": \"${SYNC_PLATFORMS}\"}'"
  echo
fi

echo ".env, dev script, Tauri devUrl, Docker container and schema are now consistent."
