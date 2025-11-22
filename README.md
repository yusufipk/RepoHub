# RepoHub - Cross-Platform Package Manager

**Simplify software installation across Linux, Windows, and macOS with official repositories.**

RepoHub provides a unified interface for package discovery and installation across different operating systems.

## 🚀 Features

-   **Cross-Platform Support**: Works on Linux (Debian, Ubuntu, Arch, Fedora), Windows, and macOS.
-   **Official Repositories**: Access software strictly from trusted, official sources.
-   **Script Generation**: Generate idempotent installation scripts for your selected platform.
-   **Smart Filtering**: efficiently browse and filter packages.

## 🛠️ Technology Stack

### Frontend
-   **Framework**: Next.js 14+ (React)
-   **Styling**: Tailwind CSS
-   **Icons**: Lucide React
-   **State Management**: React Query + Zustand

### Backend
-   **Runtime**: Node.js (TypeScript)
-   **Database**: PostgreSQL
-   **Infrastructure**: Docker

## 🏁 Getting Started

### Prerequisites

-   Node.js 18+
-   npm / pnpm / yarn
-   Docker (optional, for database)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yusufipk/RepoHub.git
    cd RepoHub
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Set up Environment Variables:**
    Copy `.env.example` to `.env` and configure your database connection.
    ```bash
    cp .env.example .env
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔄 API Usage

### Syncing Repositories

You can trigger a repository sync using the API. This is useful for updating the package database.

**Endpoint:** `POST /api/sync`

**Headers:**
- `Content-Type`: `application/json`
- `x-sync-secret`: Your sync secret key (required if `SYNC_SERVER_ONLY=true`)

**Body Parameters:**
- `platform`: The platform to sync. Options:
    - `debian`: Sync Debian packages (Official Repo)
    - `ubuntu`: Sync Ubuntu packages (Official Repo)
    - `arch`: Sync Arch Linux packages (Official Repo)
    - `fedora`: Sync Fedora packages (Official Repo)
    - `windows`: Sync Windows packages (Winget)
    - `macos`: Sync macOS packages (Homebrew)
    - `all`: Sync all platforms

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/sync \
  -H "Content-Type: application/json" \
  -H "x-sync-secret: your_secret_key" \
  -d '{"platform": "all"}'
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
