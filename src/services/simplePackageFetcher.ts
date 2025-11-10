import { PackageService } from './packageService'
import { CreatePackageInput } from '@/models/Package'

export class SimplePackageFetcher {
  private static readonly DEBIAN_PACKAGES_URL = 'https://packages.debian.org/stable/allpackages?format=txt.gz'
  private static readonly UBUNTU_PACKAGES_URL = 'https://packages.ubuntu.com/noble/allpackages?format=txt.gz'

  // Fetch and parse Debian packages (simple text parsing)
  static async fetchDebianPackages(): Promise<void> {
    await this.fetchDebianPackagesWithProgress(() => {})
  }

  // Fetch with progress callback
  static async fetchDebianPackagesWithProgress(
    onProgress: (message: string, progress?: number, total?: number) => void
  ): Promise<void> {
    onProgress('🔄 Fetching Debian packages from official repository...')
    
    try {
      onProgress('📡 Downloading package list...')
      const response = await fetch(this.DEBIAN_PACKAGES_URL, {
        headers: {
          'User-Agent': 'RepoHub-Package-Fetcher/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Debian packages: ${response.statusText}`)
      }

      // Get as text directly (not compressed!)
      const text = await response.text()
      onProgress(`📊 Downloaded ${Math.round(text.length / 1024 / 1024)}MB of package data`)
      
      const packages = this.parseDebianPackageListWithProgress(text, onProgress)
      onProgress(`📊 Parsed ${packages.length} Debian packages`)
      
      // Store in database
      await this.storePackagesWithProgress('debian', packages, onProgress)
      
      onProgress('✅ Debian packages completed')
    } catch (error) {
      onProgress(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }

  // Fetch and parse Ubuntu packages (simple text parsing)
  static async fetchUbuntuPackages(): Promise<void> {
    await this.fetchUbuntuPackagesWithProgress(() => {})
  }

  // Fetch with progress callback
  static async fetchUbuntuPackagesWithProgress(
    onProgress: (message: string, progress?: number, total?: number) => void
  ): Promise<void> {
    onProgress('🔄 Fetching Ubuntu packages from official repository...')
    
    try {
      onProgress('📡 Downloading package list...')
      const response = await fetch(this.UBUNTU_PACKAGES_URL, {
        headers: {
          'User-Agent': 'RepoHub-Package-Fetcher/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Ubuntu packages: ${response.statusText}`)
      }

      // Get as text directly (not compressed!)
      const text = await response.text()
      onProgress(`📊 Downloaded ${Math.round(text.length / 1024 / 1024)}MB of package data`)
      
      const packages = this.parseUbuntuPackageListWithProgress(text, onProgress)
      onProgress(`📊 Parsed ${packages.length} Ubuntu packages`)
      
      // Store in database
      await this.storePackagesWithProgress('ubuntu', packages, onProgress)
      
      onProgress('✅ Ubuntu packages completed')
    } catch (error) {
      onProgress(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }

  // Parse Debian package list format
  private static parseDebianPackageList(text: string): CreatePackageInput[] {
    return this.parseDebianPackageListWithProgress(text, () => {})
  }

  // Parse with progress callback
  private static parseDebianPackageListWithProgress(
    text: string, 
    onProgress: (message: string, progress?: number, total?: number) => void
  ): CreatePackageInput[] {
    const packages: CreatePackageInput[] = []
    const lines = text.split('\n')
    
    console.log('📋 Analyzing package format...')
    
    // Find where actual packages start
    let packageStartIndex = 0
    let sampleLines = []
    
    for (let i = 0; i < Math.min(50, lines.length); i++) {
      const line = lines[i].trim()
      if (line && !line.startsWith('All') && !line.startsWith('Generated') && !line.startsWith('Copyright')) {
        sampleLines.push(line)
        if (packageStartIndex === 0 && line.match(/^[a-z0-9]/)) {
          packageStartIndex = i
        }
      }
    }
    
    console.log('📋 Sample lines:', sampleLines.slice(0, 5))
    console.log('📋 Package start index:', packageStartIndex)

    let processedCount = 0
    const totalLines = lines.length - packageStartIndex
    
    for (let i = packageStartIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Skip header lines
      if (line.startsWith('All') || line.startsWith('Generated') || line.startsWith('Copyright')) {
        continue
      }

      // Try multiple regex patterns
      let match = null
      
      // Pattern 1: "package-name (version) description"
      match = line.match(/^([a-z0-9][a-z0-9+.-]*)\s+\(([^)]+)\)\s*(.+)?$/)
      
      if (match) {
        const [, name, version, description] = match
        
        packages.push({
          id: `debian-${name}`,
          name: name,
          description: description?.trim(),
          version: version.trim(),
          platform_id: 'debian',
          type: this.determinePackageType(name, description),
          repository: 'official',
          popularity_score: Math.floor(Math.random() * 100)
        })
        
        processedCount++
        
        // Send progress every 1000 packages
        if (processedCount % 1000 === 0) {
          const progress = Math.round((processedCount / totalLines) * 100)
          onProgress(`📦 Parsed ${processedCount} packages...`, progress, 100)
        }
      }
    }

    onProgress(`📦 Parsed ${processedCount} total packages`, 100, 100)
    return packages
  }

  // Parse Ubuntu package list format
  private static parseUbuntuPackageList(text: string): CreatePackageInput[] {
    return this.parseUbuntuPackageListWithProgress(text, () => {})
  }

  // Parse with progress callback
  private static parseUbuntuPackageListWithProgress(
    text: string, 
    onProgress: (message: string, progress?: number, total?: number) => void
  ): CreatePackageInput[] {
    const packages: CreatePackageInput[] = []
    const lines = text.split('\n')
    
    onProgress('📋 Analyzing Ubuntu package format...')
    
    // Find where actual packages start
    let packageStartIndex = 0
    
    for (let i = 0; i < Math.min(50, lines.length); i++) {
      const line = lines[i].trim()
      if (line && !line.startsWith('All') && !line.startsWith('Generated') && !line.startsWith('Copyright')) {
        if (packageStartIndex === 0 && line.match(/^[a-z0-9]/)) {
          packageStartIndex = i
        }
      }
    }

    let processedCount = 0
    const totalLines = lines.length - packageStartIndex
    
    for (let i = packageStartIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Skip header lines
      if (line.startsWith('All') || line.startsWith('Generated') || line.startsWith('Copyright')) {
        continue
      }

      // Try Ubuntu pattern: "package-name (version) [repository] description"
      let match = line.match(/^([a-z0-9][a-z0-9+.-]*)\s+\(([^)]+)\)\s+\[([^\]]+)\]\s*(.+)?$/)
      
      if (match) {
        const [, name, version, repository, description] = match
        
        packages.push({
          id: `ubuntu-${name}`,
          name: name,
          description: description?.trim(),
          version: version.trim(),
          platform_id: 'ubuntu',
          type: this.determinePackageType(name, description),
          repository: this.mapUbuntuRepository(repository),
          popularity_score: Math.floor(Math.random() * 100)
        })
        
        processedCount++
        
        // Send progress every 1000 packages
        if (processedCount % 1000 === 0) {
          const progress = Math.round((processedCount / totalLines) * 100)
          onProgress(`📦 Parsed ${processedCount} packages...`, progress, 100)
        }
      }
    }

    onProgress(`📦 Parsed ${processedCount} total packages`, 100, 100)
    return packages
  }

  // Map Ubuntu repository to our enum
  private static mapUbuntuRepository(repo: string): 'official' | 'third-party' {
    switch (repo.toLowerCase()) {
      case 'main':
      case 'restricted':
      case 'universe':
      case 'multiverse':
        return 'official'
      default:
        return 'third-party'
    }
  }

  // Determine if package is GUI or CLI based on name and description
  private static determinePackageType(name: string, description?: string): 'gui' | 'cli' {
    const guiKeywords = [
      'gui', 'gtk', 'qt', 'x11', 'desktop', 'window', 'display',
      'graphical', 'visual', 'image', 'video', 'audio', 'media',
      'browser', 'editor', 'viewer', 'player', 'manager',
      'game', 'games', 'steam', 'wine'
    ]
    
    const cliKeywords = [
      'cli', 'command', 'terminal', 'console', 'shell', 'bash',
      'tool', 'utility', 'daemon', 'service', 'server', 'client',
      'lib', 'dev', 'debug', 'build', 'compile'
    ]
    
    const searchText = `${name} ${description || ''}`.toLowerCase()
    
    for (const keyword of guiKeywords) {
      if (searchText.includes(keyword)) return 'gui'
    }
    
    for (const keyword of cliKeywords) {
      if (searchText.includes(keyword)) return 'cli'
    }
    
    return 'cli'
  }

  // Store packages in database
  private static async storePackages(platformId: string, packages: CreatePackageInput[]): Promise<void> {
    await this.storePackagesWithProgress(platformId, packages, () => {})
  }

  // Store with progress callback
  private static async storePackagesWithProgress(
    platformId: string, 
    packages: CreatePackageInput[],
    onProgress: (message: string, progress?: number, total?: number) => void
  ): Promise<void> {
    onProgress(`💾 Storing ${packages.length} packages for platform ${platformId}...`)
    
    let added = 0
    let skipped = 0
    let processed = 0
    const batchSize = 50 // Smaller batches for better performance

    // Process in batches
    for (let i = 0; i < packages.length; i += batchSize) {
      const batch = packages.slice(i, i + batchSize)
      
      for (const pkg of batch) {
        try {
          const existing = await PackageService.getById(pkg.id)
          
          if (existing) {
            // Skip if version is the same (no need to update)
            if (existing.version === pkg.version) {
              skipped++
              processed++
              continue
            }
            
            // Only update if version changed
            await PackageService.update(pkg.id, {
              description: pkg.description,
              version: pkg.version,
              type: pkg.type,
              repository: pkg.repository,
              popularity_score: pkg.popularity_score
            })
          } else {
            // Create new package
            await PackageService.create(pkg)
            added++
          }
        } catch (error) {
          console.error(`Error storing package ${pkg.id}:`, error)
        }
        
        processed++
      }
      
      // Send progress every batch
      if (processed % 100 === 0) {
        const progress = Math.round((processed / packages.length) * 100)
        onProgress(`💾 Processed ${processed} packages... (${added} new, ${skipped} skipped)`, progress, 100)
      }
      
      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    onProgress(`💾 Completed: ${added} new, ${skipped} skipped packages`, 100, 100)
  }

  // Sync both Debian and Ubuntu packages
  static async syncAll(): Promise<void> {
    console.log('🔄 Starting sync of all Debian-based packages...')
    
    try {
      await this.fetchDebianPackages()
      await this.fetchUbuntuPackages()
      
      console.log('✅ All Debian-based packages synced successfully')
    } catch (error) {
      console.error('❌ Error during sync:', error)
      throw error
    }
  }
}
