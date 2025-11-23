# RepoHub - Cross-Platform Package Manager

**🇬🇧 English** | [🇹🇷 Türkçe](./README.tr.md)

**Simplify software installation across Linux, Windows, and macOS with official repositories.**

RepoHub provides a unified interface for package discovery and installation across different operating systems.

## 🚀 Features

-   **Cross-Platform Support**: Works on Linux (Debian, Ubuntu, Arch, Fedora), Windows, and macOS.
-   **Official Repositories**: Access software strictly from trusted, official sources.
-   **Package Icons**: Visual icons for popular packages for easy recognition.
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
-   pnpm
-   Docker (optional, for database)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yusufipk/RepoHub.git
    cd RepoHub
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up Environment Variables:**
    Copy `.env.example` to `.env` and configure your database connection.
    ```bash
    cp .env.example .env
    ```

4.  **Initialize the Database:**
    Run the initialization script to set up the database schema and apply migrations.
    ```bash
    pnpm init:db
    ```

5.  **Run the development server:**
    ```bash
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
    - `aur`: Sync Arch User Repository (AUR) packages
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

## 📦 Contributing to Package Recommendations

[🇹🇷 Türkçe README](./README.tr.md) | **🇬🇧 English**

RepoHub uses curated package lists to provide personalized recommendations to users. You can help improve these recommendations by adding packages!

### How to Add Packages

Package recommendations are stored in [/src/data/recommendationPresets.ts](./src/data/recommendationPresets.ts). Here's how to add a package:

#### 1. Find the Right Location

Navigate to the platform and category where your package belongs:

```typescript
export const PACKAGE_PRESETS = {
  windows: {
    development: ["Git.Git", "Microsoft.VisualStudioCode"],
    design: ["GIMP.GIMP", "Inkscape.Inkscape"],
    // ... other categories
  },
  // ... other platforms
}
```

**Available Platforms:**
- `windows` - Windows (Winget)
- `macos` - macOS (Homebrew)
- `ubuntu` - Ubuntu (APT)
- `debian` - Debian (APT)
- `arch` - Arch Linux (Pacman/AUR)
- `fedora` - Fedora (DNF)

**Available Categories:**
- `development` - Dev tools, IDEs, compilers
- `design` - Graphics, creative software
- `multimedia` - Media players, editors
- `system-tools` - System utilities
- `gaming` - Game launchers, platforms
- `productivity` - Office, browsers, productivity apps
- `education` - Educational software

#### 2. Get the Correct Package Name

**⚠️ CRITICAL:** Package names must match **exactly** as they appear in the database.

**Package name formats by platform:**

- **Windows**: `Publisher.PackageName` (e.g., `Microsoft.VisualStudioCode`)
- **macOS**: lowercase-with-hyphens (e.g., `visual-studio-code`)
- **Linux**: lowercase, varies by distro (e.g., `code`, `docker.io`)

#### 3. Verify the Package Exists

**Option A: Using the Validation Script (Recommended)**

If you have access to the database:

```bash
# Validate specific platform
npm run validate:presets -- windows

# Validate multiple platforms
npm run validate:presets -- ubuntu debian arch

# Validate all platforms
npm run validate:presets -- --all
```

The script will show:
- ✅ Packages found in database
- ❌ Packages not found
- 💡 Similar package suggestions

**Option B: Manual Verification**

If you don't have database access:

1. Search on the live RepoHub website
2. Find your package in the search results
3. Copy the **exact package name** displayed
4. Or check official package repositories:
   - Windows: [winget.run](https://winget.run/)
   - macOS: `brew search <package>`
   - Ubuntu/Debian: `apt search <package>`
   - Arch: [archlinux.org/packages](https://archlinux.org/packages/)
   - Fedora: [packages.fedoraproject.org](https://packages.fedoraproject.org/)

#### 4. Add the Package

Simply add the package name to the array:

```typescript
windows: {
  development: [
    "Git.Git",
    "Microsoft.VisualStudioCode",
    "Docker.DockerDesktop"  // ← Your new package
  ]
}
```

#### 5. Add an Icon (Optional)

To make the package look better in recommendations, add an icon mapping in `PACKAGE_ICONS`:

1.  Find the package slug on [Simple Icons](https://simpleicons.org/)
2.  Add it to the `PACKAGE_ICONS` object in [src/data/recommendationPresets.ts](./src/data/recommendationPresets.ts):

```typescript
export const PACKAGE_ICONS: Record<string, string> = {
  // ...
  "Docker.DockerDesktop": "docker", // Key matches package name, Value is Simple Icons slug
  // ...
};
```

If no icon is added, a default package icon will be used.

#### 6. Test Your Changes

1. Run validation:
   ```bash
   npm run validate:presets -- windows
   ```

2. Start the dev server:
   ```bash
   npm run dev
   ```

3. Test in the app:
   - Complete onboarding
   - Select the relevant category
   - Check if your package appears in recommendations

### Best Practices

**DO ✅**
- Verify package names using the validation script
- Add popular, well-maintained packages
- Test before submitting
- Use exact package names from official repos

**DON'T ❌**
- Don't guess package names
- Don't add deprecated packages
- Don't skip verification
- Don't add duplicates across categories

### Example Pull Request

```
Add Popular Development Tools to Windows Recommendations

- Added Docker.DockerDesktop to development
- Added Postman.Postman to development
- Validation: ✅ All packages verified (100% found)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
