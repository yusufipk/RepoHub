"use client"

import { useState, useEffect } from 'react'
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

  // Recommendation profile management
  const {
    profile,
    isLoading: isProfileLoading,
    hasCompletedOnboarding,
    saveProfile,
    detectedOS
  } = useRecommendationProfile()

  const [showOnboarding, setShowOnboarding] = useState(false)

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
    console.log('🔧 handleGenerateScript called')
    console.log('📦 selectedPackages:', selectedPackages)
    console.log('🖥️ selectedPlatform:', selectedPlatform)
    console.log('✅ hasCompletedOnboarding:', hasCompletedOnboarding)

    if (selectedPackages.length === 0) {
      console.log('❌ No packages selected')
      return
    }

    // Use selected platform, or if not selected, use the platform from recommendations profile
    let platformToUse = selectedPlatform

    if (!platformToUse && hasCompletedOnboarding) {
      // Get effective OS from profile and find matching platform
      const effectiveOS = profile.selectedOS || detectedOS
      console.log('🔍 effectiveOS:', effectiveOS)

      // We need to fetch the platform data - for now, create a mock platform
      // This should ideally come from the platforms list
      if (effectiveOS) {
        platformToUse = {
          id: effectiveOS,
          name: effectiveOS.charAt(0).toUpperCase() + effectiveOS.slice(1),
          description: '',
          icon: '',
          packageManager: getPackageManagerForOS(effectiveOS)
        }
        console.log('🎯 Created platform:', platformToUse)
      }
    }

    if (platformToUse) {
      console.log('✨ Generating script for platform:', platformToUse)
      const script = generateScript(selectedPackages, platformToUse)
      console.log('📝 Script generated:', script)
      setGeneratedScript(script)
    } else {
      console.log('❌ No platform available')
    }
  }

  // Helper function to get package manager for OS
  const getPackageManagerForOS = (os: string): string => {
    switch (os.toLowerCase()) {
      case 'windows':
        return 'winget'
      case 'macos':
        return 'brew'
      case 'ubuntu':
      case 'debian':
        return 'apt'
      case 'fedora':
        return 'dnf'
      case 'arch':
        return 'pacman'
      default:
        return 'unknown'
    }
  }

  const handleFiltersChange = (filters: FilterOptions) => {
    // Filters are handled internally by PackageBrowser
    // This could be expanded to handle URL params or state management
  }

  const handleCloseScriptPreview = () => {
    setGeneratedScript(null)
  }

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
            />
          )}

          {/* Platform Selector */}
          <PlatformSelector
            selectedPlatform={selectedPlatform}
            onPlatformSelect={handlePlatformSelect}
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
            selectedPlatform={selectedPlatform || {
              id: generatedScript.platform,
              name: generatedScript.platform.charAt(0).toUpperCase() + generatedScript.platform.slice(1),
              description: '',
              icon: '',
              packageManager: getPackageManagerForOS(generatedScript.platform)
            }}
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
