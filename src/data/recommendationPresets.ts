import { UserCategory } from "@/types/recommendations";

/**
 * Curated package recommendations for each platform and category
 * Simple structure: Platform → Category → Package names
 * 
 * Edit this file to add/remove packages for each platform/category combination
 */

type PlatformId = "windows" | "macos" | "ubuntu" | "debian" | "arch" | "fedora";

export const PACKAGE_PRESETS: Record<PlatformId, Record<UserCategory, string[]>> = {
  windows: {
    development: [
      "git",
      "code", // Visual Studio Code
      "nodejs",
      "python",
      "docker-desktop",
      "postman",
    ],
    design: [
      "gimp",
      "inkscape",
      "blender",
    ],
    multimedia: [
      "vlc",
      "audacity",
      "obs-studio",
    ],
    "system-tools": [
      "7zip",
      "powertoys",
      "everything",
    ],
    gaming: [
      "steam",
      "discord",
    ],
    productivity: [
      "notion",
      "obsidian",
      "slack",
    ],
    education: [
      "anki",
    ],
  },

  macos: {
    development: [
      "git",
      "code", // Visual Studio Code
      "nodejs",
      "python",
      "docker",
      "postman",
    ],
    design: [
      "gimp",
      "inkscape",
      "blender",
    ],
    multimedia: [
      "vlc",
      "audacity",
      "obs",
    ],
    "system-tools": [
      "rectangle",
      "the-unarchiver",
    ],
    gaming: [
      "steam",
      "discord",
    ],
    productivity: [
      "notion",
      "obsidian",
      "slack",
    ],
    education: [
      "anki",
    ],
  },

  ubuntu: {
    development: [
      "git",
      "code", // Visual Studio Code
      "nodejs",
      "python3",
      "docker.io",
      "curl",
    ],
    design: [
      "gimp",
      "inkscape",
      "blender",
    ],
    multimedia: [
      "vlc",
      "audacity",
      "obs-studio",
    ],
    "system-tools": [
      "htop",
      "neofetch",
      "tldr",
    ],
    gaming: [
      "steam",
      "discord",
    ],
    productivity: [
      "libreoffice",
      "thunderbird",
    ],
    education: [
      "anki",
    ],
  },

  debian: {
    development: [
      "git",
      "code",
      "nodejs",
      "python3",
      "docker.io",
      "curl",
    ],
    design: [
      "gimp",
      "inkscape",
      "blender",
    ],
    multimedia: [
      "vlc",
      "audacity",
      "obs-studio",
    ],
    "system-tools": [
      "htop",
      "neofetch",
      "tldr",
    ],
    gaming: [
      "steam",
      "discord",
    ],
    productivity: [
      "libreoffice",
      "thunderbird",
    ],
    education: [
      "anki",
    ],
  },

  arch: {
    development: [
      "git",
      "visual-studio-code-bin",
      "nodejs",
      "python",
      "docker",
      "postman-bin",
    ],
    design: [
      "gimp",
      "inkscape",
      "blender",
    ],
    multimedia: [
      "vlc",
      "audacity",
      "obs-studio",
    ],
    "system-tools": [
      "htop",
      "neofetch",
      "tldr",
    ],
    gaming: [
      "steam",
      "discord",
    ],
    productivity: [
      "libreoffice-fresh",
      "thunderbird",
    ],
    education: [
      "anki",
    ],
  },

  fedora: {
    development: [
      "git",
      "code",
      "nodejs",
      "python3",
      "docker",
      "curl",
    ],
    design: [
      "gimp",
      "inkscape",
      "blender",
    ],
    multimedia: [
      "vlc",
      "audacity",
      "obs-studio",
    ],
    "system-tools": [
      "htop",
      "neofetch",
      "tldr",
    ],
    gaming: [
      "steam",
      "discord",
    ],
    productivity: [
      "libreoffice",
      "thunderbird",
    ],
    education: [
      "anki",
    ],
  },
};

/**
 * Get package names for a specific platform and categories
 */
export function getPackagesForPlatform(
  platformId: string,
  categories: UserCategory[]
): string[] {
  const platform = PACKAGE_PRESETS[platformId as PlatformId];
  if (!platform) return [];

  const packages: string[] = [];
  categories.forEach(category => {
    const categoryPackages = platform[category] || [];
    packages.push(...categoryPackages);
  });

  return packages;
}
