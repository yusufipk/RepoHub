"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLocale } from '@/contexts/LocaleContext'
import { Loader2, Heart, AlertCircle, CheckCircle } from 'lucide-react'

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
}

interface PaymentData {
  payment_url: string
  payment_id: string
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USDT')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [error, setError] = useState('')
  const { t } = useLocale()

  const cryptoOptions = [
    { value: 'USDT', label: 'USDT (TRC20)', network: 'TRC20' },
    { value: 'USDC', label: 'USDC (TRC20)', network: 'TRC20' },
    { value: 'BTC', label: 'Bitcoin', network: 'BTC' },
    { value: 'ETH', label: 'Ethereum', network: 'ETH' },
    { value: 'LTC', label: 'Litecoin', network: 'LTC' },
    { value: 'TRX', label: 'TRON', network: 'TRC20' }
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setPayment(null)

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
          description: t('support.description'),
          email: email || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment creation failed')
      }

      setPayment(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setAmount('')
    setCurrency('USDT')
    setEmail('')
    setPayment(null)
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
                <Heart className="h-5 w-5 text-red-500" />
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
          {!payment ? (
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

              <div className="space-y-2">
                <Label htmlFor="email">{t('support.email_optional')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
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
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">{t('support.payment_created')}</span>
              </div>

              <div className="space-y-2">
                <Label>{t('support.payment_id')}</Label>
                <div className="p-2 bg-muted rounded font-mono text-sm">
                  {payment.payment_id}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('support.amount_to_pay')}</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {amount} {currency}
                </div>
              </div>

              <Button 
                onClick={() => window.open(payment.payment_url, '_blank')}
                className="w-full"
              >
                {t('support.pay_now')}
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                {t('support.payment_note')}
              </div>

              <Button 
                variant="outline" 
                onClick={resetForm}
                className="w-full"
              >
                {t('support.create_another')}
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>{t('support.secure_payment')}</p>
            <p>{t('support.thank_you')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
