export interface Package {
  id: string
  name: string
  description?: string
  version?: string
  platform_id: string
  category_id?: number
  license_id?: number
  type?: 'gui' | 'cli'
  repository?: 'official' | 'third-party' | 'aur'
  homepage_url?: string
  download_url?: string
  last_updated?: Date
  downloads_count?: number
  popularity_score?: number
  is_active: boolean
  created_at: Date
  updated_at: Date
  
  // Joined fields
  platform?: Platform
  category?: Category
  license?: License
  tags?: string[]
  dependencies?: Package[]
}

export interface Platform {
  id: string
  name: string
  package_manager: string
  icon?: string
}

export interface Category {
  id: number
  name: string
  description?: string
}

export interface License {
  id: number
  name: string
  url?: string
}

export interface CreatePackageInput {
  id: string
  name: string
  description?: string
  version?: string
  platform_id: string
  category_id?: number
  license_id?: number
  type?: 'gui' | 'cli'
  repository?: 'official' | 'third-party' | 'aur'
  homepage_url?: string
  download_url?: string
  popularity_score?: number
}

export interface UpdatePackageInput {
  name?: string
  description?: string
  version?: string
  category_id?: number
  license_id?: number
  type?: 'gui' | 'cli'
  repository?: 'official' | 'third-party' | 'aur'
  homepage_url?: string
  download_url?: string
  popularity_score?: number
  is_active?: boolean
}

export interface PackageFilter {
  platform_id?: string
  category_id?: number
  type?: 'gui' | 'cli'
  repository?: 'official' | 'third-party' | 'aur'
  search?: string
  limit?: number
  offset?: number
  sort_by?: 'name' | 'popularity_score' | 'last_updated' | 'downloads_count'
  sort_order?: 'asc' | 'desc'
}
