"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLocale } from '@/contexts/LocaleContext'
import { Loader2, Heart, AlertCircle } from 'lucide-react'

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USDT')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { t } = useLocale()

  const cryptoOptions = [
    // Popular cryptocurrencies
    { value: 'BTC', label: 'Bitcoin (BTC)', network: 'BTC' },
    { value: 'ETH', label: 'Ethereum (ETH)', network: 'ETH' },
    { value: 'XMR', label: 'Monero (XMR)', network: 'XMR' },
    { value: 'SOL', label: 'Solana (SOL)', network: 'SOL' },
    { value: 'BNB', label: 'Binance Coin (BNB)', network: 'BSC' },
    
    // Stablecoins
    { value: 'USDT', label: 'Tether (USDT)', network: 'TRC20' },
    { value: 'USDC', label: 'USD Coin (USDC)', network: 'ETH' },
    { value: 'BUSD', label: 'Binance USD (BUSD)', network: 'BSC' },
    
    // Other cryptocurrencies
    { value: 'LTC', label: 'Litecoin (LTC)', network: 'LTC' },
    { value: 'TRX', label: 'TRON (TRX)', network: 'TRC20' },
    { value: 'AVAX', label: 'Avalanche (AVAX)', network: 'Avalanche' },
    { value: 'MATIC', label: 'Polygon (MATIC)', network: 'Polygon' },
    { value: 'BCH', label: 'Bitcoin Cash (BCH)', network: 'BCH' },
    { value: 'DASH', label: 'Dash (DASH)', network: 'DASH' },
    { value: 'DOGE', label: 'Dogecoin (DOGE)', network: 'DOGE' },
    { value: 'SHIB', label: 'Shiba Inu (SHIB)', network: 'ETH' }
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/support/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency,
          order_id: `support_${Date.now()}`,
          description: t('support.description')
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment creation failed')
      }

      // Redirect immediately to payment URL
      window.open(data.payment_url, '_blank')
      resetForm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setAmount('')
    setCurrency('USDT')
    setError('')
  }

  const handleClose = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-destructive" />
                <span>{t('support.title')}</span>
              </CardTitle>
              <CardDescription>
                {t('support.subtitle')}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleClose}>
              {t('common.close')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t('support.amount')}</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                placeholder="10.00"
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">{t('support.currency')}</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cryptoOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !amount}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('support.creating')}
                </>
              ) : (
                t('support.create_payment')
              )}
            </Button>
          </form>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>{t('support.secure_payment')}</p>
            <p>{t('support.thank_you')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
