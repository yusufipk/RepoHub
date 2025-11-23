"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api/client'
import { useLocale } from '@/contexts/LocaleContext'
import { Platform } from '@/types'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Lock } from 'lucide-react'

interface PlatformSelectorProps {
  selectedPlatform: Platform | null
  onPlatformSelect: (platform: Platform) => void
  isLocked?: boolean
  lockedMessage?: string
}

export function PlatformSelector({
  selectedPlatform,
  onPlatformSelect,
  isLocked = false,
  lockedMessage = "Platform selection is locked"
}: PlatformSelectorProps) {
  const { t } = useLocale()
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)

  const iconSlug: Record<string, string> = {
    debian: 'debian',
    ubuntu: 'ubuntu',
    fedora: 'fedora',
    arch: 'archlinux',
    windows: 'windows',
    macos: 'apple'
  }
  const iconBase = (slug: string) => `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`

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
        <CardTitle className="text-lg flex items-center gap-2">
          {t('platform.select')}
          {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
        </CardTitle>
        <CardDescription className="text-sm">
          {t('platform.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <TooltipProvider>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {platforms.map((platform) => {
              const isSelected = selectedPlatform?.id === platform.id
              const isDisabled = isLocked && !isSelected

              const ButtonContent = (
                <Button
                  key={platform.id}
                  variant="outline"
                  className={`h-12 px-2 py-1 flex flex-col items-center justify-center gap-1 rounded-md border transition-colors w-full
                    ${isSelected
                      ? 'border-primary ring-2 ring-primary/60 bg-primary/5'
                      : 'border-border hover:bg-secondary/60'}
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={() => !isLocked && onPlatformSelect(platform)}
                  disabled={isDisabled}
                >
                  <div
                    className={`h-5 w-5 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}
                    style={{
                      WebkitMaskImage: `url(${iconBase(iconSlug[platform.id] || 'linux')})`,
                      maskImage: `url(${iconBase(iconSlug[platform.id] || 'linux')})`,
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                      backgroundColor: 'currentColor'
                    } as React.CSSProperties}
                  />
                  <div className="text-center">
                    <div className="font-medium text-xs leading-tight truncate max-w-[90px]">{platform.name}</div>
                  </div>
                </Button>
              )

              if (isLocked && !isSelected) {
                return (
                  <Tooltip key={platform.id}>
                    <TooltipTrigger asChild>
                      <div className="w-full cursor-not-allowed">
                        {ButtonContent}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{lockedMessage}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return ButtonContent
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
