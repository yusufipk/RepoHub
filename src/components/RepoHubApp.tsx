"use client"

import { useState, useEffect, useRef } from 'react'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { Header } from './Header'
import { PlatformSelector } from './PlatformSelector'
import { PackageBrowserV2 } from './PackageBrowserV2'
import { SelectionManager } from './SelectionManager'
import { ScriptPreview } from '@/components/ScriptPreview'
import { OnboardingModal } from '@/components/OnboardingModal'
import { RecommendationsSection } from '@/components/RecommendationsSection'
import { generateScript } from '@/lib/scriptGenerator'
import { useLocale } from '@/contexts/LocaleContext'
import { useRecommendationProfile } from '@/hooks/useRecommendationProfile'
import { Platform, Package, SelectedPackage, FilterOptions, GeneratedScript } from '@/types'
import { UserCategory, ExperienceLevel } from '@/types/recommendations'

function RepoHubAppContent({ cryptomusEnabled }: { cryptomusEnabled: boolean }) {
  const { t, locale } = useLocale()
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [selectedPackages, setSelectedPackages] = useState<SelectedPackage[]>([])
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null)
  const [availablePlatforms, setAvailablePlatforms] = useState<Platform[]>([])

  // Recommendation profile management
  const {
    profile,
    isLoading: isProfileLoading,
    hasCompletedOnboarding,
    saveProfile,
    detectedOS,
    getEffectiveOS
  } = useRecommendationProfile()

  const [showOnboarding, setShowOnboarding] = useState(false)

  // Load platforms on mount
  useEffect(() => {
    const loadPlatforms = async () => {
      try {
        const response = await fetch('/api/platforms')
        if (response.ok) {
          const platforms = await response.json()
          setAvailablePlatforms(platforms)
        }
      } catch (error) {
        console.error('Failed to load platforms:', error)
      }
    }
    loadPlatforms()
  }, [])

  // Show onboarding modal on first visit
  useEffect(() => {
    if (!isProfileLoading && !hasCompletedOnboarding) {
      // Delay to allow page to render first
      const timer = setTimeout(() => {
        setShowOnboarding(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isProfileLoading, hasCompletedOnboarding])

  const handleOnboardingComplete = (data: {
    categories: UserCategory[]
    selectedOS?: string
    experienceLevel: ExperienceLevel
  }) => {
    console.log('🎯 Onboarding completed with data:', data)

    const success = saveProfile({
      categories: data.categories,
      selectedOS: data.selectedOS,
      experienceLevel: data.experienceLevel,
      hasCompletedOnboarding: true
    })

    console.log('💾 Profile save result:', success)

    // Don't call completeOnboarding() - it causes a second save with empty state!
    // completeOnboarding()

    // Force close modal
    setShowOnboarding(false)
  }

  const handleCustomizePreferences = () => {
    setShowOnboarding(true)
  }

  const handlePlatformSelect = (platform: Platform) => {
    setSelectedPlatform(platform)
    // Clear selections when platform changes
    setSelectedPackages([])
    setGeneratedScript(null)
  }

  const handlePackageToggle = (pkg: Package) => {
    setSelectedPackages(prev => {
      const exists = prev.some(p => p.id === pkg.id)
      if (exists) {
        return prev.filter(p => p.id !== pkg.id)
      } else {
        return [...prev, { ...pkg, selectedAt: new Date().toISOString() }]
      }
    })
  }

  const handlePackageRemove = (pkgId: string) => {
    setSelectedPackages(prev => prev.filter(p => p.id !== pkgId))
  }

  const handleClearAll = () => {
    setSelectedPackages([])
  }

  const handleGenerateScript = () => {
    if (selectedPackages.length === 0) {
      return
    }

    // Use selected platform, or if not selected, find platform from available platforms
    let platformToUse = selectedPlatform

    if (!platformToUse && hasCompletedOnboarding) {
      // Get effective OS from profile and find matching platform from loaded platforms
      const effectiveOS = profile.selectedOS || detectedOS

      if (effectiveOS && availablePlatforms.length > 0) {
        platformToUse = availablePlatforms.find(p => p.id === effectiveOS) || null

        if (!platformToUse) {
          console.warn(`Platform not found for OS: ${effectiveOS}`)
        }
      }
    }

    if (platformToUse) {
      const script = generateScript(selectedPackages, platformToUse)
      setGeneratedScript(script)
    }
  }

  const handleFiltersChange = (filters: FilterOptions) => {
    // Filters are handled internally by PackageBrowser
    // This could be expanded to handle URL params or state management
  }

  const handleCloseScriptPreview = () => {
    setGeneratedScript(null)
  }
  // Track previous effective OS to detect profile changes
  const prevEffectiveOS = useRef<string | null>(null)

  // Calculate current effective OS
  const effectiveOS = getEffectiveOS()

  // Sync platform selection with profile changes
  useEffect(() => {
    if (hasCompletedOnboarding && availablePlatforms.length > 0) {
      const platform = availablePlatforms.find(p => p.id === effectiveOS)

      // If profile OS changed, or if no platform is selected yet, update selection
      if (platform && (effectiveOS !== prevEffectiveOS.current || !selectedPlatform)) {
        setSelectedPlatform(platform)
        prevEffectiveOS.current = effectiveOS
      }
    }
  }, [hasCompletedOnboarding, effectiveOS, availablePlatforms, selectedPlatform])
  return (
    <div key={locale} className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header
        cryptomusEnabled={cryptomusEnabled}
        onResetPreferences={handleCustomizePreferences}
        hasProfile={hasCompletedOnboarding}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            RepoHub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            {t('common.subtitle')}
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            {t('common.description')}
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Recommendations Section - Show if profile is complete */}
          {hasCompletedOnboarding && profile.categories.length > 0 && (
            <RecommendationsSection
              onPackageToggle={handlePackageToggle}
              selectedPackages={selectedPackages}
              onCustomizeClick={handleCustomizePreferences}
              profile={profile}
            />
          )}





          {/* Platform Selector */}
          <PlatformSelector
            selectedPlatform={selectedPlatform}
            onPlatformSelect={handlePlatformSelect}
            isLocked={selectedPackages.length > 0}
            lockedMessage="Clear your selection to switch platforms"
          />

          {/* Package Browser */}
          <PackageBrowserV2
            selectedPlatform={selectedPlatform}
            selectedPackages={selectedPackages}
            onPackageToggle={handlePackageToggle}
            onFiltersChange={handleFiltersChange}
          />

          {/* Selection Manager */}
          <SelectionManager
            selectedPackages={selectedPackages}
            onPackageRemove={handlePackageRemove}
            onClearAll={handleClearAll}
            onGenerateScript={handleGenerateScript}
          />
        </div>

        {/* Script Preview Modal */}
        {generatedScript && (
          <ScriptPreview
            generatedScript={generatedScript}
            selectedPackages={selectedPackages}
            selectedPlatform={selectedPlatform ||
              availablePlatforms.find(p => p.id === generatedScript.platform) ||
            {
              id: generatedScript.platform,
              name: generatedScript.platform.charAt(0).toUpperCase() + generatedScript.platform.slice(1),
              description: '',
              icon: '',
              packageManager: ''
            }
            }
            onClose={handleCloseScriptPreview}
          />
        )}

        {/* Onboarding Modal */}
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={handleOnboardingComplete}
          detectedOS={detectedOS || 'unknown'}
        />
      </div>
    </div>
  )
}

export function RepoHubApp({ cryptomusEnabled }: { cryptomusEnabled: boolean }) {
  return (
    <LocaleProvider>
      <RepoHubAppContent cryptomusEnabled={cryptomusEnabled} />
    </LocaleProvider>
  )
}
