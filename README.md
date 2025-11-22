# RepoHub Desktop (Tauri + Next.js)

RepoHub is a cross‑platform package discovery and script generator for Linux, Windows and macOS.  
This fork adds a **desktop app** using **Tauri** and provides a **one‑command setup** for the database and development environment.

> Goal: a user should be able to clone the repo, run `./easy_setup.sh` once, then use `./easy_run.sh` to start the desktop app without touching PostgreSQL or manual config.

---

## Features

- Cross‑platform UI (Next.js + Tailwind, bundled with Tauri)
- PostgreSQL database (via Docker or your local instance)
- Easy setup script (`easy_setup.sh`)
  - Asks for ports and DB info
  - Creates / updates `.env`
  - Starts (or recreates) a `postgres:16` Docker container if you want
  - Applies schema + migrations automatically
  - Installs JS dependencies (`pnpm install`)
- Easy run script (`easy_run.sh`)
  - Starts PostgreSQL container
  - Starts Next.js dev server on the correct port (if not already running)
  - Builds the Tauri binary on first run (or when sources change)
  - Launches the RepoHub desktop window
  - Stops the PostgreSQL container when you close the app

---

## Requirements

You need the following on your system:

- **Node.js** 18+
- **pnpm**
- **Rust toolchain** (stable) – for Tauri / Rust side
- **Tauri CLI** (optional but recommended)
- **Docker** (optional, but recommended for easiest PostgreSQL setup)
- A supported OS:
  - Linux (KDE/GNOME etc.)
  - Windows
  - macOS

> If you already have a PostgreSQL server and don’t want Docker, you can disable it during `easy_setup.sh`.

---

## 1. Clone the repository

```bash
git clone https://github.com/your-user/repohub.git
cd repohub
```

(Replace `your-user` with your fork’s URL.)

---

## 2. Make helper scripts executable

This fork ships with two helper scripts in the project root:

- `easy_setup.sh`
- `easy_run.sh`

Make them executable:

```bash
chmod +x easy_setup.sh easy_run.sh
```

---

## 3. One‑time setup (`easy_setup.sh`)

Run:

```bash
./easy_setup.sh
```

You will be asked a few questions:

### 3.1 Frontend port

```text
Frontend port [3002]:
```

- Press Enter to keep `3002`
- Or type another port (for example `4000`)

This port is used for:

- `NEXTAUTH_URL`
- `API_BASE_URL`
- Next.js dev server
- Tauri `devUrl`

### 3.2 Database connection

```text
Database host [localhost]:
Database port [5432]:
Database name [repohub]:
Database user [repohub]:
Database password (leave empty to auto-generate):
```

- Host: usually `localhost`
- Port: default `5432`
- Name/user: `repohub` is fine for local dev
- Password:
  - leave empty → a random strong password is generated and shown once
  - or type your own

All of these values are written into `.env`:

```env
DB_HOST=...
DB_PORT=...
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
NEXTAUTH_URL=http://localhost:PORT
API_BASE_URL=http://localhost:PORT/api
REPOHUB_SYNC_PLATFORMS="..."
```

### 3.3 Use Docker for PostgreSQL

```text
Use Docker to run PostgreSQL? [Y/n]:
```

- `Enter` or `Y`:
  - A Docker container called `repohub-db` is created (or reused)
  - Image: `postgres:16`
  - Exposed port: your `DB_PORT` from `.env`
  - Credentials: `DB_NAME`, `DB_USER`, `DB_PASSWORD` from `.env`
- `n`:
  - No container is created
  - You must run your own PostgreSQL instance with the same settings from `.env`

### 3.4 Platforms to sync (optional)

```text
Available platforms: debian ubuntu arch aur fedora homebrew winget windows macos all
Initial platforms to sync (space separated, empty to skip): arch
```

- This sets `REPOHUB_SYNC_PLATFORMS` in `.env`
- You can later trigger syncs via the UI or `POST /api/sync`

### 3.5 What `easy_setup.sh` does internally

When you confirm everything, `easy_setup.sh` will:

1. Write/update `.env` with your answers
2. Align:
   - `package.json` dev script port
   - `src-tauri/tauri.conf.json` `build.devUrl`
3. Start or recreate the `repohub-db` Docker container (if enabled)
4. Wait for PostgreSQL to be ready
5. Apply `src/lib/database/schema.sql` and all SQL migrations in `scripts/migrations/`
6. Run `pnpm install`

