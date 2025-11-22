"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, RefreshCw, Settings, Package as PackageIcon, Star } from 'lucide-react'
import { RecommendedPackage } from '@/types/recommendations'
import { Package } from '@/types'
import { useLocale } from '@/contexts/LocaleContext'
import { useRecommendationProfile } from '@/hooks/useRecommendationProfile'

interface RecommendationsSectionProps {
    onPackageToggle: (pkg: Package) => void
    selectedPackages: Package[]
    onCustomizeClick: () => void
}

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

    if (!isProfileComplete()) {
        return null
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <div>
                            <CardTitle className="text-lg">
                                {t('recommendations.title')}
                            </CardTitle>
                            <CardDescription className="text-sm">
                                {t('recommendations.subtitle')}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
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
                            onClick={fetchRecommendations}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            {t('recommendations.refresh')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onCustomizeClick}
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            {t('recommendations.customize')}
                        </Button>
                    </div>
                </div>

                {/* Show user profile info */}
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
            </CardHeader>

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

                {!loading && !error && recommendations.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recommendations.map(pkg => (
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
            </CardContent>
        </Card>
    )
}
