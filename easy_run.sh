#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

DOCKER_TARGET=""

if command -v docker >/dev/null 2>&1; then
  if [ -f .docker_id ]; then
    DOCKER_TARGET="$(cat .docker_id)"
  elif [ -f .repohub_docker_id ]; then
    DOCKER_TARGET="$(cat .repohub_docker_id)"
  else
    DOCKER_TARGET="repohub-db"
  fi
  set +e
  docker start "$DOCKER_TARGET" >/dev/null 2>&1
  set -e
fi

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

PORT="3002"
if [ -n "${NEXTAUTH_URL:-}" ]; then
  URL="${NEXTAUTH_URL#\"}"
  URL="${URL%\"}"
  if echo "$URL" | grep -q ':[0-9][0-9]*'; then
    PORT="${URL##*:}"
    PORT="${PORT%%/*}"
  fi
fi

FRONTEND_PORT="$PORT"

NEED_DEV=1
if command -v ss >/dev/null 2>&1; then
  if ss -ltn 2>/dev/null | grep -q ":${FRONTEND_PORT} "; then
    NEED_DEV=0
  fi
elif command -v lsof >/dev/null 2>&1; then
  if lsof -i :"${FRONTEND_PORT}" >/dev/null 2>&1; then
    NEED_DEV=0
  fi
fi

DEV_PID=""
if [ "$NEED_DEV" -eq 1 ]; then
  pnpm dev --port "$FRONTEND_PORT" > .next-dev.log 2>&1 &
  DEV_PID=$!
  sleep 5
fi

TAURI_BIN="$ROOT_DIR/src-tauri/target/debug/repohub-tauri"
if [ ! -x "$TAURI_BIN" ]; then
  cd "$ROOT_DIR/src-tauri"
  cargo build --no-default-features
  cd "$ROOT_DIR"
fi

cd "$ROOT_DIR/src-tauri"
"$TAURI_BIN"

if [ -n "$DEV_PID" ]; then
  kill "$DEV_PID" 2>/dev/null || true
fi

if command -v docker >/dev/null 2>&1; then
  set +e
  if [ -n "$DOCKER_TARGET" ]; then
    docker stop "$DOCKER_TARGET" >/dev/null 2>&1 || docker stop repohub-db >/dev/null 2>&1 || true
  else
    docker stop repohub-db >/dev/null 2>&1 || true
  fi
  set -e
fi