At the end you will see a summary:

- Frontend URL
- DB connection values
- Selected platforms (if any)

You only need to run `easy_setup.sh` again if you change:

- Database host/port/name/user/password
- Frontend port
- Or if you want to recreate the DB container

---

## 4. Running the desktop app (`easy_run.sh`)

After setup, you can start the RepoHub desktop app with:

```bash
./easy_run.sh
```

This script handles everything:

1. **PostgreSQL**
   - Reads the Docker container ID from `.docker_id` (or falls back to `repohub-db`)
   - Starts the container if it is not running
2. **Next.js dev server**
   - Reads `NEXTAUTH_URL` from `.env`
   - Extracts the port (e.g. `3002`)
   - If nothing is listening on that port, runs:
     ```bash
     pnpm dev --port PORT
     ```
   - Logs are written to `.next-dev.log`
3. **Tauri binary**
   - Checks `src-tauri/target/debug/repohub-tauri`
   - If it does not exist, runs a one‑time build:
     ```bash
     cd src-tauri
     cargo build --no-default-features
     ```
   - Then launches the Tauri app window using that binary
4. **Shutdown logic**
   - When you close the Tauri window:
     - The temporary Next.js dev process (if started by the script) is killed
     - The PostgreSQL Docker container is stopped

So for day‑to‑day usage:

```bash
./easy_run.sh
```

is all you need.

---

## 5. Web‑only mode (without Tauri)

If you just want to run the web app in a browser:

1. Ensure PostgreSQL is running:
   - Either:
     ```bash
     docker start repohub-db
     ```
   - Or your own PostgreSQL instance with `.env` values

2. Run Next.js dev server:

   ```bash
   pnpm dev -p 3002
   ```

   (or your custom port)

3. Open in browser:

   - `http://localhost:3002`

---

## 6. Syncing platforms

When the app is running (via `./easy_run.sh` or `pnpm dev`):

- API endpoint to sync:

  ```bash
  curl -X POST "http://localhost:3002/api/sync"     -H "Content-Type: application/json"     -d '{"platform":"arch"}'
  ```

  or `"all"`, `"debian"`, `"ubuntu"`, `"aur"`, `"fedora"`, `"homebrew"`, `"winget"`, `"windows"`, `"macos"`.

- Sync can also be triggered from the UI (platform selector / sync actions).

---

## 7. Environment variables overview

**Database**

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=repohub
DB_USER=repohub
DB_PASSWORD=your_password_here
```

**Next.js / API**

```env
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your_secret_here
API_BASE_URL=http://localhost:3002/api
```

**GitHub Token**

```env
GITHUB_TOKEN="github_token_here"
```

Used for Winget package fetching.

**Sync behaviour**

```env
REPOHUB_SYNC_PLATFORMS="arch aur"
SYNC_SERVER_ONLY=false
AUTO_SYNC_DAYS=1
SYNC_SECRET_KEY=your_sync_secret_key_here
```

**Pruning**

```env
PRUNE_GRACE_DAYS=7
PRUNE_HARD_DELETE_DAYS=1
```

**Cryptomus (optional)**

```env
CRYPTOMUS_MERCHANT_ID=your_merchant_id_here
CRYPTOMUS_PAYMENT_API_KEY=your_payment_api_key_here
CRYPTOMUS_ENABLED=false
```

---

## 8. Building a release build (optional)

If you want a release build of the Tauri app:

```bash
cd src-tauri
cargo build --release
```

The binary will be in:

```text
src-tauri/target/release/repohub-tauri
```

If your `package.json` defines a `tauri:build` script, you can also use:

```bash
pnpm tauri:build
```

This will create OS‑specific bundles (AppImage, dmg, msi, etc.) according to Tauri’s config.

---

## 9. Resetting the local setup (if something breaks)

If you want to start over from a clean local state:

```bash
# stop and remove the DB container
docker rm -f repohub-db || true

# remove local IDs and logs
rm -f .docker_id .repohub_docker_id setup-init-db.log .next-dev.log

# optional: drop node_modules and rebuild
rm -rf node_modules
pnpm install
```

Then run:

```bash
./easy_setup.sh
./easy_run.sh
```

---

(this readme file reated by AI)
