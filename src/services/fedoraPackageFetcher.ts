interface FedoraPackage {
  name: string
  version: string
  description: string
  repository: string
}

export class FedoraPackageFetcher {
  private baseUrl = 'https://packages.fedoraproject.org'
  
  /**
   * Fetch all Fedora packages with progress callback
   */
  async fetchAllPackages(
    onProgress?: (current: number, total: number, packageName: string) => void
  ): Promise<FedoraPackage[]> {
    console.log('🎩 Starting Fedora package fetch...')
    
    const allPackages: FedoraPackage[] = []
    
    try {
      // Step 1: Get all index prefixes
      console.log('📄 Fetching index page...')
      const indexResponse = await fetch(`${this.baseUrl}/index-static.html`)
      if (!indexResponse.ok) {
        throw new Error(`HTTP error! status: ${indexResponse.status}`)
      }
      
      const indexHtml = await indexResponse.text()
      const prefixes = this.extractPrefixes(indexHtml)
      
      console.log(`📦 Found ${prefixes.length} index prefixes`)
      
      // Step 2: Fetch packages from each prefix
      let processedPrefixes = 0
      for (const prefix of prefixes) {
        try {
          const prefixUrl = `${this.baseUrl}/index/${prefix}.html`
          console.log(`📄 Fetching prefix ${prefix}... (${processedPrefixes + 1}/${prefixes.length})`)
          
          const response = await fetch(prefixUrl)
          if (!response.ok) {
            console.error(`❌ Failed to fetch prefix ${prefix}: ${response.status}`)
            continue
          }
          
          const html = await response.text()
          const packages = this.extractPackagesFromPrefix(html, prefix)
          
          allPackages.push(...packages)
          processedPrefixes++
          
          if (onProgress && packages.length > 0) {
            onProgress(allPackages.length, allPackages.length, packages[0].name)
          }
          
          // Rate limiting: wait 100ms between requests
          await new Promise(resolve => setTimeout(resolve, 100))
          
        } catch (error) {
          console.error(`❌ Error fetching prefix ${prefix}:`, error)
        }
      }
      
      console.log(`✅ Fetch completed! Total packages: ${allPackages.length}`)
      return allPackages
      
    } catch (error) {
      console.error('❌ Error fetching Fedora packages:', error)
      throw error
    }
  }
  
  /**
   * Extract prefix links from index page
   */
  private extractPrefixes(html: string): string[] {
    const prefixes: string[] = []
    
    // Match: <a href="./index/0a.html">0a</a>
    const prefixRegex = /<a href="\.\/index\/([^"]+)\.html">/gi
    
    let match
    while ((match = prefixRegex.exec(html)) !== null) {
      prefixes.push(match[1])
    }
    
    return prefixes
  }
  
  /**
   * Extract package names from a prefix page
   */
  private extractPackagesFromPrefix(html: string, prefix: string): FedoraPackage[] {
    const packages: FedoraPackage[] = []
    
    // Match: <li><a href="../pkgs/ffmpeg/ffmpeg-free/index.html">ffmpeg-free</a></li>
    const packageRegex = /<li><a href="\.\.\/pkgs\/[^"]+">([^<]+)<\/a><\/li>/gi
    
    let match
    while ((match = packageRegex.exec(html)) !== null) {
      const name = match[1].trim()
      
      if (name) {
        packages.push({
          name,
          version: 'latest', // We'll get version from API later if needed
          description: `Fedora package: ${name}`,
          repository: 'official'
        })
      }
    }
    
    return packages
  }
  
  /**
   * Store packages in database
   */
  async storePackages(
    packages: FedoraPackage[],
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    const { query } = await import('@/lib/database/config')
    
    console.log(`💾 Storing ${packages.length} Fedora packages in database...`)
    
    const batchSize = 100
    let stored = 0
    let updated = 0
    let skipped = 0
    
    for (let i = 0; i < packages.length; i += batchSize) {
      const batch = packages.slice(i, i + batchSize)
      
      for (const pkg of batch) {
        try {
          // Check if package already exists
          const existingResult = await query(
            'SELECT id, version FROM packages WHERE name = $1 AND platform_id = $2',
            [pkg.name, 'fedora']
          )
          
          if (existingResult.rows.length === 0) {
            // Insert new package
            await query(
              `INSERT INTO packages (id, name, description, version, platform_id, type, repository, popularity_score, is_active)
               VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)`,
              [pkg.name, pkg.description, pkg.version, 'fedora', null, null, 0, true]
            )
            stored++
          } else if (existingResult.rows[0].version !== pkg.version) {
            // Update if version changed
            await query(
              `UPDATE packages 
               SET version = $1, description = $2, repository = $3, updated_at = NOW()
               WHERE id = $4`,
              [pkg.version, pkg.description, null, existingResult.rows[0].id]
            )
            updated++
          } else {
            skipped++
          }
          
          if (onProgress && (stored + updated + skipped) % 100 === 0) {
            onProgress(stored + updated + skipped, packages.length)
          }
          
        } catch (error) {
          console.error(`Error storing package ${pkg.name}:`, error)
        }
      }
    }
    
    console.log(`✅ Stored ${stored} new packages, updated ${updated}, skipped ${skipped}`)
  }
}
