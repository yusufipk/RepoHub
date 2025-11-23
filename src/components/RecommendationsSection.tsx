"use client"

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Settings, Package as PackageIcon, Star, Grid3x3, List, TrendingUp, Award, ChevronDown, ChevronUp } from 'lucide-react'
import { RecommendedPackage, UserCategory } from '@/types/recommendations'
import { Package } from '@/types'
import { useLocale } from '@/contexts/LocaleContext'
import { useRecommendationProfile } from '@/hooks/useRecommendationProfile'
import { CATEGORY_ICONS } from '@/constants/categoryIcons'
import { RecommendationCard } from './RecommendationCard'
import { RecommendationListItem } from './RecommendationListItem'

import { UserProfile } from '@/types/recommendations'

interface RecommendationsSectionProps {
    onPackageToggle: (pkg: Package) => void
    selectedPackages: Package[]
    onCustomizeClick: () => void
    profile: UserProfile
}

type ViewMode = 'grid' | 'compact'
type SortMode = 'recommended' | 'popularity' | 'preset'
type FilterCategory = 'all' | string

export function RecommendationsSection({
    onPackageToggle,
    selectedPackages,
    onCustomizeClick,
    profile
}: RecommendationsSectionProps) {
    const { t } = useLocale()
    
    // Derived state from props
    const getEffectiveOS = () => profile.selectedOS || profile.detectedOS || "ubuntu"
    const isProfileComplete = () => profile.categories.length > 0 && getEffectiveOS() !== "unknown"

    const [recommendations, setRecommendations] = useState<RecommendedPackage[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [filterCategory, setFilterCategory] = useState<FilterCategory>('all')
    const [isExpanded, setIsExpanded] = useState(false)

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
                    limit: 1000
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
            const recs = data.recommendations || []
            setRecommendations(recs)
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
            // If profile just changed (e.g. from customization), we might want to force refresh
            // But for now, let's rely on the cache key changing which includes profile data
            fetchRecommendations()
        }
    }, [profile.categories, profile.selectedOS, profile.experienceLevel])

    const isPackageSelected = (pkg: RecommendedPackage) => {
        return selectedPackages.some(selected => selected.id === pkg.id)
    }

    // Get package count per category
    const getCategoryCount = (category: string): number => {
        return recommendations.filter(pkg => pkg.matchedCategory === category).length
    }

    // Filter recommendations
    const filteredRecommendations = useMemo(() => {
        let result = [...recommendations]

        // Filter by category
        if (filterCategory !== 'all') {
            result = result.filter(pkg => pkg.matchedCategory === filterCategory)
        }

        return result
    }, [recommendations, filterCategory])

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
                    <div
                        className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t"
                        onClick={(e) => e.stopPropagation()} // Prevent collapse when clicking filter area
                    >
                        {/* Category Filter Tabs */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={filterCategory === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setFilterCategory('all')
                                }}
                                className="h-8 text-xs"
                            >
                                All ({recommendations.length})
                            </Button>
                            {profile.categories.map(cat => {
                                const count = getCategoryCount(cat)
                                const Icon = CATEGORY_ICONS[cat]
                                return (
                                    <Button
                                        key={cat}
                                        variant={filterCategory === cat ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setFilterCategory(cat)
                                        }}
                                        className="h-8 text-xs"
                                        disabled={count === 0}
                                    >
                                        {Icon && <Icon className="h-3 w-3 mr-1.5" />}
                                        {t(`categories.${cat}.name`)} ({count})
                                    </Button>
                                )
                            })}
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                            {/* View Mode Toggle */}
                            <div className="flex items-center border rounded-md">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setViewMode('grid')
                                    }}
                                    className="h-8 w-8 p-0 rounded-r-none"
                                >
                                    <Grid3x3 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'compact' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setViewMode('compact')
                                    }}
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
                            <Sparkles className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-muted-foreground">{t('recommendations.loading')}</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-12">
                            <p className="text-destructive mb-4">{error}</p>
                            <Button onClick={() => fetchRecommendations()} variant="outline">
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
                            {filteredRecommendations.map(pkg => (
                                <RecommendationCard
                                    key={pkg.id}
                                    pkg={pkg}
                                    isSelected={isPackageSelected(pkg)}
                                    onToggle={onPackageToggle}
                                />
                            ))}
                        </div>
                    )}

                    {/* Compact View Mode */}
                    {!loading && !error && recommendations.length > 0 && viewMode === 'compact' && (
                        <div className="space-y-2">
                            {filteredRecommendations.map(pkg => (
                                <RecommendationListItem
                                    key={pkg.id}
                                    pkg={pkg}
                                    isSelected={isPackageSelected(pkg)}
                                    onToggle={onPackageToggle}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    )
}
