interface ArchPackage {
  name: string
  version: string
  description: string
  architecture: string
  repository: string
  lastUpdated: string
}

// Simple HTML parser without external dependencies
function parseHTML(html: string) {
  return {
    querySelector: (selector: string) => {
      const regex = new RegExp(`<${selector}[^>]*>([\\s\\S]*?)<\\/${selector}>`, 'gi')
      const match = regex.exec(html)
      return match ? { textContent: match[1].replace(/<[^>]*>/g, '').trim() } : null
    },
    querySelectorAll: (selector: string) => {
      const results: any[] = []
      const regex = new RegExp(`<${selector}[^>]*>([\\s\\S]*?)<\\/${selector}>`, 'gi')
      let match
      while ((match = regex.exec(html)) !== null) {
        results.push({ innerHTML: match[1], textContent: match[1].replace(/<[^>]*>/g, '').trim() })
      }
      return results
    }
  }
}

export class ArchPackageFetcher {
  private baseUrl = 'https://archlinux.org/packages'
  
  /**
   * Fetch all Arch Linux packages with progress callback
   */
  async fetchAllPackages(
    onProgress?: (current: number, total: number, packageName: string) => void
  ): Promise<ArchPackage[]> {
    console.log('🔍 Starting Arch Linux package fetch...')
    
    const allPackages: ArchPackage[] = []
    let currentPage = 1
    let totalPages = 1
    
    try {
      // Fetch first page to get total pages
      const firstPageUrl = `${this.baseUrl}/?page=1`
      console.log(`📄 Fetching first page: ${firstPageUrl}`)
      
      const firstPageResponse = await fetch(firstPageUrl)
      if (!firstPageResponse.ok) {
        throw new Error(`HTTP error! status: ${firstPageResponse.status}`)
      }
      
      const firstPageHtml = await firstPageResponse.text()
      
      // Parse total packages and pages
      const statsMatch = firstPageHtml.match(/(\d+)\s+matching packages[\s\S]*?Page \d+ of (\d+)/)
      const totalPackages = statsMatch ? parseInt(statsMatch[1]) : 0
      totalPages = statsMatch ? parseInt(statsMatch[2]) : 1
      
      console.log(`📦 Total packages: ${totalPackages}`)
      console.log(`📄 Total pages: ${totalPages}`)
      
      // Parse first page packages
      const firstPagePackages = this.parsePackagesFromHtml(firstPageHtml)
      allPackages.push(...firstPagePackages)
      
      if (onProgress) {
        onProgress(allPackages.length, totalPackages, firstPagePackages[0]?.name || 'N/A')
      }
      
      // Fetch remaining pages
      for (currentPage = 2; currentPage <= totalPages; currentPage++) {
        const pageUrl = `${this.baseUrl}/?page=${currentPage}`
        console.log(`📄 Fetching page ${currentPage}/${totalPages}...`)
        
        try {
          const response = await fetch(pageUrl)
          if (!response.ok) {
            console.error(`❌ Failed to fetch page ${currentPage}: ${response.status}`)
            continue
          }
          
          const html = await response.text()
          const packages = this.parsePackagesFromHtml(html)
          
          allPackages.push(...packages)
          
          if (onProgress && packages.length > 0) {
            onProgress(allPackages.length, totalPackages, packages[0].name)
          }
          
          // Rate limiting: wait 100ms between requests
          await new Promise(resolve => setTimeout(resolve, 100))
          
        } catch (error) {
          console.error(`❌ Error fetching page ${currentPage}:`, error)
        }
      }
      
      console.log(`✅ Fetch completed! Total packages: ${allPackages.length}`)
      return allPackages
      
    } catch (error) {
      console.error('❌ Error fetching Arch packages:', error)
      throw error
    }
  }
  
  /**
   * Parse packages from HTML using regex
   */
  private parsePackagesFromHtml(html: string): ArchPackage[] {
    const packages: ArchPackage[] = []
    
    // Match all table rows
    const rowRegex = /<tr>\s*<td>([^<]+)<\/td>\s*<td>([^<]+)<\/td>\s*<td><a[^>]*>([^<]+)<\/a><\/td>\s*<td>([^<]+)<\/td>\s*<td[^>]*>([^<]*)<\/td>\s*<td>([^<]*)<\/td>/gi
    
    let match
    while ((match = rowRegex.exec(html)) !== null) {
      try {
        const architecture = match[1].trim()
        const repository = match[2].trim()
        const name = match[3].trim()
        const version = match[4].trim()
        const description = match[5].trim()
        const lastUpdated = match[6].trim()
        
        if (name && version) {
          packages.push({
            name,
            version,
            description: description || 'No description available',
            architecture,
            repository: repository.toLowerCase(),
            lastUpdated
          })
        }
      } catch (error) {
        console.error('Error parsing package row:', error)
      }
    }
    
    return packages
  }
  
  /**
   * Store packages in database
   */
  async storePackages(
    packages: ArchPackage[],
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    const { query } = await import('@/lib/database/config')
    
    console.log(`💾 Storing ${packages.length} Arch packages in database...`)
    
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
            [pkg.name, 'arch']
          )
          
          if (existingResult.rows.length === 0) {
            // Insert new package (id will be auto-generated by SERIAL)
            await query(
              `INSERT INTO packages (id, name, description, version, platform_id, type, repository, popularity_score, is_active)
               VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)`,
              [pkg.name, pkg.description, pkg.version, 'arch', null, null, 0, true]
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
