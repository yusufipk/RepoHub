import { UserCategory } from "@/types/recommendations";

/**
 * Curated package recommendations for each platform and category
 * Simple structure: Platform → Category → Package names
 * 
 * Edit this file to add/remove packages for each platform/category combination
 */

type PlatformId = "windows" | "macos" | "ubuntu" | "debian" | "arch" | "fedora";

export const PACKAGE_PRESETS: Record<PlatformId, Record<UserCategory, string[]>> = {
  "windows": {
    "development": [
      "Git.Git",
      "Microsoft.VisualStudioCode",
      "Docker.DockerDesktop",
      "Postman.Postman",
      "Microsoft.WindowsTerminal",
      "Microsoft.PowerShell",
      "Notepad++.Notepad++",
      "WinSCP.WinSCP",
      "PuTTY.PuTTY",
      "WinMerge.WinMerge",
      "EclipseFoundation.Eclipse",
      "Anysphere.Cursor",
      "Microsoft.VisualStudio.2022.Community

    ],
    "design": [
      "GIMP.GIMP",
      "Inkscape.Inkscape",
      "BlenderFoundation.Blender",
      "KDE.Krita",
      "IrfanSkiljan.IrfanView",
      "XnSoft.XnViewMP",
      "FastStone.Viewer",
      "Greenshot.Greenshot",
      "ShareX.ShareX"
    ],
    "multimedia": [
      "VideoLAN.VLC",
      "Audacity.Audacity",
      "OBSProject.OBSStudio",
      "Apple.iTunes",
      "AIMP.AIMP",
      "PeterPawlowski.foobar2000",
      "Winamp.Winamp",
      "GOMLab.GOMPlayer",
      "Spotify.Spotify",
      "VentisMedia.MediaMonkey",
      "HandBrake.HandBrake"
    ],
    "system-tools": [
      "7zip.7zip",
      "Microsoft.PowerToys",
      "voidtools.Everything",
      "RARLab.WinRAR",
      "DominikReichl.KeePass",
      "TeamViewer.TeamViewer",
      "RealVNC.VNCViewer",
      "CodeSector.TeraCopy",
      "LIGHTNINGUK.ImgBurn",
      "WinDirStat.WinDirStat",
      "AntibodySoftware.WizTree",
      "Glarysoft.GlaryUtilities",
      "ChristianKindahl.InfraRecorder",
      "Open-Shell.Open-Shell-Menu",
      "Piriform.CCleaner",
      "Rufus.Rufus",
      "BleachBit.BleachBit",
      "NVAccess.NVDA",
      "Malwarebytes.Malwarebytes",
      "SUPERAntiSpyware.SUPERAntiSpyware",
      "qBittorrent.qBittorrent"
    ],
    "gaming": [
      "Valve.Steam",
      "Discord.Discord",
      "EpicGames.EpicGamesLauncher",
      "GOG.Galaxy",
      "Playnite.Playnite"
    ],
    "productivity": [
      "Notion.Notion",
      "Obsidian.Obsidian",
      "SlackTechnologies.Slack",
      "Google.Chrome",
      "Mozilla.Firefox",
      "Microsoft.Edge",
      "Brave.Brave",
      "Opera.Opera",
      "Zoom.Zoom",
      "Microsoft.Teams",
      "Pidgin.Pidgin",
      "Mozilla.Thunderbird",
      "Foxit.FoxitReader",
      "TheDocumentFoundation.LibreOffice",
      "SumatraPDF.SumatraPDF",
      "AcroSoftware.CutePDFWriter",
      "Apache.OpenOffice",
      "Dropbox.Dropbox",
      "Microsoft.OneDrive",
      "Google.EarthPro",
      "Evernote.Evernote"
    ],
    "education": [
      "Anki.Anki"
    ]
  },

  "macos": {
    "development": [
      "git",
      "visual-studio-code",
      "cursor",
      "node",
      "postman",
      "iterm2",
      "warp",
      "sublime-text",
      "cyberduck",
      "meld",
      "dotnet-sdk",
      "temurin"
    ],
    "design": [
      "gimp",
      "inkscape",
      "blender",
      "krita",
      "xnviewmp"
    ],
    "multimedia": [
      "vlc",
      "audacity",
      "obs",
      "spotify",
      "handbrake",
      "iina",
      "foobar2000"
    ],
    "system-tools": [
      "rectangle",
      "the-unarchiver",
      "keka",
      "appcleaner",
      "keepassxc",
      "teamviewer",
      "anydesk",
      "malwarebytes",
      "raycast",
      "alfred",
      "qbittorrent"
    ],
    "gaming": [
      "steam",
      "discord",
      "epic-games"
      
    ],
    "productivity": [
      "notion",
      "obsidian",
      "slack",
      "zoom",
      "microsoft-teams",
      "thunderbird",
      "google-chrome",
      "firefox",
      "microsoft-edge",
      "brave-browser",
      "opera",
      "libreoffice",
      "foxitreader",
      "adobe-acrobat-reader",
      "dropbox",
      "google-drive",
      "onedrive"
    ],
    "education": [
      "anki",
      "zotero"
    ]
  },

  "ubuntu": {
    "development": [
      "git",
      "curl",
      "wget",
      "nodejs",
      "npm",
      "python3-pip",
      "docker.io",
      "dotnet-sdk-8.0"
    ],
    "design": [
      "gimp",
      "inkscape",
      "blender",
      "krita",
      "darktable"
    ],
    "multimedia": [
      "vlc",
      "audacity",
      "obs-studio",
      "ffmpeg",
      "mpv",
      "handbrake",
      "kdenlive"
    ],
    "system-tools": [
      "neofetch",
      "timeshift",
      "stacer",
      "keepassxc",
      "synaptic"
    ],
    "gaming": [
      "steam",
      "lutris",
      "mangohud"
    ],
    "productivity": [
      "libreoffice",
      "chromium-browser",
      "evolution",
      "focuswriter"
    ],
    "education": [
      "anki"
    ]
  },
  "debian": {
    "development": [
      "git",
      "build-essential",
      "curl",
      "wget",
      "nodejs",
      "npm",
      "python3",
      "python3-pip",
      "docker.io"
    ],
    "design": [
      "gimp",
      "inkscape",
      "blender",
      "krita"
    ],
    "multimedia": [
      "vlc",
      "audacity",
      "obs-studio",
      "ffmpeg",
      "handbrake"
    ],
    "system-tools": [
      "htop",
      "fastfetch",
      "tmux",
      "zsh",
      "gparted",
      "timeshift",
      "keepassxc"
    ],
    "gaming": [
      "steam",
      "lutris",
      "gamemode",
      "mangohud"
    ],
    "productivity": [
      "libreoffice",
      "thunderbird",
      "firefox-esr",
      "chromium"
    ],
    "education": [
    ]
  },
  "arch": {
    "development": [
      "git",
      "base-devel",
      "code",
      "nodejs",
      "npm",
      "python-pip",
      "jdk17-openjdk"
    ],
    "design": [
      "gimp",
      "inkscape",
      "blender",
      "krita"
    ],
    "multimedia": [
      "vlc",
      "audacity",
      "obs-studio",
      "ffmpeg",
      "mpv",
      "handbrake"
    ],
    "system-tools": [
      "htop",
      "fastfetch",
      "tldr",
      "tmux",
      "zsh",
      "gparted",
      "timeshift",
      "keepassxc",
      "reflector",
      "pacman-contrib"
    ],
    "gaming": [
      "steam",
      "lutris",
      "gamemode",
      "mangohud",
      "discord",
      "wine",
      "winetricks"
    ],
    "productivity": [
      "libreoffice-fresh",
      "thunderbird",
      "firefox",
      "chromium",
      "obsidian"
    ],
    "education": [
      "anki"
    ]
  },
  "fedora": {
    "development": [
      "git",
      "curl",
      "nodejs",
      "python3",
      "python3-pip",
      "java-17-openjdk-devel",
      "dotnet-sdk-8.0"
    ],
    "design": [
      "gimp",
      "inkscape",
      "blender",
      "krita"
    ],
    "multimedia": [
      "vlc",
      "audacity",
      "obs-studio",
      "mpv"
    ],
    "system-tools": [
      "htop",
      "fastfetch",
      "tldr",
      "tmux",
      "zsh",
      "gparted",
      "keepassxc",
      "dnf-plugins-core"
    ],
    "gaming": [
      "lutris",
      "gamemode",
      "mangohud"
    ],
    "productivity": [
      "libreoffice",
      "thunderbird",
      "firefox",
      "chromium"
    ],
    "education": []
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

/**
 * Get package names with their categories for a specific platform
 */
export function getPackagesWithCategories(
  platformId: string,
  categories: UserCategory[]
): { name: string; category: UserCategory }[] {
  const platform = PACKAGE_PRESETS[platformId as PlatformId];
  if (!platform) return [];

  const packages: { name: string; category: UserCategory }[] = [];
  categories.forEach((category) => {
    const categoryPackages = platform[category] || [];
    categoryPackages.forEach((name) => {
      packages.push({ name, category });
    });
  });

  return packages;
}

export const PRESET_DESCRIPTIONS: Record<string, string> = {
  // Development
  "git": "Distributed version control system",
  "Git.Git": "Distributed version control system",
  "curl": "Command line tool for transferring data with URLs",
  "wget": "Network utility to retrieve files from the Web",
  "nodejs": "JavaScript runtime built on Chrome's V8 JavaScript engine",
  "npm": "Package manager for the Node.js JavaScript platform",
  "python3": "Interpreted, interactive, object-oriented programming language",
  "python3-pip": "Python package installer",
  "python-pip": "Python package installer",
  "docker.io": "Linux container runtime",
  "Docker.DockerDesktop": "Build, Share, and Run container applications",
  "dotnet-sdk-8.0": ".NET 8.0 Software Development Kit",
  "dotnet-sdk": ".NET Software Development Kit",
  "Microsoft.VisualStudioCode": "Code editing. Redefined.",
  "visual-studio-code": "Code editing. Redefined.",
  "code": "The Open Source build of Visual Studio Code",
  "Postman.Postman": "Platform for building and using APIs",
  "postman": "Platform for building and using APIs",
  "Microsoft.WindowsTerminal": "Modern terminal application for Windows",
  "iterm2": "Terminal emulator for macOS",
  "warp": "AI-powered terminal",
  "sublime-text": "Sophisticated text editor for code, markup and prose",
  "build-essential": "Informational list of build-essential packages",
  "base-devel": "Basic tools to build Arch Linux packages",
  "java-17-openjdk-devel": "OpenJDK 17 Development Kit",
  "jdk17-openjdk": "OpenJDK 17 Development Kit",
  "temurin": "Eclipse Temurin Java SE binaries",

  // Design
  "gimp": "GNU Image Manipulation Program",
  "GIMP.GIMP": "GNU Image Manipulation Program",
  "inkscape": "Vector-based drawing program",
  "Inkscape.Inkscape": "Vector-based drawing program",
  "blender": "Very fast and versatile 3D modeller/renderer",
  "BlenderFoundation.Blender": "Very fast and versatile 3D modeller/renderer",
  "krita": "Digital painting and sketching application",
  "KDE.Krita": "Digital painting and sketching application",
  "darktable": "Virtual lighttable and darkroom for photographers",
  "xnviewmp": "Image viewer, browser and converter",
  "XnSoft.XnViewMP": "Image viewer, browser and converter",
  "IrfanSkiljan.IrfanView": "Fast and compact image viewer",
  "FastStone.Viewer": "Image viewer, converter and editor",
  "ShareX.ShareX": "Screen capture, file sharing and productivity tool",
  "Greenshot.Greenshot": "Lightweight screenshot software tool",

  // Multimedia
  "vlc": "Multimedia player and streamer",
  "VideoLAN.VLC": "Multimedia player and streamer",
  "audacity": "Multi-track audio editor and recorder",
  "Audacity.Audacity": "Multi-track audio editor and recorder",
  "obs-studio": "Software for live streaming and screen recording",
  "obs": "Software for live streaming and screen recording",
  "OBSProject.OBSStudio": "Software for live streaming and screen recording",
  "ffmpeg": "Tools for transcoding, streaming and playing of multimedia files",
  "mpv": "Video player based on MPlayer/mplayer2",
  "handbrake": "Open Source Video Transcoder",
  "HandBrake.HandBrake": "Open Source Video Transcoder",
  "kdenlive": "Non-linear video editor",
  "spotify": "Music streaming service",
  "Spotify.Spotify": "Music streaming service",
  "Apple.iTunes": "Media player, media library, and mobile device management utility",
  "foobar2000": "Advanced audio player",
  "PeterPawlowski.foobar2000": "Advanced audio player",
  "Winamp.Winamp": "Media player for Windows",
  "AIMP.AIMP": "Free audio player",
  "iina": "The modern video player for macOS",

  // System Tools
  "htop": "Interactive process viewer",
  "fastfetch": "Like neofetch, but much faster",
  "neofetch": "Command-line system information tool",
  "tmux": "Terminal multiplexer",
  "zsh": "Shell with lots of features",
  "gparted": "GNOME Partition Editor",
  "timeshift": "System restore utility",
  "stacer": "Linux System Optimizer and Monitoring",
  "keepassxc": "Cross Platform Password Manager",
  "DominikReichl.KeePass": "Password manager",
  "synaptic": "Graphical package manager",
  "7zip.7zip": "File archiver with a high compression ratio",
  "Microsoft.PowerToys": "Set of system utilities for power users",
  "voidtools.Everything": "Locate files and folders by name instantly",
  "RARLab.WinRAR": "Powerful archiver and archive manager",
  "TeamViewer.TeamViewer": "Remote control and meeting software",
  "teamviewer": "Remote control and meeting software",
  "RealVNC.VNCViewer": "Remote control software",
  "rufus": "Create bootable USB drives the easy way",
  "Rufus.Rufus": "Create bootable USB drives the easy way",
  "bleachbit": "Delete unnecessary files from the system",
  "BleachBit.BleachBit": "Delete unnecessary files from the system",
  "rectangle": "Move and resize windows in macOS using keyboard shortcuts",
  "the-unarchiver": "Unpack any archive file",
  "keka": "The macOS file archiver",
  "appcleaner": "Uninstall unwanted apps",
  "raycast": "Productivity tool that replaces Spotlight",
  "alfred": "Productivity app for macOS",
  "qbittorrent": "BitTorrent client",
  "qBittorrent.qBittorrent": "BitTorrent client",

  // Gaming
  "steam": "Digital distribution platform for video games",
  "Valve.Steam": "Digital distribution platform for video games",
  "lutris": "Open Source gaming platform for Linux",
  "gamemode": "Optimize Linux system performance for gaming",
  "mangohud": "Vulkan and OpenGL overlay for monitoring FPS, temperatures, CPU/GPU load",
  "discord": "All-in-one voice and text chat for gamers",
  "Discord.Discord": "All-in-one voice and text chat for gamers",
  "wine": "Run Windows applications on Linux",
  "winetricks": "Workarounds for problems in Wine",
  "EpicGames.EpicGamesLauncher": "Epic Games Store",
  "epic-games": "Epic Games Store",
  "GOG.Galaxy": "GOG Galaxy Client",

  // Productivity
  "libreoffice": "Office productivity suite",
  "TheDocumentFoundation.LibreOffice": "Office productivity suite",
  "libreoffice-fresh": "Office productivity suite (fresh version)",
  "thunderbird": "Email, newsgroup and chat client",
  "Mozilla.Thunderbird": "Email, newsgroup and chat client",
  "firefox": "Mozilla Firefox web browser",
  "Mozilla.Firefox": "Mozilla Firefox web browser",
  "chromium": "Web browser",
  "chromium-browser": "Web browser",
  "Google.Chrome": "Web browser",
  "google-chrome": "Web browser",
  "Microsoft.Edge": "Web browser",
  "microsoft-edge": "Web browser",
  "Brave.Brave": "Secure, fast, and private web browser",
  "brave-browser": "Secure, fast, and private web browser",
  "Opera.Opera": "Web browser",
  "opera": "Web browser",
  "zoom": "Video conferencing",
  "Zoom.Zoom": "Video conferencing",
  "microsoft-teams": "Communication and collaboration platform",
  "Microsoft.Teams": "Communication and collaboration platform",
  "slack": "Collaboration hub for work",
  "SlackTechnologies.Slack": "Collaboration hub for work",
  "notion": "All-in-one workspace",
  "Notion.Notion": "All-in-one workspace",
  "obsidian": "Knowledge base that works on local Markdown files",
  "Obsidian.Obsidian": "Knowledge base that works on local Markdown files",
  "foxitreader": "PDF Reader",
  "Foxit.FoxitReader": "PDF Reader",
  "adobe-acrobat-reader": "PDF Reader",
  "dropbox": "File hosting service",
  "Dropbox.Dropbox": "File hosting service",
  "onedrive": "File hosting service",
  "Microsoft.OneDrive": "File hosting service",
  "google-drive": "File hosting service",
  "evernote": "Note taking app",
  "Evernote.Evernote": "Note taking app",
  "evolution": "Groupware suite",
  "focuswriter": "Distraction-free word processor",

  // Education
  "anki": "Powerful, intelligent flash cards",
  "Anki.Anki": "Powerful, intelligent flash cards",
  "zotero": "Your personal research assistant"
};

export const PACKAGE_ICONS: Record<string, string> = {
  // Development
  "git": "git",
  "Git.Git": "git",
  "curl": "curl",
  "wget": "gnu",
  "nodejs": "nodedotjs",
  "npm": "npm",
  "python3": "python",
  "python3-pip": "pypi",
  "python-pip": "pypi",
  "docker.io": "docker",
  "Docker.DockerDesktop": "docker",
  "dotnet-sdk-8.0": "dotnet",
  "dotnet-sdk": "dotnet",
  "Microsoft.VisualStudioCode": "visualstudiocode",
  "visual-studio-code": "visualstudiocode",
  "code": "visualstudiocode",
  "Postman.Postman": "postman",
  "postman": "postman",
  "Microsoft.WindowsTerminal": "windows",
  "iterm2": "iterm2",
  "warp": "warp",
  "sublime-text": "sublimetext",
  "build-essential": "linux",
  "base-devel": "archlinux",
  "java-17-openjdk-devel": "openjdk",
  "jdk17-openjdk": "openjdk",
  "temurin": "eclipse",
  "Anysphere.Cursor": "cursor",
  "cursor": "cursor",
  "EclipseFoundation.Eclipse": "eclipse",
  "WinSCP.WinSCP": "winscp",
  "PuTTY.PuTTY": "putty",

  // Design
  "gimp": "gimp",
  "GIMP.GIMP": "gimp",
  "inkscape": "inkscape",
  "Inkscape.Inkscape": "inkscape",
  "blender": "blender",
  "BlenderFoundation.Blender": "blender",
  "krita": "krita",
  "KDE.Krita": "krita",
  "darktable": "darktable",
  "xnviewmp": "xnview",
  "XnSoft.XnViewMP": "xnview",
  "IrfanSkiljan.IrfanView": "irfanview",
  "FastStone.Viewer": "imagej", // Placeholder, no icon
  "ShareX.ShareX": "sharex",
  "Greenshot.Greenshot": "greenshot",

  // Multimedia
  "vlc": "vlcmediaplayer",
  "VideoLAN.VLC": "vlcmediaplayer",
  "audacity": "audacity",
  "Audacity.Audacity": "audacity",
  "obs-studio": "obsstudio",
  "obs": "obsstudio",
  "OBSProject.OBSStudio": "obsstudio",
  "ffmpeg": "ffmpeg",
  "mpv": "mpv",
  "handbrake": "handbrake",
  "HandBrake.HandBrake": "handbrake",
  "kdenlive": "kdenlive",
  "spotify": "spotify",
  "Spotify.Spotify": "spotify",
  "Apple.iTunes": "itunes",
  "foobar2000": "foobar2000",
  "PeterPawlowski.foobar2000": "foobar2000",
  "Winamp.Winamp": "winamp",
  "AIMP.AIMP": "aimp",
  "iina": "iina",

  // System Tools
  "htop": "htop",
  "fastfetch": "linux",
  "neofetch": "linux",
  "tmux": "tmux",
  "zsh": "zsh",
  "gparted": "gparted",
  "timeshift": "linux",
  "stacer": "linux",
  "keepassxc": "keepassxc",
  "DominikReichl.KeePass": "keepass",
  "synaptic": "debian",
  "7zip.7zip": "7zip",
  "Microsoft.PowerToys": "windows",
  "voidtools.Everything": "windows",
  "RARLab.WinRAR": "winrar",
  "TeamViewer.TeamViewer": "teamviewer",
  "teamviewer": "teamviewer",
  "RealVNC.VNCViewer": "realvnc",
  "rufus": "rufus",
  "Rufus.Rufus": "rufus",
  "bleachbit": "bleachbit",
  "BleachBit.BleachBit": "bleachbit",
  "rectangle": "macos",
  "the-unarchiver": "macos",
  "keka": "macos",
  "appcleaner": "macos",
  "raycast": "raycast",
  "alfred": "alfred",
  "qbittorrent": "qbittorrent",
  "qBittorrent.qBittorrent": "qbittorrent",
  "NVAccess.NVDA": "nvda",
  "Malwarebytes.Malwarebytes": "malwarebytes",

  // Gaming
  "steam": "steam",
  "Valve.Steam": "steam",
  "lutris": "lutris",
  "gamemode": "linux",
  "mangohud": "opengl",
  "discord": "discord",
  "Discord.Discord": "discord",
  "wine": "wine",
  "winetricks": "wine",
  "EpicGames.EpicGamesLauncher": "epicgames",
  "epic-games": "epicgames",
  "GOG.Galaxy": "gogdotcom",

  // Productivity
  "libreoffice": "libreoffice",
  "TheDocumentFoundation.LibreOffice": "libreoffice",
  "libreoffice-fresh": "libreoffice",
  "thunderbird": "thunderbird",
  "Mozilla.Thunderbird": "thunderbird",
  "firefox": "firefox",
  "Mozilla.Firefox": "firefox",
  "chromium": "chromium",
  "chromium-browser": "chromium",
  "Google.Chrome": "googlechrome",
  "google-chrome": "googlechrome",
  "Microsoft.Edge": "microsoftedge",
  "microsoft-edge": "microsoftedge",
  "Brave.Brave": "brave",
  "brave-browser": "brave",
  "Opera.Opera": "opera",
  "opera": "opera",
  "zoom": "zoom",
  "Zoom.Zoom": "zoom",
  "microsoft-teams": "microsoftteams",
  "Microsoft.Teams": "microsoftteams",
  "slack": "slack",
  "SlackTechnologies.Slack": "slack",
  "notion": "notion",
  "Notion.Notion": "notion",
  "obsidian": "obsidian",
  "Obsidian.Obsidian": "obsidian",
  "foxitreader": "foxit",
  "Foxit.FoxitReader": "foxit",
  "adobe-acrobat-reader": "adobeacrobatreader",
  "dropbox": "dropbox",
  "Dropbox.Dropbox": "dropbox",
  "onedrive": "microsoftonedrive",
  "Microsoft.OneDrive": "microsoftonedrive",
  "google-drive": "googledrive",
  "evernote": "evernote",
  "Evernote.Evernote": "evernote",
  "evolution": "linux",
  "focuswriter": "linux",

  // Education
  "anki": "anki",
  "Anki.Anki": "anki",
  "zotero": "zotero"
};

export function getPresetIcon(name: string): string | undefined {
  // Try exact match
  if (PACKAGE_ICONS[name]) {
    return PACKAGE_ICONS[name];
  }
  
  // Try case insensitive
  const lowerName = name.toLowerCase();
  const key = Object.keys(PACKAGE_ICONS).find(k => k.toLowerCase() === lowerName);
  if (key) {
    return PACKAGE_ICONS[key];
  }

  return undefined;
}

export function getPresetDetails(name: string): { description: string } {
  // Try exact match
  if (PRESET_DESCRIPTIONS[name]) {
    return { description: PRESET_DESCRIPTIONS[name] };
  }
  
  // Try case insensitive
  const lowerName = name.toLowerCase();
  const key = Object.keys(PRESET_DESCRIPTIONS).find(k => k.toLowerCase() === lowerName);
  if (key) {
    return { description: PRESET_DESCRIPTIONS[key] };
  }

  return { description: "Recommended package" };
}
