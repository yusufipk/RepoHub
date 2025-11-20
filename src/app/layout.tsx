import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { LocaleProvider } from '@/contexts/LocaleContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RepoHub - Cross-Platform Package Manager',
  description: 'Simplify software installation across Linux, Windows, and macOS with official repositories',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LocaleProvider>
          {children}
        </LocaleProvider>
      </body>
    </html>
  )
}
