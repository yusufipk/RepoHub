interface WingetPackage {
  name: string
  publisher: string
  version: string
  description: string
}

export class WingetPackageFetcher {
  private githubToken = process.env.GITHUB_TOKEN || ''
  private requestCount = 0
  private startTime = Date.now()
  private rlStrict = process.env.GITHUB_RL_STRICT === 'true'
  
  /**
   * Fetch all Winget packages by scraping GitHub repo structure
   * Uses GitHub API with optional token for higher rate limits
   */
  async fetchAllPackages(
    onProgress?: (current: number, total: number, packageName: string) => void
  ): Promise<WingetPackage[]> {
    console.log('🪟 Fetching Winget packages from GitHub repo...')
    
    // Rate limits: 5000/hour with token, 60/hour without
    const rateLimit = this.githubToken ? 5000 : 60
    const safeLimit = Math.floor(rateLimit * 0.8) // Use 80% to be safe
    
    if (this.githubToken) {
      console.log(`✅ Using GitHub token (${rateLimit} req/hour, using ${safeLimit} to be safe)`)
    } else {
      console.log(`⚠️  No GitHub token - limited to ${rateLimit} req/hour`)
      console.log('   Add GITHUB_TOKEN to .env for higher limits')
    }

    const allPackages: WingetPackage[] = []
    const packageSet = new Set<string>()
    
    // Letters and numbers in manifests folder
    const folders = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                     'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
                     'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
                     'u', 'v', 'w', 'x', 'y', 'z']
    
    try {
      for (let i = 0; i < folders.length; i++) {
        const letter = folders[i]
        console.log(`📁 Processing folder: ${letter} (${i + 1}/${folders.length})`)
        
        try {
          const url = `https://api.github.com/repos/microsoft/winget-pkgs/contents/manifests/${letter}`
          const publishers = await this.githubFetch(url)
          console.log(`  Found ${publishers.length} publishers`)
          
          for (const publisher of publishers) {
            if (publisher.type !== 'dir') continue
            
            try {
              const packages = await this.githubFetch(publisher.url)
              
              for (const pkg of packages) {
                if (pkg.type !== 'dir') continue
                
                const identifier = `${publisher.name}.${pkg.name}`
                
                if (!packageSet.has(identifier)) {
                  packageSet.add(identifier)
                  allPackages.push({
                    name: identifier,
                    publisher: publisher.name,
                    version: 'latest',
                    description: `${pkg.name} by ${publisher.name}`
                  })
                }
              }
              
              // Adaptive rate limiting
              await this.adaptiveDelay(safeLimit)
              
            } catch (err) {
              // Skip publisher on error
            }
          }
          
          if (onProgress) {
            onProgress(allPackages.length, folders.length * 300, allPackages[allPackages.length - 1]?.name || 'N/A')
          }
          
          // Log progress
          const elapsed = (Date.now() - this.startTime) / 1000 / 60 // minutes
          const reqPerMin = this.requestCount / elapsed
          console.log(`  📊 Requests: ${this.requestCount} (${reqPerMin.toFixed(1)}/min)`)
          
          // Delay between folders
          await this.adaptiveDelay(safeLimit)
          
        } catch (err) {
          console.error(`  Error processing ${letter}:`, err)
        }
      }
      
      console.log(`✅ Fetch completed! Total: ${allPackages.length}`)
      return allPackages
      
    } catch (error) {
      console.error('❌ Error:', error)
      throw error
    }
  }
  
  /**
   * Adaptive delay to stay under rate limits
   * Calculates delay based on current request rate
   */
  private async adaptiveDelay(safeLimit: number): Promise<void> {
    const elapsedMs = Date.now() - this.startTime
    const elapsedHours = elapsedMs / (1000 * 60 * 60)
    
    // Calculate current rate
    const currentRate = this.requestCount / elapsedHours
    
    // If we're going too fast, add delay
    if (currentRate > safeLimit) {
      // Calculate how long to wait to stay under limit
      const targetRate = safeLimit * 0.9 // 90% of safe limit
      const msPerRequest = (1000 * 60 * 60) / targetRate
      const delayMs = Math.max(0, msPerRequest - (elapsedMs / this.requestCount))
      
      if (delayMs > 100) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    } else {
      // Small base delay
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  // Header-aware rate limit helpers
  private async sleep(ms: number): Promise<void> {
    if (ms > 0) {
      await new Promise(r => setTimeout(r, ms))
    }
  }

  private async waitUntilReset(resetEpochSeconds: number | undefined): Promise<void> {
    const now = Date.now()
    const resetMs = resetEpochSeconds ? resetEpochSeconds * 1000 : 0
    let waitMs = 0
    if (resetMs > now) {
      waitMs = resetMs - now + 2000 // small buffer
    } else {
      // Fallback if header missing
      waitMs = this.githubToken ? 60 * 60 * 1000 : 60 * 1000
    }
    await this.sleep(waitMs)
  }

  private async githubFetch(url: string, retries = 3): Promise<any> {
    const headers: HeadersInit = {}
    if (this.githubToken) headers['Authorization'] = `Bearer ${this.githubToken}`

    const res = await fetch(url, { headers })
    this.requestCount++

    const remainingRaw = res.headers.get('x-ratelimit-remaining') || ''
    const limitRaw = res.headers.get('x-ratelimit-limit') || ''
    const resetRaw = res.headers.get('x-ratelimit-reset') || ''
    const remaining = parseInt(remainingRaw, 10)
    const limit = parseInt(limitRaw, 10)
    const reset = parseInt(resetRaw, 10)

    if (res.status === 403 || (Number.isFinite(remaining) && remaining <= 0)) {
      await this.waitUntilReset(Number.isFinite(reset) ? reset : undefined)
      if (retries > 0) {
        return this.githubFetch(url, retries - 1)
      }
      throw new Error('GitHub rate limit reached')
    }

    if (this.rlStrict && Number.isFinite(limit) && Number.isFinite(remaining) && limit > 0) {
      const fraction = remaining / limit
      if (fraction <= 0.2) {
        await this.waitUntilReset(Number.isFinite(reset) ? reset : undefined)
      }
    }

    if (!res.ok) {
      throw new Error(`GitHub request failed: ${res.status}`)
    }

    return res.json()
  }
  
  /**
   * Store packages in database
   */
  async storePackages(
    packages: WingetPackage[],
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    const { query } = await import('@/lib/database/config')
    
    console.log(`💾 Storing ${packages.length} Winget packages in database...`)
    
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
            [pkg.name, 'windows']
          )
          
          // Debug: log first few checks
          if (stored + updated + skipped < 5) {
            console.log(`Checking: ${pkg.name}`)
            console.log(`  Found: ${existingResult.rows.length} rows`)
            if (existingResult.rows.length > 0) {
              console.log(`  DB version: ${existingResult.rows[0].version}`)
              console.log(`  API version: ${pkg.version}`)
              console.log(`  Same? ${existingResult.rows[0].version === pkg.version}`)
            }
          }
          
          if (existingResult.rows.length === 0) {
            // Insert new package
            await query(
              `INSERT INTO packages (id, name, description, version, platform_id, type, repository, popularity_score, is_active)
               VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)`,
              [pkg.name, pkg.description, pkg.version, 'windows', null, null, 0, true]
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
