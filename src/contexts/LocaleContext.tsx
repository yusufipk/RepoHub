"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Locale = 'en' | 'tr'

const translations = {
  en: {
    common: {
      title: "RepoHub - Cross-Platform Package Manager",
      subtitle: "Cross-Platform Package Manager",
      description: "Simplify software installation across Linux, Windows, and macOS with official repositories",
      status: "All Systems Operational",
      close: "Close"
    },
    theme: {
      light: "Light",
      dark: "Dark",
      system: "System"
    },
    platform: {
      select: "Select Your Platform",
      description: "Choose your operating system and package manager to browse available packages",
      selected: "Selected",
      please_select: "Please select a platform first"
    },
    packages: {
      title: "Available Packages",
      browse: "Available Packages",
      description: "Select packages to include in your installation script",
      search: "Search packages...",
      no_packages: "No packages found matching your criteria",
      no_description: "No description available",
      count_label: "({current} of {total} packages for {platform})",
      loading: "Loading...",
      load_more: "Load More ({count})",
      filters: {
        category: "Category",
        type: "Type",
        repository: "Repository",
        all_types: "All Types",
        all: "All",
        gui: "GUI",
        cli: "CLI",
        official: "Official",
        aur: "AUR",
        gui_full: "GUI Applications",
        cli_full: "CLI Tools",
        official_only: "Official Only",
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
      ,
      windows_usage: {
        download_intro: "Download the script file (it will be saved as",
        file_name: "install-packages-windows.ps1",
        open_powershell_intro: "Open PowerShell (preferably as Administrator). If you see",
        disabled_error: "running scripts is disabled on this system",
        run_one: "run one of the following and then execute the script:",
        persistent_title: "Persistent (Current User):",
        persistent_cmd: "Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force",
        then_run: "then run:",
        then_run_cmd: ".\\install-packages-windows.ps1",
        onetime_title: "One-time run (no policy change):",
        onetime_cmd: "powershell -ExecutionPolicy Bypass -File .\\install-packages-windows.ps1",
        unblock_title: "If Windows blocked the file, unblock it:",
        unblock_cmd: "Unblock-File -Path .\\install-packages-windows.ps1",
        winget_title: "If winget is not found, install 'App Installer' and re-run the script:",
        store_link_label: "Store link",
        direct_link_label: "Direct link"
      }
    },
    support: {
      title: "Support Us",
      subtitle: "Help keep RepoHub free and open source",
      description: "Support RepoHub development",
      amount: "Amount",
      currency: "Cryptocurrency",
      email_optional: "Email (optional)",
      create_payment: "Create Payment",
      creating: "Creating...",
      payment_created: "Payment created successfully!",
      payment_id: "Payment ID",
      amount_to_pay: "Amount to Pay",
      pay_now: "Pay Now",
      payment_note: "You will be redirected to Cryptomus secure payment page",
      create_another: "Create Another Payment",
      secure_payment: "All payments are processed securely through Cryptomus",
      thank_you: "Thank you for your support!",
      success_title: "Thank You!",
      success_message: "Your support helps us keep RepoHub free and continue development.",
      success_note1: "Payment confirmation will be sent to your email if provided.",
      success_note2: "You can close this page and return to RepoHub.",
      back_to_site: "Back to RepoHub"
    }
  },
  tr: {
    common: {
      title: "RepoHub - Çok Platformlu Paket Yöneticisi",
      subtitle: "Çok Platformlu Paket Yöneticisi",
      description: "Linux, Windows ve macOS'te resmi depoları kullanarak yazılım kurulumunu basitleştirin",
      status: "Tüm Sistemler Çalışıyor",
      close: "Kapat"
    },
    theme: {
      light: "Aydınlık",
      dark: "Karanlık",
      system: "Sistem"
    },
    platform: {
      select: "Platformunuzu Seçin",
      description: "Mevcut paketlere göz atmak için işletim sisteminizi ve paket yöneticinizi seçin",
      selected: "Seçildi",
      please_select: "Lütfen önce bir platform seçin"
    },
    packages: {
      title: "Mevcut Paketler",
      browse: "Mevcut Paketler",
      description: "Kurulum scriptinize dahil edilecek paketleri seçin",
      search: "Paket ara...",
      no_packages: "Kriterlerinize uyan paket bulunamadı",
      no_description: "Açıklama mevcut değil",
      count_label: "({platform} için {current} / {total} paket)",
      loading: "Yükleniyor...",
      load_more: "Daha Fazla Yükle ({count})",
      filters: {
        category: "Kategori",
        type: "Tür",
        repository: "Depo",
        all_types: "Tüm Türler",
        all: "Tümü",
        gui: "GUI",
        cli: "CLI",
        official: "Resmi",
        aur: "AUR",
        gui_full: "GUI Uygulamaları",
        cli_full: "CLI Araçları",
        official_only: "Sadece Resmi",
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
      ,
      windows_usage: {
        download_intro: "Script dosyasını indirin (şu adla kaydedilecektir",
        file_name: "install-packages-windows.ps1",
        open_powershell_intro: "PowerShell'i açın (tercihen Yönetici olarak). Eğer şu hatayı görürseniz",
        disabled_error: "running scripts is disabled on this system",
        run_one: "aşağıdakilerden birini uygulayıp ardından scripti çalıştırın:",
        persistent_title: "Kalıcı (Mevcut Kullanıcı):",
        persistent_cmd: "Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force",
        then_run: "sonra çalıştırın:",
        then_run_cmd: ".\\install-packages-windows.ps1",
        onetime_title: "Tek seferlik (politika değiştirmeden):",
        onetime_cmd: "powershell -ExecutionPolicy Bypass -File .\\install-packages-windows.ps1",
        unblock_title: "Windows dosyayı engellediyse, engeli kaldırın:",
        unblock_cmd: "Unblock-File -Path .\\install-packages-windows.ps1",
        winget_title: "winget bulunamazsa, 'App Installer'ı yükleyin ve scripti tekrar çalıştırın:",
        store_link_label: "Mağaza bağlantısı",
        direct_link_label: "Doğrudan bağlantı"
      }
    },
    support: {
      title: "Bizi Destekleyin",
      subtitle: "RepoHub'ı ücretsiz ve açık kaynaklı tutmamıza yardım edin",
      description: "RepoHub geliştirmesini destekleyin",
      amount: "Tutar",
      currency: "Kriptopara",
      email_optional: "E-posta (isteğe bağlı)",
      create_payment: "Ödeme Oluştur",
      creating: "Oluşturuluyor...",
      payment_created: "Ödeme başarıyla oluşturuldu!",
      payment_id: "Ödeme ID",
      amount_to_pay: "Ödenecek Tutar",
      pay_now: "Şimdi Öde",
      payment_note: "Cryptomus güvenli ödeme sayfasına yönlendirileceksiniz",
      create_another: "Başka Ödeme Oluştur",
      secure_payment: "Tüm ödemeler Cryptomus üzerinden güvenli bir şekilde işlenir",
      thank_you: "Desteğiniz için teşekkürler!",
      success_title: "Teşekkürler!",
      success_message: "Desteğiniz RepoHub'ı ücretsiz tutmamıza ve geliştirmeye devam etmemize yardımcı olur.",
      success_note1: "Ödeme onayı sağlandıysa e-postanıza gönderilecektir.",
      success_note2: "Bu sayfayı kapatabilir ve RepoHub'a dönebilirsiniz.",
      back_to_site: "RepoHub'a Geri Dön"
    }
  }
}

interface LocaleContextType {
  locale: Locale
  changeLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: (key: string, params?: Record<string, string | number>) => string
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

  const t = (key: string, params?: Record<string, string | number>) => {
    const keys = key.split('.')
    let value: any = translations[locale]
    
    for (const k of keys) {
      value = value?.[k]
    }
    if (typeof value === 'string' && params) {
      return value.replace(/\{(\w+)\}/g, (_, k) =>
        Object.prototype.hasOwnProperty.call(params, k) ? String(params[k]) : `{${k}}`
      )
    }
    return (typeof value === 'string') ? value : key
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
