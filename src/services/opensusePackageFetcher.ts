interface OpenSUSEPackage {
  name: string
  version: string
  description: string
  repository: string
}

export class OpenSUSEPackageFetcher {
  private baseUrl = 'https://software.opensuse.org'
  
  /**
   * Fetch all openSUSE packages with progress callback
   * Note: OpenSUSE has a different API structure, we'll use their search API
   */
  async fetchAllPackages(
    onProgress?: (current: number, total: number, packageName: string) => void
  ): Promise<OpenSUSEPackage[]> {
    console.log('🦎 Starting openSUSE package fetch...')
    
    const allPackages: OpenSUSEPackage[] = []
    
    try {
      // OpenSUSE provides package lists through their API
      // We'll fetch popular packages for now
      // Full implementation would need to query their OBS API
      
      console.log('📦 Fetching openSUSE packages from API...')
      
      // Note: This is a simplified implementation
      // Full implementation would require OBS API integration
      // For now, we'll fetch from the search interface
      
      const letters = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('')
      
      for (let i = 0; i < letters.length; i++) {
        const letter = letters[i]
        console.log(`📄 Fetching packages starting with '${letter}'... (${i + 1}/${letters.length})`)
        
        try {
          // OpenSUSE search API endpoint
          const searchUrl = `${this.baseUrl}/search?q=${letter}*&baseproject=ALL&includeBaseProject=true`
          const response = await fetch(searchUrl, {
            headers: {
              'Accept': 'application/json'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            const packages = this.extractPackagesFromSearch(data)
            allPackages.push(...packages)
            
            if (onProgress && packages.length > 0) {
              onProgress(allPackages.length, allPackages.length, packages[0].name)
            }
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 200))
          
        } catch (error) {
          console.error(`❌ Error fetching packages for '${letter}':`, error)
        }
      }
      
      console.log(`✅ Fetch completed! Total packages: ${allPackages.length}`)
      return allPackages
      
    } catch (error) {
      console.error('❌ Error fetching openSUSE packages:', error)
      throw error
    }
  }
  
  /**
   * Extract packages from search results
   */
  private extractPackagesFromSearch(data: any): OpenSUSEPackage[] {
    const packages: OpenSUSEPackage[] = []
    
    try {
      if (data && Array.isArray(data)) {
        for (const item of data) {
          if (item.name) {
            packages.push({
              name: item.name,
              version: item.version || 'latest',
              description: item.summary || `openSUSE package: ${item.name}`,
              repository: 'official'
            })
          }
        }
      }
    } catch (error) {
      console.error('Error extracting packages:', error)
    }
    
    return packages
  }
  
  /**
   * Store packages in database
   */
  async storePackages(
    packages: OpenSUSEPackage[],
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    const { query } = await import('@/lib/database/config')
    
    console.log(`💾 Storing ${packages.length} openSUSE packages in database...`)
    
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
            [pkg.name, 'opensuse']
          )
          
          if (existingResult.rows.length === 0) {
            // Insert new package
            await query(
              `INSERT INTO packages (id, name, description, version, platform_id, type, repository, popularity_score, is_active, last_seen_at)
               VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
              [pkg.name, pkg.description, pkg.version, 'opensuse', null, pkg.repository, 0, true]
            )
            stored++
          } else if (existingResult.rows[0].version !== pkg.version) {
            // Update if version changed
            await query(
              `UPDATE packages 
               SET version = $1, description = $2, repository = $3, last_seen_at = NOW(), is_active = true, updated_at = NOW()
               WHERE id = $4`,
              [pkg.version, pkg.description, pkg.repository, existingResult.rows[0].id]
            )
            updated++
          } else {
            // Still mark as seen to avoid pruning
            await query(
              `UPDATE packages SET last_seen_at = NOW(), is_active = true WHERE id = $1`,
              [existingResult.rows[0].id]
            )
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

