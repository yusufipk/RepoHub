import { NextRequest, NextResponse } from 'next/server'

const PAYMENT_API_KEY = process.env.CRYPTOMUS_PAYMENT_API_KEY || ''

interface WebhookData {
  uuid: string
  order_id: string
  amount: string
  currency: string
  status: string
  sign: string
}

function verifySign(data: any, apiKey: string): boolean {
  // Extract sign from data and create a copy without it
  const { sign: receivedSign, ...dataToVerify } = data
  
  // Sort keys and create JSON string
  const sortedData = Object.keys(dataToVerify)
    .sort()
    .reduce((result: any, key: string) => {
      result[key] = dataToVerify[key]
      return result
    }, {})
  
  const jsonString = JSON.stringify(sortedData)
  
  // Generate expected signature
  const crypto = require('crypto')
  const expectedSign = crypto.createHash('md5').update(jsonString + apiKey).digest('hex')
  
  return receivedSign === expectedSign
}

export async function POST(request: NextRequest) {
  try {
    if (!PAYMENT_API_KEY) {
      console.error('Cryptomus API key not configured')
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
    }

    const body: WebhookData = await request.json()
    
    // Verify webhook signature
    if (!verifySign(body, PAYMENT_API_KEY)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Log payment status
    console.log('Payment webhook received:', {
      uuid: body.uuid,
      order_id: body.order_id,
      amount: body.amount,
      currency: body.currency,
      status: body.status,
      timestamp: new Date().toISOString()
    })

    // Here you can:
    // 1. Update your database with payment status
    // 2. Send confirmation email
    // 3. Notify administrators
    // 4. Grant access to premium features

    if (body.status === 'paid' || body.status === 'paid_over') {
      console.log(`Payment successful: ${body.order_id} - ${body.amount} ${body.currency}`)
      
      // TODO: Add your business logic here
      // - Update user's support status
      // - Send thank you email
      // - Record in database
    } else if (body.status === 'cancelled' || body.status === 'expired') {
      console.log(`Payment cancelled/expired: ${body.order_id}`)
    }

    return NextResponse.json({ status: 'success' })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
