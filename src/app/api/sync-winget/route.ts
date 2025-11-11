import { NextResponse } from 'next/server'
import { WingetPackageFetcher } from '@/services/wingetPackageFetcher'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes timeout

let syncInProgress = false
let syncStatus = {
  status: 'idle' as 'idle' | 'fetching' | 'storing' | 'complete' | 'error',
  fetchProgress: 0,
  fetchTotal: 0,
  storeProgress: 0,
  storeTotal: 0,
  currentPackage: '',
  error: null as string | null
}

export async function GET() {
  return NextResponse.json(syncStatus)
}

export async function POST() {
  if (syncInProgress) {
    return NextResponse.json(
      { error: 'Sync already in progress' },
      { status: 409 }
    )
  }

  syncInProgress = true
  syncStatus = {
    status: 'fetching',
    fetchProgress: 0,
    fetchTotal: 0,
    storeProgress: 0,
    storeTotal: 0,
    currentPackage: '',
    error: null
  }

  // Start sync in background
  ;(async () => {
    try {
      const fetcher = new WingetPackageFetcher()
      
      // Fetch packages
      console.log('🔄 Starting Winget package fetch...')
      const packages = await fetcher.fetchAllPackages(
        (current, total, packageName) => {
          syncStatus.fetchProgress = current
          syncStatus.fetchTotal = total
          syncStatus.currentPackage = packageName
        }
      )
      
      console.log(`✅ Fetched ${packages.length} Winget packages`)
      
      // Store packages
      syncStatus.status = 'storing'
      syncStatus.storeTotal = packages.length
      
      await fetcher.storePackages(
        packages,
        (current, total) => {
          syncStatus.storeProgress = current
          syncStatus.storeTotal = total
        }
      )
      
      syncStatus.status = 'complete'
      console.log('✅ Winget sync completed successfully')
      
    } catch (error) {
      console.error('❌ Winget sync error:', error)
      syncStatus.status = 'error'
      syncStatus.error = error instanceof Error ? error.message : 'Unknown error'
    } finally {
      syncInProgress = false
    }
  })()

  return NextResponse.json({ 
    message: 'Winget package sync started',
    status: syncStatus 
  })
}
