import { NextRequest, NextResponse } from 'next/server'
import { DebianPackageFetcher } from '@/services/debianPackageFetcher'
import { SyncAuth } from '@/lib/sync/auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

let syncInProgress = false
let syncStatus = {
  status: 'idle' as 'idle' | 'running' | 'complete' | 'error',
  error: null as string | null
}

export async function GET() {
  return NextResponse.json(syncStatus)
}

export async function POST(request: NextRequest) {
  const authResult = await SyncAuth.isSyncAllowed(request)
  if (!authResult.allowed) {
    return NextResponse.json(
      { error: 'Sync operation not allowed', reason: authResult.reason },
      { status: 403 }
    )
  }

  if (syncInProgress) {
    return NextResponse.json(
      { error: 'Sync already in progress' },
      { status: 409 }
    )
  }

  syncInProgress = true
  syncStatus = { status: 'running', error: null }

  ;(async () => {
    try {
      await DebianPackageFetcher.fetchUbuntuPackages()
      syncStatus.status = 'complete'
    } catch (error) {
      syncStatus.status = 'error'
      syncStatus.error = error instanceof Error ? error.message : 'Unknown error'
    } finally {
      syncInProgress = false
    }
  })()

  return NextResponse.json({ message: 'Ubuntu packages sync started', status: syncStatus })
}
