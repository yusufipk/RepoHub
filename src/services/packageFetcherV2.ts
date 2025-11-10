import { PackageService } from './packageService'
import { CreatePackageInput } from '@/models/Package'

export class PackageFetcherV2 {
  private static readonly DEBIAN_PACKAGES_URL = 'https://packages.debian.org/stable/allpackages?format=txt.gz'
  private static readonly UBUNTU_PACKAGES_URL = 'https://packages.ubuntu.com/noble/allpackages?format=txt.gz'

  // Fetch and parse Debian packages with better error handling
  static async fetchDebianPackages(): Promise<void> {
    console.log('🔄 Fetching Debian packages from official repository...')
    
    try {
      // Use Node.js built-in fetch with proper headers
      const response = await fetch(this.DEBIAN_PACKAGES_URL, {
        headers: {
          'Accept-Encoding': 'gzip, deflate',
          'User-Agent': 'RepoHub-Package-Fetcher/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Debian packages: ${response.statusText}`)
      }

      // Get the response as buffer
      const buffer = await response.arrayBuffer()
      
      // Try to decompress with multiple methods
      let text: string
      
      try {
        // Method 1: Try direct text (in case it's not compressed)
        text = new TextDecoder().decode(buffer)
        
        // Check if it looks like gzip (starts with gzip magic bytes)
        const bytes = new Uint8Array(buffer.slice(0, 2))
        if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
          throw new Error('Data is compressed, need to decompress')
        }
      } catch {
        // Method 2: Try zlib decompression
        try {
          const { gunzip } = await import('zlib')
          const decompressed = await new Promise<Buffer>((resolve, reject) => {
            gunzip(new Uint8Array(buffer), (err, result) => {
              if (err) reject(err)
              else resolve(result)
            })
          })
          text = decompressed.toString('utf-8')
        } catch (gzipError) {
          // Method 3: Try streaming decompression
          try {
            const { createGunzip } = await import('zlib')
            const { Readable } = await import('stream')
            const { pipeline } = await import('stream/promises')
            
            const readable = Readable.from([new Uint8Array(buffer)])
            const gunzip = createGunzip()
            const chunks: Buffer[] = []
            
            gunzip.on('data', (chunk) => chunks.push(chunk))
            
            await pipeline(readable, gunzip)
            text = Buffer.concat(chunks).toString('utf-8')
          } catch (streamError) {
            throw new Error(`All decompression methods failed. Gzip error: ${gzipError}, Stream error: ${streamError}`)
          }
        }
      }

      const packages = this.parseDebianPackageList(text)
      console.log(`📊 Parsed ${packages.length} Debian packages`)
      
      // Store in database
      await this.storePackages('debian', packages)
      
      console.log('✅ Debian packages fetched and stored successfully')
    } catch (error) {
      console.error('❌ Error fetching Debian packages:', error)
      throw error
    }
  }

  // Fetch and parse Ubuntu packages with better error handling
  static async fetchUbuntuPackages(): Promise<void> {
    console.log('🔄 Fetching Ubuntu packages from official repository...')
    
    try {
      // Use Node.js built-in fetch with proper headers
      const response = await fetch(this.UBUNTU_PACKAGES_URL, {
        headers: {
          'Accept-Encoding': 'gzip, deflate',
          'User-Agent': 'RepoHub-Package-Fetcher/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Ubuntu packages: ${response.statusText}`)
      }

      // Get the response as buffer
      const buffer = await response.arrayBuffer()
      
      // Try to decompress with multiple methods
      let text: string
      
      try {
        // Method 1: Try direct text (in case it's not compressed)
        text = new TextDecoder().decode(buffer)
        
        // Check if it looks like gzip (starts with gzip magic bytes)
        const bytes = new Uint8Array(buffer.slice(0, 2))
        if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
          throw new Error('Data is compressed, need to decompress')
        }
      } catch {
        // Method 2: Try zlib decompression
        try {
          const { gunzip } = await import('zlib')
          const decompressed = await new Promise<Buffer>((resolve, reject) => {
            gunzip(new Uint8Array(buffer), (err, result) => {
              if (err) reject(err)
              else resolve(result)
            })
          })
          text = decompressed.toString('utf-8')
        } catch (gzipError) {
          // Method 3: Try streaming decompression
          try {
            const { createGunzip } = await import('zlib')
            const { Readable } = await import('stream')
            const { pipeline } = await import('stream/promises')
            
            const readable = Readable.from([new Uint8Array(buffer)])
            const gunzip = createGunzip()
            const chunks: Buffer[] = []
            
            gunzip.on('data', (chunk) => chunks.push(chunk))
            
            await pipeline(readable, gunzip)
            text = Buffer.concat(chunks).toString('utf-8')
          } catch (streamError) {
            throw new Error(`All decompression methods failed. Gzip error: ${gzipError}, Stream error: ${streamError}`)
          }
        }
      }

      const packages = this.parseUbuntuPackageList(text)
      console.log(`📊 Parsed ${packages.length} Ubuntu packages`)
      
      // Store in database
      await this.storePackages('ubuntu', packages)
      
      console.log('✅ Ubuntu packages fetched and stored successfully')
    } catch (error) {
      console.error('❌ Error fetching Ubuntu packages:', error)
      throw error
    }
  }

  // Parse Debian package list format
  private static parseDebianPackageList(text: string): CreatePackageInput[] {
    const packages: CreatePackageInput[] = []
    const lines = text.split('\n')
    
    // Skip header lines until we find package entries
    let packageStartIndex = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^[a-z0-9][a-z0-9+.-]*\s+\([^)]+\)/)) {
        packageStartIndex = i
        break
      }
    }

    for (let i = packageStartIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Parse package line format: "package-name (version) description"
      const match = line.match(/^([a-z0-9][a-z0-9+.-]*)\s+\(([^)]+)\)\s*(.+)?$/)
      
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
      }
    }

    return packages
  }

  // Parse Ubuntu package list format (with repository info)
  private static parseUbuntuPackageList(text: string): CreatePackageInput[] {
    const packages: CreatePackageInput[] = []
    const lines = text.split('\n')
    
    // Skip header lines until we find package entries
    let packageStartIndex = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^[a-z0-9][a-z0-9+.-]*\s+\([^)]+\)\s+\[.*\]/)) {
        packageStartIndex = i
        break
      }
    }

    for (let i = packageStartIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Parse package line format: "package-name (version) [repository] description"
      const match = line.match(/^([a-z0-9][a-z0-9+.-]*)\s+\(([^)]+)\)\s+\[([^\]]+)\]\s*(.+)?$/)
      
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
      }
    }

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
    console.log(`💾 Storing ${packages.length} packages for platform ${platformId}...`)
    
    let added = 0
    let updated = 0
    let batchSize = 100
    let processed = 0

    for (let i = 0; i < packages.length; i += batchSize) {
      const batch = packages.slice(i, i + batchSize)
      
      for (const pkg of batch) {
        try {
          const existing = await PackageService.getById(pkg.id)
          
          if (existing) {
            await PackageService.update(pkg.id, {
              description: pkg.description,
              version: pkg.version,
              type: pkg.type,
              repository: pkg.repository,
              popularity_score: pkg.popularity_score
            })
            updated++
          } else {
            await PackageService.create(pkg)
            added++
          }
        } catch (error) {
          console.error(`Error storing package ${pkg.id}:`, error)
        }
        
        processed++
        
        if (processed % 100 === 0) {
          console.log(`📈 Processed ${processed}/${packages.length} packages...`)
        }
      }
    }
    
    console.log(`📈 Final: Added: ${added}, Updated: ${updated}`)
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
