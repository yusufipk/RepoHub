"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { useLocale } from '@/contexts/LocaleContext'
import { SupportModal } from '@/components/SupportModal'
import { Sun, Moon, Monitor, Globe, Heart } from 'lucide-react'

export function Header() {
  const { theme, isDark, toggleTheme } = useTheme()
  const { locale, toggleLocale, t } = useLocale()
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)

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
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">RH</span>
          </div>
          <span className="hidden font-bold sm:inline-block">
            RepoHub
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Support Button */}
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
