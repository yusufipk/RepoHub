export interface Platform {
  id: string
  name: string
  packageManager: string
  icon: string
  description?: string
}

export interface Package {
  id: string
  name: string
  description: string
  version: string
  category?: string
  license?: string
  type: 'gui' | 'cli'
  platform?: string | Platform
  platform_id?: string
  repository: 'official' | 'third-party'
  lastUpdated?: string
  downloads?: number
  popularity?: number
  popularity_score?: number
  tags?: string[]
}

export interface FilterOptions {
  platform_id?: string
  category_id?: number
  type?: 'gui' | 'cli'
  repository?: 'official' | 'third-party'
  search?: string
  limit?: number
  offset?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface SelectedPackage extends Package {
  selectedAt: string
}

export interface GeneratedScript {
  platform: string
  script: string
  packages: SelectedPackage[]
  generatedAt: string
}
