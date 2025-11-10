"use client"

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '@/lib/api/client'
import { useLocale } from '@/contexts/LocaleContext'
import { Package, FilterOptions, Platform } from '@/types'
import { Search, Package as PackageIcon, Terminal, Monitor } from 'lucide-react'

interface PackageBrowserProps {
  selectedPlatform: Platform | null
  selectedPackages: Package[]
  onPackageToggle: (pkg: Package) => void
  onFiltersChange: (filters: FilterOptions) => void
}

export function PackageBrowser({ 
  selectedPlatform, 
  selectedPackages, 
  onPackageToggle,
  onFiltersChange 
}: PackageBrowserProps) {
  const { t } = useLocale()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>({
    platform_id: selectedPlatform?.id || '',
    type: '',
    repository: '',
    search: '',
    limit: 50,
    offset: 0
  })

  // Load packages when platform changes
  useEffect(() => {
    const loadPackages = async () => {
      if (!selectedPlatform) {
        setPackages([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const result = await apiClient.getPackages({
          platform_id: selectedPlatform.id,
          search: searchQuery,
          type: filters.type || undefined,
          repository: filters.repository || undefined,
          limit: filters.limit,
          offset: filters.offset
        })
        setPackages(result.packages)
      } catch (error) {
        console.error('Failed to load packages:', error)
        // Fallback to mock data if API fails
        const { mockPackages } = await import('@/data/mockData')
        setPackages(mockPackages.filter(pkg => pkg.platform === selectedPlatform.id))
      } finally {
        setLoading(false)
      }
    }

    loadPackages()
  }, [selectedPlatform, searchQuery, filters.type, filters.repository])

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      // Platform filter
      if (selectedPlatform && pkg.platform !== selectedPlatform.id) {
        return false
      }

      // Search filter
      if (searchQuery && !pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !pkg.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(pkg.category)) {
        return false
      }

      // License filter
      if (filters.licenses.length > 0 && !filters.licenses.includes(pkg.license)) {
        return false
      }

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(pkg.type)) {
        return false
      }

      // Repository filter
      if (filters.repositories.length > 0 && !filters.repositories.includes(pkg.repository)) {
        return false
      }

      return true
    })
  }, [selectedPlatform, searchQuery, filters])

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const isPackageSelected = (pkg: Package) => {
    return selectedPackages.some(selected => selected.id === pkg.id)
  }

  if (!selectedPlatform) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t('platform.description')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('packages.search')}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <Select onValueChange={(value) => 
              handleFilterChange('categories', value ? [value] : [])
            }>
              <SelectTrigger>
                <SelectValue placeholder={t('packages.filters.category')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select onValueChange={(value) => 
              handleFilterChange('types', value ? [value as 'gui' | 'cli'] : [])
            }>
              <SelectTrigger>
                <SelectValue placeholder={t('packages.filters.type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gui">{t('packages.filters.gui')}</SelectItem>
                <SelectItem value="cli">{t('packages.filters.cli')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Repository Filter */}
            <Select onValueChange={(value) => 
              handleFilterChange('repositories', value ? [value as 'official' | 'third-party'] : [])
            }>
              <SelectTrigger>
                <SelectValue placeholder={t('packages.filters.repository')} />
              </SelectTrigger>
              <SelectContent>
            {t('packages.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8 text-muted-foreground">
            Loading packages...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <PackageIcon className="h-5 w-5" />
          {t('packages.title')}
          {selectedPlatform && (
            <span className="text-sm font-normal text-muted-foreground">
              ({packages.length} packages for {selectedPlatform.name})
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-sm">
          {t('packages.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t('packages.search')}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  isPackageSelected(pkg) 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:bg-secondary/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={isPackageSelected(pkg)}
                    onCheckedChange={() => onPackageToggle(pkg)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold truncate">{pkg.name}</h3>
                      {pkg.type === 'gui' ? (
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Terminal className="h-4 w-4 text-muted-foreground" />
                      )}
                      {pkg.repository === 'official' && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Official
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{pkg.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Version: {pkg.version}</span>
                      <span>License: {pkg.license}</span>
                      <span>Category: {pkg.category}</span>
                      {pkg.popularity && (
                        <span>Popularity: {pkg.popularity}%</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {pkg.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredPackages.length === 0 && (
              <div className="text-center py-8">
                <PackageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t('packages.no_packages')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
