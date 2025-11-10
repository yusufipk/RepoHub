"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Locale = 'en' | 'tr'

const translations = {
  en: {
    common: {
      title: "RepoHub - Cross-Platform Package Manager",
      subtitle: "Cross-Platform Package Manager",
      description: "Simplify software installation across Linux, Windows, and macOS with official repositories"
    },
    platform: {
      select: "Select Your Platform",
      description: "Choose your operating system and package manager to browse available packages",
      selected: "Selected"
    },
    packages: {
      title: "Available Packages",
      browse: "Available Packages",
      description: "Select packages to include in your installation script",
      search: "Search packages...",
      no_packages: "No packages found matching your criteria",
      filters: {
        category: "Category",
        type: "Type",
        repository: "Repository",
        gui: "GUI Applications",
        cli: "CLI Tools",
        official: "Official Only",
        third_party: "Third Party"
      }
    },
    selection: {
      title: "Selected Packages",
      description: "These packages will be included in your installation script",
      none: "No packages selected",
      clear_all: "Clear All",
      generate_script: "Generate Script",
      note: "The generated script will use official repositories only and will be idempotent (safe to run multiple times)."
    },
    script: {
      title: "Installation Script",
      description: "Idempotent script for",
      official_repos: "Official Repositories",
      official_repos_desc: "All packages from trusted sources",
      idempotent: "Idempotent",
      idempotent_desc: "Safe to run multiple times",
      packages_count: "Packages",
      packages_count_desc: "Ready for installation",
      included_packages: "Included Packages:",
      script_content: "Script Content:",
      copy: "Copy",
      copied: "Copied!",
      download: "Download",
      usage: "How to use:",
      usage_steps: [
        "Download the script file to your target machine",
        "Make it executable (for Linux/macOS):",
        "Run the script with appropriate permissions",
        "The script will automatically handle repository setup and package installation"
      ]
    }
  },
  tr: {
    common: {
      title: "RepoHub - Çok Platformlu Paket Yöneticisi",
      subtitle: "Çok Platformlu Paket Yöneticisi",
      description: "Linux, Windows ve macOS'te resmi depoları kullanarak yazılım kurulumunu basitleştirin"
    },
    platform: {
      select: "Platformunuzu Seçin",
      description: "Mevcut paketlere göz atmak için işletim sisteminizi ve paket yöneticinizi seçin",
      selected: "Seçildi"
    },
    packages: {
      title: "Mevcut Paketler",
      browse: "Mevcut Paketler",
      description: "Kurulum scriptinize dahil edilecek paketleri seçin",
      search: "Paket ara...",
      no_packages: "Kriterlerinize uyan paket bulunamadı",
      filters: {
        category: "Kategori",
        type: "Tür",
        repository: "Depo",
        gui: "GUI Uygulamaları",
        cli: "CLI Araçları",
        official: "Sadece Resmi",
        third_party: "Üçüncü Parti"
      }
    },
    selection: {
      title: "Seçilen Paketler",
      description: "Bu paketler kurulum scriptinize dahil edilecek",
      none: "Seçilen paket yok",
      clear_all: "Tümünü Temizle",
      generate_script: "Script Oluştur",
      note: "Oluşturulan script yalnızca resmi depoları kullanacak ve idempotent olacak (birden çok kez çalıştırılması güvenli)."
    },
    script: {
      title: "Kurulum Scripti",
      description: "için idempotent script",
      official_repos: "Resmi Depolar",
      official_repos_desc: "Tüm paketler güvenilir kaynaklardan",
      idempotent: "Idempotent",
      idempotent_desc: "Birden çok kez çalıştırılması güvenli",
      packages_count: "Paket",
      packages_count_desc: "Kurulum için hazır",
      included_packages: "Dahil Edilen Paketler:",
      script_content: "Script İçeriği:",
      copy: "Kopyala",
      copied: "Kopyalandı!",
      download: "İndir",
      usage: "Nasıl kullanılır:",
      usage_steps: [
        "Script dosyasını hedef makinenize indirin",
        "Çalıştırılabilir yapın (Linux/macOS için):",
        "Scripti uygun izinlerle çalıştırın",
        "Script otomatik olarak depo kurulumunu ve paket kurulumunu yönetecektir"
      ]
    }
  }
}

interface LocaleContextType {
  locale: Locale
  changeLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: (key: string) => string
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en')

  useEffect(() => {
    // Detect user's preferred locale
    const detectLocale = (): Locale => {
      const stored = localStorage.getItem('locale') as Locale
      if (stored && (stored === 'en' || stored === 'tr')) {
        return stored
      }

      // Get browser language
      const browserLang = navigator.language.toLowerCase()
      if (browserLang.startsWith('tr')) {
        return 'tr'
      }
      
      return 'en'
    }

    setLocale(detectLocale())
  }, [])

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const toggleLocale = () => {
    changeLocale(locale === 'en' ? 'tr' : 'en')
  }

  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = translations[locale]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }

  return (
    <LocaleContext.Provider value={{ locale, changeLocale, toggleLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
