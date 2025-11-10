"use client"

import { useState } from 'react'
import { LocaleProvider } from '@/contexts/LocaleContext'
import { Header } from './Header'
import { PlatformSelector } from './PlatformSelector'
import { PackageBrowserV2 } from './PackageBrowserV2'
import { SelectionManager } from './SelectionManager'
import { ScriptPreview } from '@/components/ScriptPreview'
import { generateScript } from '@/lib/scriptGenerator'
import { useLocale } from '@/contexts/LocaleContext'
import { Platform, Package, SelectedPackage, FilterOptions, GeneratedScript } from '@/types'

function RepoHubAppContent() {
  const { t, locale } = useLocale()
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
  const [selectedPackages, setSelectedPackages] = useState<SelectedPackage[]>([])
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null)

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
    if (selectedPlatform && selectedPackages.length > 0) {
      const script = generateScript(selectedPackages, selectedPlatform)
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

  return (
    <div key={locale} className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
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
            selectedPlatform={selectedPlatform}
            onClose={handleCloseScriptPreview}
          />
        )}
      </div>
    </div>
  )
}

export function RepoHubApp() {
  return (
    <LocaleProvider>
      <RepoHubAppContent />
    </LocaleProvider>
  )
}
