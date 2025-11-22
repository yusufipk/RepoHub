"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GeneratedScript, SelectedPackage, Platform } from '@/types'
import { Download, Copy, Check, Terminal, Shield } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'

interface ScriptPreviewProps {
  generatedScript: GeneratedScript | null
  selectedPackages: SelectedPackage[]
  selectedPlatform: Platform | null
  onClose: () => void
}

export function ScriptPreview({ 
  generatedScript, 
  selectedPackages, 
  selectedPlatform,
  onClose 
}: ScriptPreviewProps) {
  const [copied, setCopied] = useState(false)
  const { t } = useLocale()

  if (!generatedScript || !selectedPlatform) {
    return null
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedScript.script)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy script:', err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([generatedScript.script], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const ext = getScriptExtension()
    a.download = `install-packages-${selectedPlatform?.id || 'unknown'}${ext}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getScriptLanguage = () => {
    switch (selectedPlatform?.id) {
      case 'windows':
        return 'powershell'
      case 'macos':
        return 'bash'
      default:
        return 'bash'
    }
  }

  const getScriptExtension = () => {
    switch (selectedPlatform?.id) {
      case 'windows':
        return '.ps1'
      case 'macos':
        return '.sh'
      default:
        return '.sh'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Terminal className="h-5 w-5" />
                <span>{t('script.title')}</span>
              </CardTitle>
              <CardDescription>
                {t('script.description')} {selectedPlatform?.name || 'Unknown Platform'}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              {t('common.close')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 overflow-y-auto max-h-[70vh] pr-2">
          {/* Script Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-secondary rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">{t('script.official_repos')}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('script.official_repos_desc')}
              </p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Terminal className="h-4 w-4 text-accent-foreground" />
                <span className="font-medium text-sm">{t('script.idempotent')}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('script.idempotent_desc')}
              </p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Download className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">{selectedPackages.length} {t('script.packages_count')}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('script.packages_count_desc')}
              </p>
            </div>
          </div>

          {/* Package List */}
          <div>
            <h4 className="font-medium mb-2">{t('script.included_packages')}</h4>
            <div className="flex flex-wrap gap-2">
              {selectedPackages.map((pkg) => (
                <span
                  key={pkg.id}
                  className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                >
                  {pkg.name} ({pkg.version})
                </span>
              ))}
            </div>
          </div>

          {/* Script Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{t('script.script_content')}</h4>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? t('script.copied') : t('script.copy')}
                </Button>
                <Button size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('script.download')} {getScriptExtension()}
                </Button>
              </div>
            </div>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-64 overflow-y-auto">
                <code>{generatedScript.script}</code>
              </pre>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="p-4 bg-accent/20 border border-accent rounded-lg">
            <h4 className="font-medium text-accent-foreground mb-2">{t('script.usage')}</h4>
            {selectedPlatform?.id === 'windows' ? (
              <ol className="text-sm text-accent-foreground space-y-2 list-decimal list-inside">
                <li>
                  {t('script.windows_usage.download_intro')}
                  <code className="bg-accent/30 px-1 mx-1 rounded">{t('script.windows_usage.file_name')}</code>)
                </li>
                <li>
                  {t('script.windows_usage.open_powershell_intro')}
                  <code className="bg-accent/30 px-1 mx-1 rounded">{t('script.windows_usage.disabled_error')}</code>,
                  {t('script.windows_usage.run_one')}
                  <div className="mt-1 space-y-1">
                    <div>
                      • {t('script.windows_usage.persistent_title')}
                      <code className="block bg-accent/30 px-2 py-1 mt-1 rounded">{t('script.windows_usage.persistent_cmd')}</code>
                      {t('script.windows_usage.then_run')} <code className="bg-accent/30 px-1 rounded">{t('script.windows_usage.then_run_cmd')}</code>
                    </div>
                    <div>
                      • {t('script.windows_usage.onetime_title')}
                      <code className="block bg-accent/30 px-2 py-1 mt-1 rounded">{t('script.windows_usage.onetime_cmd')}</code>
                    </div>
                  </div>
                </li>
                <li>
                  {t('script.windows_usage.unblock_title')}
                  <code className="block bg-accent/30 px-2 py-1 mt-1 rounded">{t('script.windows_usage.unblock_cmd')}</code>
                </li>
                <li>
                  {t('script.windows_usage.winget_title')}
                  <span className="block mt-1">{t('script.windows_usage.store_link_label')}: ms-windows-store://pdp/?productId=9NBLGGH4NNS1</span>
                  <span className="block">{t('script.windows_usage.direct_link_label')}: https://aka.ms/getwinget</span>
                </li>
              </ol>
            ) : (
              <ol className="text-sm text-accent-foreground space-y-2 list-decimal list-inside">
                <li>{t('script.usage_steps.0')}</li>
                <li>
                  {t('script.usage_steps.1')}
                  <code className="block bg-accent/30 px-2 py-1 mt-1 rounded">chmod +x install-packages-{selectedPlatform?.id || 'unknown'}{getScriptExtension()}</code>
                </li>
                <li>{t('script.usage_steps.2')}</li>
                <li>{t('script.usage_steps.3')}</li>
              </ol>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
