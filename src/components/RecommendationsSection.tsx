"use client"

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, RefreshCw, Settings, Package as PackageIcon, Star, Grid3x3, List, TrendingUp, Award, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { RecommendedPackage } from '@/types/recommendations'
import { Package } from '@/types'
import { useLocale } from '@/contexts/LocaleContext'
import { useRecommendationProfile } from '@/hooks/useRecommendationProfile'
import { RECOMMENDATION_PRESETS } from '@/data/recommendationPresets'

interface RecommendationsSectionProps {
    onPackageToggle: (pkg: Package) => void
    selectedPackages: Package[]
    onCustomizeClick: () => void
}

type ViewMode = 'grid' | 'compact'
type SortMode = 'recommended' | 'popularity' | 'preset'
type FilterCategory = 'all' | string

export function RecommendationsSection({
    onPackageToggle,
    selectedPackages,
    onCustomizeClick
}: RecommendationsSectionProps) {
    const { t } = useLocale()
    const { profile, getEffectiveOS, isProfileComplete } = useRecommendationProfile()
    const [recommendations, setRecommendations] = useState<RecommendedPackage[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [sortMode, setSortMode] = useState<SortMode>('recommended')
    const [filterCategory, setFilterCategory] = useState<FilterCategory>('all')
    const [isExpanded, setIsExpanded] = useState(true)

    const fetchRecommendations = async () => {
        if (!isProfileComplete()) {
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    platform_id: getEffectiveOS(),
                    categories: profile.categories,
                    experienceLevel: profile.experienceLevel,
                    limit: 12
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))

                if (response.status === 400) {
                    throw new Error(errorData.error || 'Invalid request parameters')
                } else if (response.status === 500) {
                    throw new Error('Server error. Please try again later.')
                } else if (response.status === 404) {
                    throw new Error('Recommendation service not available')
                } else {
                    throw new Error(`Request failed: ${response.statusText}`)
                }
            }

            const data = await response.json()
            setRecommendations(data.recommendations || [])
        } catch (err) {
            console.error('Error fetching recommendations:', err)

            // User-friendly error messages
            if (err instanceof TypeError && err.message.includes('fetch')) {
                setError('Network error. Please check your internet connection.')
            } else {
                setError(err instanceof Error ? err.message : 'Failed to load recommendations')
            }
        } finally {
            setLoading(false)
        }
    }

    // Fetch recommendations on mount and when profile changes
    useEffect(() => {
        if (isProfileComplete()) {
            fetchRecommendations()
        }
    }, [profile.categories, profile.selectedOS, profile.experienceLevel])

    const isPackageSelected = (pkg: RecommendedPackage) => {
        return selectedPackages.some(selected => selected.id === pkg.id)
    }

    // Get category icon from presets
    const getCategoryIcon = (category: string): string => {
        const preset = RECOMMENDATION_PRESETS.find(p => p.category === category)
        return preset?.icon || '📦'
    }

    // Get package count per category
    const getCategoryCount = (category: string): number => {
        return recommendations.filter(pkg => pkg.matchedCategory === category).length
    }

    // Filter and sort recommendations
    const filteredAndSortedRecommendations = useMemo(() => {
        let result = [...recommendations]

        // Filter by category
        if (filterCategory !== 'all') {
            result = result.filter(pkg => pkg.matchedCategory === filterCategory)
        }

        // Sort
        switch (sortMode) {
            case 'popularity':
                result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                break
            case 'preset':
                result.sort((a, b) => {
                    if (a.presetMatch && !b.presetMatch) return -1
                    if (!a.presetMatch && b.presetMatch) return 1
                    return b.recommendationScore - a.recommendationScore
                })
                break
            case 'recommended':
            default:
                result.sort((a, b) => b.recommendationScore - a.recommendationScore)
                break
        }

        return result
    }, [recommendations, filterCategory, sortMode])

    if (!isProfileComplete()) {
        return null
    }

    return (
        <Card className="w-full">
            <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <div>
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">
                                    {t('recommendations.title')}
                                </CardTitle>
                                {!isExpanded && recommendations.length > 0 && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                        {recommendations.length} {t('recommendations.packages') || 'packages'}
                                    </span>
                                )}
                            </div>
                            <CardDescription className="text-sm">
                                {t('recommendations.subtitle')}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isExpanded && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        // Toggle: if all recommendations are selected, deselect them, otherwise select all
                                        const allSelected = recommendations.every(rec =>
                                            selectedPackages.some(sel => sel.id === rec.id)
                                        )

                                        if (allSelected) {
                                            // Deselect all recommendations
                                            recommendations.forEach(rec => {
                                                if (isPackageSelected(rec)) {
                                                    onPackageToggle(rec)
                                                }
                                            })
                                        } else {
                                            // Select all recommendations
                                            recommendations.forEach(rec => {
                                                if (!isPackageSelected(rec)) {
                                                    onPackageToggle(rec)
                                                }
                                            })
                                        }
                                    }}
                                    disabled={loading || recommendations.length === 0}
                                >
                                    {recommendations.every(rec => selectedPackages.some(sel => sel.id === rec.id))
                                        ? (t('common.deselect_all') || 'Deselect All')
                                        : (t('common.select_all') || 'Select All')}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        fetchRecommendations()
                                    }}
                                    disabled={loading}
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    {t('recommendations.refresh')}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onCustomizeClick()
                                    }}
                                >
                                    <Settings className="h-4 w-4 mr-2" />
                                    {t('recommendations.customize')}
                                </Button>
                            </>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                        >
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Show user profile info */}
                {isExpanded && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {getEffectiveOS()}
                        </span>
                        {profile.categories.map(cat => (
                            <span
                                key={cat}
                                className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                            >
                                {t(`categories.${cat}.name`)}
                            </span>
                        ))}
                    </div>
                )}

                {/* Filters and View Controls */}
                {isExpanded && !loading && !error && recommendations.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t">
                        {/* Category Filter Tabs */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={filterCategory === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterCategory('all')}
                                className="h-8 text-xs"
                            >
                                All ({recommendations.length})
                            </Button>
                            {profile.categories.map(cat => {
                                const count = getCategoryCount(cat)
                                return (
                                    <Button
                                        key={cat}
                                        variant={filterCategory === cat ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setFilterCategory(cat)}
                                        className="h-8 text-xs"
                                        disabled={count === 0}
                                    >
                                        {getCategoryIcon(cat)} {t(`categories.${cat}.name`)} ({count})
                                    </Button>
                                )
                            })}
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-1 border rounded-md">
                                <Button
                                    variant={sortMode === 'recommended' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSortMode('recommended')}
                                    className="h-8 text-xs rounded-r-none"
                                >
                                    <Award className="h-3 w-3 mr-1" />
                                    {t('recommendations.sort.recommended') || 'Best Match'}
                                </Button>
                                <Button
                                    variant={sortMode === 'popularity' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSortMode('popularity')}
                                    className="h-8 text-xs rounded-none border-x"
                                >
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    {t('recommendations.sort.popular') || 'Popular'}
                                </Button>
                                <Button
                                    variant={sortMode === 'preset' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSortMode('preset')}
                                    className="h-8 text-xs rounded-l-none"
                                >
                                    <Star className="h-3 w-3 mr-1" />
                                    {t('recommendations.sort.preset') || 'Essential'}
                                </Button>
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex items-center border rounded-md">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="h-8 w-8 p-0 rounded-r-none"
                                >
                                    <Grid3x3 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'compact' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('compact')}
                                    className="h-8 w-8 p-0 rounded-l-none border-l"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardHeader>

            {isExpanded && (
                <CardContent>
                    {loading && (
                        <div className="text-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-muted-foreground">{t('recommendations.loading')}</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-12">
                            <p className="text-destructive mb-4">{error}</p>
                            <Button onClick={fetchRecommendations} variant="outline">
                                Try Again
                            </Button>
                        </div>
                    )}

                    {!loading && !error && recommendations.length === 0 && (
                        <div className="text-center py-12">
                            <PackageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground mb-4">
                                {t('recommendations.no_recommendations')}
                            </p>
                            <Button onClick={onCustomizeClick} variant="outline">
                                <Settings className="h-4 w-4 mr-2" />
                                {t('recommendations.customize')}
                            </Button>
                        </div>
                    )}

                    {!loading && !error && recommendations.length > 0 && viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredAndSortedRecommendations.map(pkg => (
                                <Card
                                    key={pkg.id}
                                    className={`relative overflow-hidden transition-all hover:shadow-lg cursor-pointer ${isPackageSelected(pkg) ? 'ring-2 ring-primary' : ''
                                        }`}
                                    onClick={() => onPackageToggle(pkg)}
                                >
                                    {pkg.presetMatch && (
                                        <div className="absolute top-2 right-2">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                                                <Star className="h-3 w-3" />
                                                {t('recommendations.preset_badge')}
                                            </span>
                                        </div>
                                    )}

                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3 mb-3">
                                            <PackageIcon className="h-8 w-8 text-primary flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold truncate">{pkg.name}</h3>
                                                <p className="text-xs text-muted-foreground">{pkg.version}</p>
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {pkg.description}
                                        </p>

                                        {/* Recommendation score and reason */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-muted-foreground">
                                                    {t('recommendations.score')}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <div className="h-2 w-16 bg-secondary rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full transition-all"
                                                            style={{ width: `${pkg.recommendationScore}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold">{pkg.recommendationScore}%</span>
                                                </div>
                                            </div>

                                            {pkg.recommendationReason && (
                                                <div className="pt-2 border-t">
                                                    <p className="text-xs text-muted-foreground">
                                                        <span className="font-semibold">{t('recommendations.reason')}</span>
                                                        {' '}
                                                        {pkg.recommendationReason}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            variant={isPackageSelected(pkg) ? 'default' : 'outline'}
                                            size="sm"
                                            className="w-full mt-3"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onPackageToggle(pkg)
                                            }}
                                        >
                                            {isPackageSelected(pkg) ? '✓ Selected' : t('recommendations.add_to_selection')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Compact View Mode */}
                    {!loading && !error && recommendations.length > 0 && viewMode === 'compact' && (
                        <div className="space-y-2">
                            {filteredAndSortedRecommendations.map(pkg => (
                                <div
                                    key={pkg.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${isPackageSelected(pkg)
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'
                                        }`}
                                    onClick={() => onPackageToggle(pkg)}
                                >
                                    {/* Package Icon */}
                                    <PackageIcon className="h-6 w-6 text-primary flex-shrink-0" />

                                    {/* Package Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-sm truncate">{pkg.name}</h4>
                                            {pkg.presetMatch && (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-primary text-primary-foreground">
                                                    <Star className="h-2.5 w-2.5" />
                                                    Essential
                                                </span>
                                            )}
                                            <span className="text-xs text-muted-foreground">{pkg.version}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">{pkg.description}</p>
                                    </div>

                                    {/* Score Badge */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="text-right">
                                            <div className="text-xs font-semibold text-primary">
                                                {pkg.recommendationScore}%
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                match
                                            </div>
                                        </div>

                                        {/* Info Tooltip */}
                                        {pkg.recommendationReason && (
                                            <div className="relative group">
                                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                                <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                    <p className="font-semibold mb-1">Why recommended?</p>
                                                    <p>{pkg.recommendationReason}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Select Button */}
                                        <Button
                                            variant={isPackageSelected(pkg) ? 'default' : 'outline'}
                                            size="sm"
                                            className="ml-2"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onPackageToggle(pkg)
                                            }}
                                        >
                                            {isPackageSelected(pkg) ? '✓' : '+'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    )
}
