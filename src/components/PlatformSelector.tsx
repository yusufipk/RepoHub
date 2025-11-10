"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { useLocale } from '@/contexts/LocaleContext'
import { Platform } from '@/types'

interface PlatformSelectorProps {
  selectedPlatform: Platform | null
  onPlatformSelect: (platform: Platform) => void
}

export function PlatformSelector({ selectedPlatform, onPlatformSelect }: PlatformSelectorProps) {
  const { t } = useLocale()
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPlatforms = async () => {
      try {
        const platformsData = await apiClient.getPlatforms()
        setPlatforms(platformsData)
      } catch (error) {
        console.error('Failed to load platforms:', error)
        // Fallback to mock data if API fails
        const { platforms: mockPlatforms } = await import('@/data/mockData')
        setPlatforms(mockPlatforms)
      } finally {
        setLoading(false)
      }
    }

    loadPlatforms()
  }, [])

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{t('platform.select')}</CardTitle>
          <CardDescription className="text-sm">
            {t('platform.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8 text-muted-foreground">
            Loading platforms...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{t('platform.select')}</CardTitle>
        <CardDescription className="text-sm">
          {t('platform.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {platforms.map((platform) => (
            <Button
              key={platform.id}
              variant={selectedPlatform?.id === platform.id ? "default" : "outline"}
              className="h-auto p-3 flex flex-col items-center space-y-1"
              onClick={() => onPlatformSelect(platform)}
            >
              <div className="text-xl">{platform.icon}</div>
              <div className="text-center">
                <div className="font-semibold text-sm">{platform.name}</div>
                <div className="text-xs text-muted-foreground">{platform.packageManager}</div>
              </div>
            </Button>
          ))}
        </div>
        {selectedPlatform && (
          <div className="mt-3 p-3 bg-secondary rounded-md">
            <p className="text-xs">
              <strong>{t('platform.selected')}:</strong> {selectedPlatform.name} ({selectedPlatform.packageManager})
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
