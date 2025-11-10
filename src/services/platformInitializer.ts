import { PlatformService } from './platformService'

export class PlatformInitializer {
  // Initialize all platforms in database
  static async initializePlatforms(): Promise<void> {
    console.log('🔄 Initializing platforms in database...')
    
    const platforms = [
      {
        id: 'debian',
        name: 'Debian',
        package_manager: 'apt',
        icon: '🐧'
      },
      {
        id: 'ubuntu',
        name: 'Ubuntu',
        package_manager: 'apt',
        icon: '🐧'
      },
      {
        id: 'fedora',
        name: 'Fedora',
        package_manager: 'dnf',
        icon: '🎩'
      },
      {
        id: 'arch',
        name: 'Arch Linux',
        package_manager: 'pacman',
        icon: '🏛️'
      },
      {
        id: 'windows',
        name: 'Windows',
        package_manager: 'winget',
        icon: '🪟'
      },
      {
        id: 'macos',
        name: 'macOS',
        package_manager: 'homebrew',
        icon: '🍎'
      }
    ]

    for (const platform of platforms) {
      try {
        const existing = await PlatformService.getById(platform.id)
        
        if (!existing) {
          await PlatformService.create(platform)
          console.log(`✅ Created platform: ${platform.name}`)
        } else {
          // Update existing platform to ensure correct name
          await PlatformService.update(platform.id, platform)
          console.log(`🔄 Updated platform: ${platform.name}`)
        }
      } catch (error) {
        console.error(`❌ Error initializing platform ${platform.id}:`, error)
      }
    }
    
    console.log('✅ Platform initialization completed')
  }
}
