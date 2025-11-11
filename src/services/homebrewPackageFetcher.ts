interface HomebrewPackage {
  name: string
  full_name: string
  version: string
  description: string
  homepage: string
  license: string
}

interface HomebrewAPIResponse {
  name: string
  full_name: string
  desc: string
  homepage: string
  license: string
  versions: {
    stable: string
    bottle: boolean
    head: string | null
  }
}

interface HomebrewCaskResponse {
  token: string
  full_token: string
  name: string[]
  desc: string
  homepage: string
  version: string
}

export class HomebrewPackageFetcher {
  private formulaApiUrl = 'https://formulae.brew.sh/api/formula.json'
  private caskApiUrl = 'https://formulae.brew.sh/api/cask.json'
  
  /**
   * Fetch all Homebrew packages (formulae + casks) with progress callback
   */
  async fetchAllPackages(
    onProgress?: (current: number, total: number, packageName: string) => void
  ): Promise<HomebrewPackage[]> {
    console.log('🍎 Starting Homebrew package fetch...')
    
    const allPackages: HomebrewPackage[] = []
    
    try {
      // Fetch formulae (CLI tools)
      console.log('📥 Fetching formulae from formulae.brew.sh API...')
      const formulaeResponse = await fetch(this.formulaApiUrl)
      
      if (!formulaeResponse.ok) {
        throw new Error(`HTTP error! status: ${formulaeResponse.status}`)
      }
      
      const formulaeData: HomebrewAPIResponse[] = await formulaeResponse.json()
      console.log(`📦 Total formulae: ${formulaeData.length}`)
      
      for (let i = 0; i < formulaeData.length; i++) {
        const formula = formulaeData[i]
        
        allPackages.push({
          name: formula.name,
          full_name: formula.full_name,
          version: formula.versions.stable || 'unknown',
          description: formula.desc || 'No description available',
          homepage: formula.homepage || '',
          license: formula.license || 'Unknown'
        })
        
        if (onProgress && (i + 1) % 500 === 0) {
          onProgress(allPackages.length, formulaeData.length + 1000, formula.name)
        }
      }
      
      // Fetch casks (GUI applications)
      console.log('📥 Fetching casks from formulae.brew.sh API...')
      const casksResponse = await fetch(this.caskApiUrl)
      
      if (!casksResponse.ok) {
        throw new Error(`HTTP error! status: ${casksResponse.status}`)
      }
      
      const casksData: HomebrewCaskResponse[] = await casksResponse.json()
      console.log(`📦 Total casks: ${casksData.length}`)
      
      for (let i = 0; i < casksData.length; i++) {
        const cask = casksData[i]
        
        allPackages.push({
          name: cask.token,
          full_name: cask.full_token,
          version: cask.version || 'unknown',
          description: cask.desc || cask.name[0] || 'No description available',
          homepage: cask.homepage || '',
          license: 'Unknown' // Casks don't have license info
        })
        
        if (onProgress && (i + 1) % 500 === 0) {
          onProgress(allPackages.length, formulaeData.length + casksData.length, cask.token)
        }
      }
      
      if (onProgress) {
        onProgress(allPackages.length, allPackages.length, allPackages[allPackages.length - 1]?.name || '')
      }
      
      console.log(`✅ Fetch completed! Total packages: ${allPackages.length} (${formulaeData.length} formulae + ${casksData.length} casks)`)
      return allPackages
      
    } catch (error) {
      console.error('❌ Error fetching Homebrew packages:', error)
      throw error
    }
  }
  
  /**
   * Store packages in database
   */
  async storePackages(
    packages: HomebrewPackage[],
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    const { query } = await import('@/lib/database/config')
    
    console.log(`💾 Storing ${packages.length} Homebrew packages in database...`)
    
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
            [pkg.name, 'macos']
          )
          
          if (existingResult.rows.length === 0) {
            // Insert new package
            await query(
              `INSERT INTO packages (id, name, description, version, platform_id, type, repository, popularity_score, is_active)
               VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)`,
              [pkg.name, pkg.description, pkg.version, 'macos', null, null, 0, true]
            )
            stored++
          } else if (existingResult.rows[0].version !== pkg.version) {
            // Update if version changed
            await query(
              `UPDATE packages 
               SET version = $1, description = $2, updated_at = NOW()
               WHERE id = $3`,
              [pkg.version, pkg.description, existingResult.rows[0].id]
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
