import { Platform, Package, FilterOptions } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  // Platform operations
  async getPlatforms(): Promise<Platform[]> {
    return this.request<Platform[]>('/platforms')
  }

  async getPlatform(id: string): Promise<Platform | null> {
    try {
      return await this.request<Platform>(`/platforms/${id}`)
    } catch (error) {
      return null
    }
  }

  // Package operations
  async getPackages(filters: FilterOptions = {}): Promise<{ packages: Package[], total: number }> {
    const params = new URLSearchParams()
    
    if (filters.platform_id) params.append('platform_id', filters.platform_id)
    if (filters.category_id) params.append('category_id', filters.category_id.toString())
    if (filters.type) params.append('type', filters.type)
    if (filters.repository) params.append('repository', filters.repository)
    if (filters.search) params.append('search', filters.search)
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.offset) params.append('offset', filters.offset.toString())
    if (filters.sort_by) params.append('sort_by', filters.sort_by)
    if (filters.sort_order) params.append('sort_order', filters.sort_order)

    const query = params.toString() ? `?${params.toString()}` : ''
    return this.request<{ packages: Package[], total: number }>(`/packages${query}`)
  }

  async getPackage(id: string): Promise<Package | null> {
    try {
      return await this.request<Package>(`/packages/${id}`)
    } catch (error) {
      return null
    }
  }

  // Sync operations
  async syncDebianPackages(): Promise<{ message: string, timestamp: string }> {
    return this.request<{ message: string, timestamp: string }>('/sync', {
      method: 'POST',
      body: JSON.stringify({ source: 'debian-official' }),
    })
  }

  async syncUbuntuPackages(): Promise<{ message: string, timestamp: string }> {
    return this.request<{ message: string, timestamp: string }>('/sync', {
      method: 'POST',
      body: JSON.stringify({ source: 'ubuntu-official' }),
    })
  }

  async syncAllDebianPackages(): Promise<{ message: string, timestamp: string }> {
    return this.request<{ message: string, timestamp: string }>('/sync', {
      method: 'POST',
      body: JSON.stringify({ source: 'all-official' }),
    })
  }

  async getSyncStatus(): Promise<{ status: string, last_sync: string | null, platforms: string[] }> {
    return this.request<{ status: string, last_sync: string | null, platforms: string[] }>('/sync')
  }
}

export const apiClient = new ApiClient()
