"use client"

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Heart, ArrowLeft } from 'lucide-react'
import { useLocale } from '@/contexts/LocaleContext'
import { useRouter } from 'next/navigation'

export default function SupportSuccessPage() {
  const { t } = useLocale()
  const router = useRouter()

  useEffect(() => {
    // You could verify payment status here if needed
    console.log('Support payment success page loaded')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="flex items-center justify-center space-x-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span>{t('support.success_title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {t('support.success_message')}
          </p>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{t('support.success_note1')}</p>
            <p>{t('support.success_note2')}</p>
          </div>

          <div className="pt-4 space-y-2">
            <Button 
              onClick={() => router.push('/')}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('support.back_to_site')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
