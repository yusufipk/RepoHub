import { NextRequest, NextResponse } from 'next/server'

const CRYPTOMUS_API_URL = 'https://api.cryptomus.com/v1/payment'
const MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID || ''
const PAYMENT_API_KEY = process.env.CRYPTOMUS_PAYMENT_API_KEY || ''

interface PaymentRequest {
  amount: number
  currency: string
  order_id: string
  description: string
  email?: string
}

interface CryptomusResponse {
  result: {
    uuid: string
    url: string
    order_id: string
    amount: string
    currency: string
    status: string
  }
  state: number
}

function generateSign(data: any, apiKey: string): string {
  // Convert data to JSON and sort keys for consistent signature
  const sortedData = Object.keys(data)
    .sort()
    .reduce((result: any, key: string) => {
      result[key] = data[key]
      return result
    }, {})
  
  const jsonString = JSON.stringify(sortedData)
  
  // Create MD5 hash using Web Crypto API
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(jsonString + apiKey)
  
  // For server-side, we'll use Node.js crypto
  const crypto = require('crypto')
  return crypto.createHash('md5').update(jsonString + apiKey).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    if (!MERCHANT_ID || !PAYMENT_API_KEY) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      )
    }

    const body: PaymentRequest = await request.json()
    
    // Validate input
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (!body.currency) {
      return NextResponse.json(
        { error: 'Currency is required' },
        { status: 400 }
      )
    }

    // Prepare data for Cryptomus
    const paymentData = {
      merchant_id: MERCHANT_ID,
      amount: body.amount.toString(),
      currency: body.currency,
      order_id: body.order_id,
      description: body.description,
      url_callback: `${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/support/webhook`,
      url_success: `${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/support/success`,
      email: body.email || undefined,
      lifetime: 3600, // 1 hour
      is_payment_multiple: false
    }

    // Generate signature
    const sign = generateSign(paymentData, PAYMENT_API_KEY)
    
    // Make request to Cryptomus
    const response = await fetch(CRYPTOMUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'merchant': MERCHANT_ID,
        'sign': sign
      },
      body: JSON.stringify(paymentData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Cryptomus API error:', errorData)
      return NextResponse.json(
        { error: 'Payment service error' },
        { status: 500 }
      )
    }

    const cryptomusResponse: CryptomusResponse = await response.json()
    
    if (cryptomusResponse.state !== 0) {
      return NextResponse.json(
        { error: 'Payment creation failed' },
        { status: 500 }
      )
    }

    // Return payment data to client
    return NextResponse.json({
      payment_id: cryptomusResponse.result.uuid,
      payment_url: cryptomusResponse.result.url,
      order_id: cryptomusResponse.result.order_id,
      amount: cryptomusResponse.result.amount,
      currency: cryptomusResponse.result.currency,
      status: cryptomusResponse.result.status
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
