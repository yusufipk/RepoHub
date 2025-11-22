import { query } from '@/lib/database/config'
import { Package, CreatePackageInput, UpdatePackageInput, PackageFilter } from '@/models/Package'

export class PackageService {
  // Get packages with filtering and pagination
  static async getMany(filter: PackageFilter = {}): Promise<{ packages: Package[], total: number }> {
    const {
      platform_id,
      category_id,
      type,
      repository,
      search,
      limit = 50,
      offset = 0,
      sort_by = 'name',
      sort_order = 'asc'
    } = filter

    // Build WHERE clause
    const whereConditions = []
    const values = []
    let paramIndex = 1

    if (platform_id) {
      whereConditions.push(`p.platform_id = $${paramIndex++}`)
      values.push(platform_id)
    }

    if (category_id) {
      whereConditions.push(`p.category_id = $${paramIndex++}`)
      values.push(category_id)
    }

    if (type) {
      whereConditions.push(`p.type = $${paramIndex++}`)
      values.push(type)
    }

    if (repository) {
      whereConditions.push(`p.repository = $${paramIndex++}`)
      values.push(repository)
    }

    if (search) {
      whereConditions.push(`(
        p.name ILIKE $${paramIndex} OR
        p.description ILIKE $${paramIndex} OR
        REPLACE(p.name, '-', ' ') ILIKE $${paramIndex} OR
        REPLACE(p.name, '-', '') ILIKE $${paramIndex}
      )`)
      values.push(`%${search}%`)
      paramIndex++
    }

    whereConditions.push('p.is_active = true')

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Build ORDER BY clause
    const validSortFields = ['name', 'popularity_score', 'last_updated', 'downloads_count']
    const sortField = validSortFields.includes(sort_by || '') ? sort_by : 'name'
    const sortDirection = sort_order === 'desc' ? 'DESC' : 'ASC'

    let orderClause = `ORDER BY p.${sortField} ${sortDirection}`

    // Capture values for count query before adding sort parameters
    const countValues = [...values]

    // If searching, prioritize name matches
    if (search) {
      // 1. Exact name match
      // 2. Name starts with search term
      // 3. Name contains search term
      // 4. Normalized name matches (hyphens -> spaces, or stripped)
      // 5. Description contains search term
      // Then sort by popularity/name as tie-breaker
      orderClause = `
        ORDER BY 
          CASE 
            WHEN p.name ILIKE $${paramIndex} THEN 0        -- Exact match
            WHEN p.name ILIKE $${paramIndex + 1} THEN 1    -- Starts with
            WHEN p.name ILIKE $${paramIndex + 2} THEN 2    -- Contains in name
            WHEN REPLACE(p.name, '-', ' ') ILIKE $${paramIndex + 2} THEN 2 -- Normalized (space)
            WHEN REPLACE(p.name, '-', '') ILIKE $${paramIndex + 2} THEN 2  -- Normalized (strip)
            ELSE 3                                         -- Contains in description only
          END ASC,
          p.popularity_score DESC,
          p.name ASC
      `
      // Add params for the CASE statement
      values.push(search)           // Exact match
      values.push(`${search}%`)     // Starts with
      values.push(`%${search}%`)    // Contains
      paramIndex += 3
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM packages p
      ${whereClause}
    `
    const countResult = await query(countQuery, countValues)
    const total = parseInt(countResult.rows[0].total)

    // Get packages with joins (simplified)
    const packagesQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.version,
        p.platform_id,
        p.type,
        p.repository,
        p.popularity_score,
        p.is_active,
        p.created_at,
        p.updated_at,
        pl.name as platform_name,
        pl.package_manager as platform_package_manager,
        pl.icon as platform_icon
      FROM packages p
      LEFT JOIN platforms pl ON p.platform_id = pl.id
      ${whereClause}
      ${orderClause}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `

    const cappedLimit = Math.min(limit, 100)
    values.push(cappedLimit, offset)
    const packagesResult = await query(packagesQuery, values)

    // Transform the results
    const packages = packagesResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description || 'No description available',
      version: row.version,
      platform_id: row.platform_id,
      type: row.type || 'cli',
      repository: row.repository || 'official',
      popularity_score: row.popularity_score || 0,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      platform: row.platform_name ? {
        id: row.platform_id,
        name: row.platform_name,
        package_manager: row.platform_package_manager,
        icon: row.platform_icon
      } : undefined,
      tags: [] // Empty tags for now
    }))

    return { packages, total }
  }

  // Get package by ID
  static async getById(id: string): Promise<Package | null> {
    const packageQuery = `
      SELECT 
        p.*,
        pl.name as platform_name,
        pl.package_manager as platform_package_manager,
        pl.icon as platform_icon,
        c.name as category_name,
        l.name as license_name,
        l.url as license_url,
        COALESCE(
          ARRAY_AGG(DISTINCT pt.tag) FILTER (WHERE pt.tag IS NOT NULL),
          ARRAY[]::VARCHAR[]
        ) as tags
      FROM packages p
      LEFT JOIN platforms pl ON p.platform_id = pl.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN licenses l ON p.license_id = l.id
      LEFT JOIN package_tags pt ON p.id = pt.package_id
      WHERE p.id = $1 AND p.is_active = true
      GROUP BY p.id, pl.name, pl.package_manager, pl.icon, c.name, l.name, l.url
    `

    const result = await query(packageQuery, [id])

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      version: row.version,
      platform_id: row.platform_id,
      category_id: row.category_id,
      license_id: row.license_id,
      type: row.type,
      repository: row.repository,
      homepage_url: row.homepage_url,
      download_url: row.download_url,
      last_updated: row.last_updated,
      downloads_count: row.downloads_count,
      popularity_score: row.popularity_score,
      is_active: row.is_active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      platform: row.platform_name ? {
        id: row.platform_id,
        name: row.platform_name,
        package_manager: row.platform_package_manager,
        icon: row.platform_icon
      } : undefined,
      category: row.category_name ? {
        id: row.category_id,
        name: row.category_name
      } : undefined,
      license: row.license_name ? {
        id: row.license_id,
        name: row.license_name,
        url: row.license_url
      } : undefined,
      tags: row.tags || []
    }
  }

  // Create new package
  static async create(data: CreatePackageInput): Promise<Package> {
    const {
      id,
      name,
      description,
      version,
      platform_id,
      category_id,
      license_id,
      type,
      repository,
      homepage_url,
      download_url,
      popularity_score
    } = data

    const result = await query(
      `INSERT INTO packages (
        id, name, description, version, platform_id, category_id, 
        license_id, type, repository, homepage_url, download_url, 
        popularity_score, last_seen_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()) 
      RETURNING *`,
      [id, name, description, version, platform_id, category_id,
        license_id, type, repository, homepage_url, download_url,
        popularity_score]
    )

    const createdPackage = await this.getById(result.rows[0].id)
    if (!createdPackage) {
      throw new Error('Failed to create package')
    }
    return createdPackage
  }

  // Update package
  static async update(id: string, data: UpdatePackageInput): Promise<Package | null> {
    const fields = []
    const values = []
    let paramIndex = 1

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex++}`)
        values.push(value)
      }
    }

    // Always mark as seen and active on update
    fields.push('last_seen_at = NOW()')
    fields.push('is_active = true')
    fields.push('updated_at = NOW()')

    if (fields.length === 0) {
      return this.getById(id)
    }

    values.push(id)
    await query(
      `UPDATE packages SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    )

    return this.getById(id)
  }

  // Delete package (soft delete)
  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'UPDATE packages SET is_active = false WHERE id = $1',
      [id]
    )
    return (result.rowCount ?? 0) > 0
  }

  // Add tags to package
  static async addTags(packageId: string, tags: string[]): Promise<void> {
    if (tags.length === 0) return

    const values = tags.map((tag, index) => `($1, $${index + 2})`).join(', ')
    const params = [packageId, ...tags]

    await query(
      `INSERT INTO package_tags (package_id, tag) VALUES ${values} ON CONFLICT DO NOTHING`,
      params
    )
  }

  // Remove tags from package
  static async removeTags(packageId: string, tags: string[]): Promise<void> {
    if (tags.length === 0) return

    await query(
      'DELETE FROM package_tags WHERE package_id = $1 AND tag = ANY($2)',
      [packageId, tags]
    )
  }

  // Get popular packages
  static async getPopular(limit: number = 10): Promise<Package[]> {
    const result = await this.getMany({
      limit,
      sort_by: 'popularity_score',
      sort_order: 'desc'
    })
    return result.packages
  }

  // Get recently updated packages
  static async getRecentlyUpdated(limit: number = 10): Promise<Package[]> {
    const result = await this.getMany({
      limit,
      sort_by: 'last_updated',
      sort_order: 'desc'
    })
    return result.packages
  }
}
