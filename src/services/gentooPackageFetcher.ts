interface GentooPackage {
  name: string
  version: string
  description: string
  category: string
  repository: string
}

export class GentooPackageFetcher {
  private baseUrl = 'https://packages.gentoo.org'
  
  /**
   * Fetch all Gentoo packages with progress callback
   */
  async fetchAllPackages(
    onProgress?: (current: number, total: number, packageName: string) => void
  ): Promise<GentooPackage[]> {
    console.log('🗜️ Starting Gentoo package fetch...')
    
    const allPackages: GentooPackage[] = []
    
    try {
      // Step 1: Get all categories
      console.log('📄 Fetching categories...')
      const categoriesResponse = await fetch(`${this.baseUrl}/categories/`)
      if (!categoriesResponse.ok) {
        throw new Error(`HTTP error! status: ${categoriesResponse.status}`)
      }
      
      const categoriesHtml = await categoriesResponse.text()
      const categories = this.extractCategories(categoriesHtml)
      
      console.log(`📦 Found ${categories.length} categories`)
      
      // Step 2: Fetch packages from each category
      let processedCategories = 0
      for (const category of categories) {
        try {
          const categoryUrl = `${this.baseUrl}/categories/${category}`
          console.log(`📄 Fetching category ${category}... (${processedCategories + 1}/${categories.length})`)
          
          const response = await fetch(categoryUrl)
          if (!response.ok) {
            console.error(`❌ Failed to fetch category ${category}: ${response.status}`)
            continue
          }
          
          const html = await response.text()
          const packages = this.extractPackagesFromCategory(html, category)
          
          allPackages.push(...packages)
          processedCategories++
          
          if (onProgress && packages.length > 0) {
            onProgress(allPackages.length, allPackages.length, packages[0].name)
          }
          
          // Rate limiting: wait 200ms between requests
          await new Promise(resolve => setTimeout(resolve, 200))
          
        } catch (error) {
          console.error(`❌ Error fetching category ${category}:`, error)
        }
      }
      
      console.log(`✅ Fetch completed! Total packages: ${allPackages.length}`)
      return allPackages
      
    } catch (error) {
      console.error('❌ Error fetching Gentoo packages:', error)
      throw error
    }
  }
  
  /**
   * Extract category names from categories page
   */
  private extractCategories(html: string): string[] {
    const categories: string[] = []
    
    // Match: <a href="/categories/app-accessibility">app-accessibility</a>
    const categoryRegex = /<a href="\/categories\/([^"]+)">[^<]+<\/a>/gi
    
    let match
    while ((match = categoryRegex.exec(html)) !== null) {
      const category = match[1].trim()
      if (category && !categories.includes(category)) {
        categories.push(category)
      }
    }
    
    return categories
  }
  
  /**
   * Extract package names from a category page
   */
  private extractPackagesFromCategory(html: string, category: string): GentooPackage[] {
    const packages: GentooPackage[] = []
    
    // Match: <a href="/packages/app-accessibility/at-spi2-core">at-spi2-core</a>
    const packageRegex = /<a href="\/packages\/[^"]+\/([^"]+)">([^<]+)<\/a>/gi
    
    let match
    while ((match = packageRegex.exec(html)) !== null) {
      const packageName = match[1].trim()
      const displayName = match[2].trim()
      
      if (packageName && displayName) {
        const fullName = `${category}/${packageName}`
        packages.push({
          name: fullName,
          version: 'latest',
          description: `Gentoo package: ${fullName}`,
          category: category,
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
    packages: GentooPackage[],
    onProgress?: (current: number, total: number) => void
  ): Promise<void> {
    const { query } = await import('@/lib/database/config')
    
    console.log(`💾 Storing ${packages.length} Gentoo packages in database...`)
    
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
            [pkg.name, 'gentoo']
          )
          
          if (existingResult.rows.length === 0) {
            // Insert new package
            await query(
              `INSERT INTO packages (id, name, description, version, platform_id, type, repository, popularity_score, is_active, last_seen_at)
               VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
              [pkg.name, pkg.description, pkg.version, 'gentoo', null, pkg.repository, 0, true]
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

