"use client"

import { useState, useEffect, useMemo, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Monitor, Terminal, Package as PackageIcon } from 'lucide-react'
import { Package, FilterOptions, Platform } from '@/types'
import { apiClient } from '@/lib/api/client'
import { useLocale } from '@/contexts/LocaleContext'

interface PackageBrowserProps {
  selectedPlatform: Platform | null
  selectedPackages: Package[]
  onPackageToggle: (pkg: Package) => void
  onFiltersChange: (filters: FilterOptions) => void
}

export function PackageBrowserV2({ 
  selectedPlatform, 
  selectedPackages, 
  onPackageToggle,
  onFiltersChange 
}: PackageBrowserProps) {
  const { t } = useLocale()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [repositoryFilter, setRepositoryFilter] = useState<string>('')
  const [scrollPosition, setScrollPosition] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Load packages when platform changes
  useEffect(() => {
    const loadPackages = async () => {
      if (!selectedPlatform) {
        setPackages([])
        setLoading(false)
        return
      }

      setLoading(true)
      setPackages([])
      setHasMore(true)
      
      try {
        console.log('🔍 Frontend: Fetching initial packages for', selectedPlatform.id)
        const params: any = {
          platform_id: selectedPlatform.id,
          limit: 50,
          offset: 0
        }
        
        if (searchQuery && searchQuery.trim()) {
          params.search = searchQuery.trim()
        }
        
        if (typeFilter && typeFilter !== 'all') {
          params.type = typeFilter as 'gui' | 'cli'
        }
        
        if (repositoryFilter && repositoryFilter !== 'all') {
          params.repository = repositoryFilter as 'official' | 'third-party'
        }
        
        console.log('🔍 Frontend: API params:', params)
        const result = await apiClient.getPackages(params)
        console.log('📦 Frontend: Received initial packages:', {
          total: result.total,
          packageCount: result.packages.length,
          firstPackage: result.packages[0]?.name || 'None'
        })
        setPackages(result.packages)
        setTotalCount(result.total)
        setHasMore(result.packages.length < result.total)
      } catch (error) {
        console.error('Failed to load packages:', error)
        setPackages([])
      } finally {
        setLoading(false)
      }
    }

    loadPackages()
  }, [selectedPlatform, typeFilter, repositoryFilter])

  // Debounced search to prevent focus loss
  useEffect(() => {
    if (!selectedPlatform) return
    
    const timeoutId = setTimeout(() => {
      const loadPackages = async () => {
        // DON'T set loading to true - it causes re-render and focus loss
        // setLoading(true) 
        
        try {
          const params: any = {
            platform_id: selectedPlatform.id,
            limit: 50,
            offset: 0
          }
          
          if (searchQuery && searchQuery.trim()) {
            params.search = searchQuery.trim()
          }
          
          if (typeFilter && typeFilter !== 'all') {
            params.type = typeFilter as 'gui' | 'cli'
          }
          
          if (repositoryFilter && repositoryFilter !== 'all') {
            params.repository = repositoryFilter as 'official' | 'third-party'
          }
          
          console.log('🔍 Frontend: Debounced API params:', params)
          const result = await apiClient.getPackages(params)
          console.log('📦 Frontend: Debounced result:', result.packages.length)
          
          // Update packages without triggering loading state
          setPackages(result.packages)
          setTotalCount(result.total)
          setHasMore(result.packages.length < result.total)
        } catch (error) {
          console.error('Failed to load packages:', error)
          // Don't clear packages on error during search
        }
      }

      loadPackages()
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Load more packages
  const loadMore = async () => {
    if (!selectedPlatform || loadingMore || !hasMore) return
    
    setLoadingMore(true)
    try {
      const params: any = {
        platform_id: selectedPlatform.id,
        limit: 50,
        offset: packages.length
      }
      
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      
      if (typeFilter && typeFilter !== 'all') {
        params.type = typeFilter as 'gui' | 'cli'
      }
      
      if (repositoryFilter && repositoryFilter !== 'all') {
        params.repository = repositoryFilter as 'official' | 'third-party'
      }
      
      const result = await apiClient.getPackages(params)
      setPackages(prev => [...prev, ...result.packages])
      setHasMore(packages.length + result.packages.length < result.total)
    } catch (error) {
      console.error('Failed to load more packages:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const isPackageSelected = (pkg: Package) => {
    return selectedPackages.some(selected => selected.id === pkg.id)
  }

  const getPackageIcon = (type: string) => {
    return type === 'gui' ? <Monitor className="h-4 w-4" /> : <Terminal className="h-4 w-4" />
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <PackageIcon className="h-5 w-5" />
            {t('packages.title')}
          </CardTitle>
          <CardDescription className="text-sm">
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

  if (!selectedPlatform) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <PackageIcon className="h-5 w-5" />
            {t('packages.title')}
          </CardTitle>
          <CardDescription className="text-sm">
            {t('packages.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8 text-muted-foreground">
            Please select a platform first
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
          <span className="text-sm font-normal text-muted-foreground">
            ({packages.length} of {totalCount} packages for {selectedPlatform?.name || 'Unknown Platform'})
          </span>
        </CardTitle>
        <CardDescription className="text-sm">
          {t('packages.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('packages.search')}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchInputRef.current?.focus()}
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter || "all"} onValueChange={(value) => setTypeFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="gui">GUI</SelectItem>
                <SelectItem value="cli">CLI</SelectItem>
              </SelectContent>
            </Select>

            {/* Repository Filter */}
            <Select value={repositoryFilter || "all"} onValueChange={(value) => setRepositoryFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Repository" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Repositories</SelectItem>
                <SelectItem value="official">Official</SelectItem>
                <SelectItem value="third-party">Third Party</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Package List */}
          <div className="space-y-2 max-h-96 overflow-y-auto min-h-[400px]">
            {loading && packages.length === 0 ? (
              // Skeleton loading to prevent layout shift
              Array.from({ length: 10 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                  <div className="w-4 h-4 bg-muted animate-pulse rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-1/3"></div>
                    <div className="h-3 bg-muted animate-pulse rounded w-2/3"></div>
                  </div>
                </div>
              ))
            ) : packages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('packages.no_packages')}
              </div>
            ) : (
              packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    isPackageSelected(pkg) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-secondary/50'
                  }`}
                  onClick={() => onPackageToggle(pkg)}
                >
                  <Checkbox
                    checked={isPackageSelected(pkg)}
                    onCheckedChange={() => onPackageToggle(pkg)}
                  />
                  <div className="flex items-start space-x-2 flex-1">
                    <div className="mt-0.5">
                      {getPackageIcon(pkg.type || 'cli')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{pkg.name}</h4>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                          {pkg.version}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {pkg.description || 'No description available'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {pkg.type?.toUpperCase() || 'CLI'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {pkg.repository || 'official'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="min-w-32"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    `Load More (${Math.min(50, totalCount - packages.length)} remaining)`
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
