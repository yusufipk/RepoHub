"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/contexts/LocaleContext'
import { Package, SelectedPackage } from '@/types'
import { X, PackageOpen, Download } from 'lucide-react'

interface SelectionManagerProps {
  selectedPackages: SelectedPackage[]
  onPackageRemove: (pkgId: string) => void
  onClearAll: () => void
  onGenerateScript: () => void
}

export function SelectionManager({ 
  selectedPackages, 
  onPackageRemove, 
  onClearAll,
  onGenerateScript 
}: SelectionManagerProps) {
  const { t } = useLocale()

  if (selectedPackages.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <PackageOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">{t('selection.none')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('selection.title')} ({selectedPackages.length})</CardTitle>
            <CardDescription>
              {t('selection.description')}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onClearAll}>
              {t('selection.clear_all')}
            </Button>
            <Button onClick={onGenerateScript}>
              <Download className="h-4 w-4 mr-2" />
              {t('selection.generate_script')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {selectedPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="flex items-center justify-between p-3 bg-secondary rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium truncate">{pkg.name}</h4>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {pkg.version}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {pkg.description}
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                  <span>{pkg.type?.toUpperCase() || 'CLI'}</span>
                  <span>•</span>
                  <span>{pkg.repository || 'official'}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPackageRemove(pkg.id)}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
