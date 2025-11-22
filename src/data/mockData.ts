import { Platform, Package } from '@/types'

export const platforms: Platform[] = [
  {
    id: 'ubuntu',
    name: 'Ubuntu/Debian',
    packageManager: 'apt',
    icon: 'ubuntu'
  },
  {
    id: 'debian',
    name: 'Debian',
    packageManager: 'apt',
    icon: 'debian'
  },
  {
    id: 'fedora',
    name: 'Fedora',
    packageManager: 'dnf',
    icon: 'fedora'
  },
  {
    id: 'arch',
    name: 'Arch Linux',
    packageManager: 'pacman',
    icon: 'archlinux'
  },
  {
    id: 'windows',
    name: 'Windows',
    packageManager: 'winget',
    icon: 'windows'
  },
  {
    id: 'macos',
    name: 'macOS',
    packageManager: 'homebrew',
    icon: 'apple'
  }
]

// Platform icon slugs for SimpleIcons CDN
export const platformIconSlugs: Record<string, string> = {
  debian: 'debian',
  ubuntu: 'ubuntu',
  fedora: 'fedora',
  arch: 'archlinux',
  windows: 'windows',
  macos: 'apple',
}

export const mockPackages: Package[] = [
  // Ubuntu/Debian packages
  {
    id: 'firefox',
    name: 'Firefox',
    description: 'Fast, private and safe web browser',
    version: '119.0.1',
    category: 'Internet',
    license: 'MPL-2.0',
    type: 'gui',
    platform: 'ubuntu',
    repository: 'official',
    lastUpdated: '2024-01-15',
    downloads: 1500000,
    popularity: 95,
    tags: ['browser', 'web', 'internet']
  },
  {
    id: 'vlc',
    name: 'VLC Media Player',
    description: 'Multi-platform multimedia player',
    version: '3.0.20',
    category: 'Multimedia',
    license: 'GPL-2.0',
    type: 'gui',
    platform: 'ubuntu',
    repository: 'official',
    lastUpdated: '2024-01-10',
    downloads: 800000,
    popularity: 88,
    tags: ['media', 'video', 'audio']
  },
  {
    id: 'git',
    name: 'Git',
    description: 'Fast, scalable, distributed revision control system',
    version: '2.43.0',
    category: 'Development',
    license: 'GPL-2.0',
    type: 'cli',
    platform: 'ubuntu',
    repository: 'official',
    lastUpdated: '2024-01-12',
    downloads: 2000000,
    popularity: 98,
    tags: ['version-control', 'development', 'cli']
  },
  // Windows packages
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    description: 'Lightweight but powerful source code editor',
    version: '1.85.1',
    category: 'Development',
    license: 'MIT',
    type: 'gui',
    platform: 'windows',
    repository: 'official',
    lastUpdated: '2024-01-14',
    downloads: 5000000,
    popularity: 99,
    tags: ['editor', 'development', 'ide']
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Voice, video and text communication',
    version: '1.0.9013',
    category: 'Communication',
    license: 'Proprietary',
    type: 'gui',
    platform: 'windows',
    repository: 'official',
    lastUpdated: '2024-01-13',
    downloads: 3000000,
    popularity: 92,
    tags: ['chat', 'voice', 'gaming']
  },
  // macOS packages
  {
    id: 'homebrew',
    name: 'Homebrew',
    description: 'The Missing Package Manager for macOS',
    version: '4.1.11',
    category: 'System',
    license: 'BSD-2-Clause',
    type: 'cli',
    platform: 'macos',
    repository: 'official',
    lastUpdated: '2024-01-11',
    downloads: 1000000,
    popularity: 90,
    tags: ['package-manager', 'system', 'cli']
  }
]

export const categories = [
  'Development',
  'Internet',
  'Multimedia',
  'System',
  'Communication',
  'Office',
  'Graphics',
  'Games',
  'Science',
  'Utilities'
]

export const licenses = [
  'MIT',
  'GPL-2.0',
  'GPL-3.0',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'MPL-2.0',
  'Proprietary',
  'LGPL-2.1',
  'LGPL-3.0'
]
