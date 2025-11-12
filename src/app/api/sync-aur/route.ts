import { NextRequest, NextResponse } from 'next/server'
import { SyncAuth } from '@/lib/sync/auth'
import { AurPackageFetcher } from '@/services/aurPackageFetcher'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

let syncInProgress = false
let syncStatus: {
  status: 'idle' | 'running' | 'complete' | 'error'
  error: string | null
} = { status: 'idle', error: null }

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
      const fetcher = new AurPackageFetcher()
      const pkgs = await fetcher.fetchAllPackages()
      await fetcher.storePackages(pkgs)
      syncStatus.status = 'complete'
    } catch (err: any) {
      syncStatus.status = 'error'
      syncStatus.error = err?.message || 'Unknown error'
    } finally {
      syncInProgress = false
    }
  })()

  return NextResponse.json({ message: 'AUR sync started', status: syncStatus })
}
