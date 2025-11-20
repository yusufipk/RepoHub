"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { useLocale } from '@/contexts/LocaleContext'
import { SupportModal } from '@/components/SupportModal'
import { Sun, Moon, Monitor, Globe, Heart } from 'lucide-react'
import Image from 'next/image'

export function Header() {
  const { theme, isDark, toggleTheme } = useTheme()
  const { locale, toggleLocale, t } = useLocale()
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
  const [cryptomusEnabled, setCryptomusEnabled] = useState(true)

  useEffect(() => {
    const checkCryptomusStatus = async () => {
      try {
        const response = await fetch('/api/support/status')
        const data = await response.json()
        setCryptomusEnabled(data.cryptomus_enabled)
      } catch (error) {
        // Default to enabled if check fails
        setCryptomusEnabled(true)
      }
    }

    checkCryptomusStatus()
  }, [])

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return locale === 'tr' ? 'Aydınlık' : 'Light'
      case 'dark':
        return locale === 'tr' ? 'Karanlık' : 'Dark'
      default:
        return locale === 'tr' ? 'Sistem' : 'System'
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className="relative h-12 w-12">
              <Image
                src="/logo.png"
                alt="RepoHub Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="hidden font-bold sm:inline-block">
              RepoHub
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Support Button - Only show when Cryptomus is enabled */}
            {cryptomusEnabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSupportModalOpen(true)}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Heart className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">
                  {t('support.title')}
                </span>
              </Button>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-full justify-start"
            >
              {getThemeIcon()}
              <span className="ml-2 hidden sm:inline">
                {getThemeLabel()}
              </span>
            </Button>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLocale}
              className="w-full justify-start"
            >
              <Globe className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">
                {locale === 'tr' ? 'TR' : 'EN'}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Support Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </>
  )
}
