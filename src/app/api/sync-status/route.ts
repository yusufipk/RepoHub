import { NextRequest, NextResponse } from 'next/server'

// Global sync state (in production, use Redis or database)
let syncInProgress = false
let syncProgress = { message: '', progress: 0, total: 100 }

export async function GET() {
  return NextResponse.json({
    inProgress: syncInProgress,
    progress: syncProgress
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action } = body

  if (action === 'cancel') {
    syncInProgress = false
    syncProgress = { message: 'Sync cancelled', progress: 0, total: 100 }
    return NextResponse.json({ message: 'Sync cancelled successfully' })
  }

  if (action === 'start') {
    syncInProgress = true
    syncProgress = { message: 'Starting sync...', progress: 0, total: 100 }
    return NextResponse.json({ message: 'Sync started' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

// Export functions for other endpoints to use
export function setSyncProgress(message: string, progress?: number, total?: number) {
  syncProgress = { message, progress: progress || 0, total: total || 100 }
}

export function setSyncInProgress(inProgress: boolean) {
  syncInProgress = inProgress
}
