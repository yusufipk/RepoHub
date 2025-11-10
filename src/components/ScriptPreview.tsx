"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GeneratedScript, SelectedPackage, Platform } from '@/types'
import { Download, Copy, Check, Terminal, Shield } from 'lucide-react'

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
    a.download = `install-packages-${selectedPlatform?.id || 'unknown'}.sh`
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
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Terminal className="h-5 w-5" />
                <span>Installation Script</span>
              </CardTitle>
              <CardDescription>
                Idempotent script for {selectedPlatform?.name || 'Unknown Platform'} using {selectedPlatform?.packageManager || 'Unknown Package Manager'}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Script Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-secondary rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm">Official Repositories</span>
              </div>
              <p className="text-xs text-muted-foreground">
                All packages from trusted sources
              </p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Terminal className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">Idempotent</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Safe to run multiple times
              </p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Download className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm">{selectedPackages.length} Packages</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ready for installation
              </p>
            </div>
          </div>

          {/* Package List */}
          <div>
            <h4 className="font-medium mb-2">Included Packages:</h4>
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
              <h4 className="font-medium">Script Content:</h4>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download {getScriptExtension()}
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
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Download the script file to your target machine</li>
              <li>Make it executable (for Linux/macOS): <code className="bg-blue-100 px-1 rounded">chmod +x install-packages-{selectedPlatform?.id || 'unknown'}{getScriptExtension()}</code></li>
              <li>Run the script with appropriate permissions</li>
              <li>The script will automatically handle repository setup and package installation</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
