import { CategoryPreset } from "@/types/recommendations";

/**
 * Curated package recommendations for each user category
 * These presets are used by the recommendation engine to suggest packages
 */
export const RECOMMENDATION_PRESETS: CategoryPreset[] = [
  {
    category: "development",
    description: "Essential tools for software development",
    packages: [
      {
        packageName: "git",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 10,
        reason: "Version control system essential for all developers",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "code",
        platforms: ["windows", "macos", "ubuntu", "debian"],
        priority: 9,
        reason: "Visual Studio Code - Popular code editor",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "visual-studio-code",
        platforms: ["arch", "fedora"],
        priority: 9,
        reason: "Visual Studio Code - Popular code editor",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "nodejs",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 8,
        reason: "JavaScript runtime for modern web development",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "python3",
        platforms: ["ubuntu", "debian", "arch", "fedora"],
        priority: 8,
        reason: "Python programming language",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "python",
        platforms: ["windows", "macos"],
        priority: 8,
        reason: "Python programming language",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "docker",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 7,
        reason: "Containerization platform for development",
        experienceLevel: ["intermediate", "advanced"],
      },
      {
        packageName: "curl",
        platforms: ["ubuntu", "debian", "arch", "fedora", "macos"],
        priority: 7,
        reason: "Command-line tool for transferring data",
        experienceLevel: ["intermediate", "advanced"],
      },
      {
        packageName: "vim",
        platforms: ["ubuntu", "debian", "arch", "fedora", "macos"],
        priority: 6,
        reason: "Powerful text editor",
        experienceLevel: ["intermediate", "advanced"],
      },
      {
        packageName: "postman",
        platforms: ["windows", "macos", "ubuntu", "debian"],
        priority: 6,
        reason: "API development and testing tool",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
    ],
  },
  {
    category: "design",
    description: "Tools for graphic design, UI/UX, and creative work",
    packages: [
      {
        packageName: "gimp",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 9,
        reason: "Free and open-source image editor",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "inkscape",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 8,
        reason: "Professional vector graphics editor",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "blender",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 8,
        reason: "3D creation suite",
        experienceLevel: ["intermediate", "advanced"],
      },
      {
        packageName: "figma",
        platforms: ["windows", "macos"],
        priority: 9,
        reason: "Collaborative interface design tool",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "krita",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 7,
        reason: "Digital painting application",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
    ],
  },
  {
    category: "multimedia",
    description: "Audio, video editing and media management tools",
    packages: [
      {
        packageName: "vlc",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 10,
        reason: "Versatile media player",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "obs-studio",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 9,
        reason: "Video recording and live streaming",
        experienceLevel: ["intermediate", "advanced"],
      },
      {
        packageName: "audacity",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 8,
        reason: "Audio editing software",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "ffmpeg",
        platforms: ["ubuntu", "debian", "arch", "fedora", "macos"],
        priority: 8,
        reason: "Complete multimedia framework",
        experienceLevel: ["intermediate", "advanced"],
      },
      {
        packageName: "handbrake",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 7,
        reason: "Video transcoder",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "kdenlive",
        platforms: ["ubuntu", "debian", "arch", "fedora"],
        priority: 7,
        reason: "Video editing software",
        experienceLevel: ["intermediate", "advanced"],
      },
    ],
  },
  {
    category: "system-tools",
    description: "System administration, security and utilities",
    packages: [
      {
        packageName: "htop",
        platforms: ["ubuntu", "debian", "arch", "fedora", "macos"],
        priority: 9,
        reason: "Interactive process viewer",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "tmux",
        platforms: ["ubuntu", "debian", "arch", "fedora", "macos"],
        priority: 8,
        reason: "Terminal multiplexer",
        experienceLevel: ["intermediate", "advanced"],
      },
      {
        packageName: "wget",
        platforms: ["ubuntu", "debian", "arch", "fedora", "macos"],
        priority: 8,
        reason: "Network downloader",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "neofetch",
        platforms: ["ubuntu", "debian", "arch", "fedora", "macos"],
        priority: 6,
        reason: "System information tool",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "wireshark",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 7,
        reason: "Network protocol analyzer",
        experienceLevel: ["advanced"],
      },
      {
        packageName: "gparted",
        platforms: ["ubuntu", "debian", "arch", "fedora"],
        priority: 6,
        reason: "Partition editor",
        experienceLevel: ["intermediate", "advanced"],
      },
    ],
  },
  {
    category: "gaming",
    description: "Gaming platforms and related tools",
    packages: [
      {
        packageName: "steam",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 10,
        reason: "Gaming platform",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "discord",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 9,
        reason: "Voice and chat for gamers",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "lutris",
        platforms: ["ubuntu", "debian", "arch", "fedora"],
        priority: 7,
        reason: "Open gaming platform",
        experienceLevel: ["intermediate", "advanced"],
      },
      {
        packageName: "wine",
        platforms: ["ubuntu", "debian", "arch", "fedora", "macos"],
        priority: 6,
        reason: "Windows compatibility layer",
        experienceLevel: ["advanced"],
      },
    ],
  },
  {
    category: "productivity",
    description: "Office, note-taking and productivity tools",
    packages: [
      {
        packageName: "libreoffice",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 10,
        reason: "Free office suite",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "thunderbird",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 8,
        reason: "Email client",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "notion",
        platforms: ["windows", "macos"],
        priority: 9,
        reason: "All-in-one workspace",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "obsidian",
        platforms: ["windows", "macos", "ubuntu", "debian"],
        priority: 8,
        reason: "Knowledge base and note-taking",
        experienceLevel: ["intermediate", "advanced"],
      },
      {
        packageName: "keepassxc",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 7,
        reason: "Password manager",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
    ],
  },
  {
    category: "education",
    description: "Educational and scientific software",
    packages: [
      {
        packageName: "anki",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 9,
        reason: "Flashcard application for learning",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "stellarium",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 7,
        reason: "Planetarium software",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
      {
        packageName: "octave",
        platforms: ["windows", "macos", "ubuntu", "debian", "arch", "fedora"],
        priority: 7,
        reason: "Scientific programming language",
        experienceLevel: ["intermediate", "advanced"],
      },
      {
        packageName: "geogebra",
        platforms: ["windows", "macos", "ubuntu", "debian"],
        priority: 8,
        reason: "Interactive mathematics software",
        experienceLevel: ["beginner", "intermediate", "advanced"],
      },
    ],
  },
];

/**
 * Get presets for specific categories
 */
export function getPresetsForCategories(
  categories: string[]
): CategoryPreset[] {
  return RECOMMENDATION_PRESETS.filter((preset) =>
    categories.includes(preset.category)
  );
}

/**
 * Get all package names from presets for a specific platform
 */
export function getPresetPackageNames(
  categories: string[],
  platformId: string
): string[] {
  const presets = getPresetsForCategories(categories);
  const packageNames = new Set<string>();

  presets.forEach((preset) => {
    preset.packages.forEach((pkg) => {
      if (pkg.platforms.includes(platformId)) {
        packageNames.add(pkg.packageName);
      }
    });
  });

  return Array.from(packageNames);
}

/**
 * Get preset priority for a package
 */
export function getPresetPriority(
  packageName: string,
  categories: string[],
  platformId: string
): number | null {
  const presets = getPresetsForCategories(categories);

  for (const preset of presets) {
    const pkg = preset.packages.find(
      (p) => p.packageName === packageName && p.platforms.includes(platformId)
    );
    if (pkg) {
      return pkg.priority;
    }
  }

  return null;
}

/**
 * Get recommendation reason for a package
 */
export function getRecommendationReason(
  packageName: string,
  categories: string[]
): string | null {
  const presets = getPresetsForCategories(categories);

  for (const preset of presets) {
    const pkg = preset.packages.find((p) => p.packageName === packageName);
    if (pkg) {
      return pkg.reason;
    }
  }

  return null;
}
