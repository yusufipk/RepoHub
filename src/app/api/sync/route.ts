import { NextRequest, NextResponse } from 'next/server'
import { MetadataFetcher } from '@/services/metadataFetcher'
import { DebianPackageFetcher } from '@/services/debianPackageFetcher'
import { PackageFetcherV2 } from '@/services/packageFetcherV2'
import { SimplePackageFetcher } from '@/services/simplePackageFetcher'
import { PlatformInitializer } from '@/services/platformInitializer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform_id, all_platforms, source } = body

    // Initialize platforms first
    await PlatformInitializer.initializePlatforms()

    if (source === 'debian-simple') {
      // Sync Debian packages (simple text parsing, no gzip)
      await SimplePackageFetcher.fetchDebianPackages()
      return NextResponse.json({ 
        message: 'Debian packages synced (simple text parsing)',
        timestamp: new Date().toISOString()
      })
    } else if (source === 'ubuntu-simple') {
      // Sync Ubuntu packages (simple text parsing, no gzip)
      await SimplePackageFetcher.fetchUbuntuPackages()
      return NextResponse.json({ 
        message: 'Ubuntu packages synced (simple text parsing)',
        timestamp: new Date().toISOString()
      })
    } else if (source === 'all-simple') {
      // Sync all Debian-based packages (simple text parsing)
      await SimplePackageFetcher.syncAll()
      return NextResponse.json({ 
        message: 'All Debian-based packages synced (simple text parsing)',
        timestamp: new Date().toISOString()
      })
    } else if (source === 'debian-official-v2') {
      // Sync Debian packages from official repository (v2 with better error handling)
      await PackageFetcherV2.fetchDebianPackages()
      return NextResponse.json({ 
        message: 'Debian packages synced from official repository (v2)',
        timestamp: new Date().toISOString()
      })
    } else if (source === 'ubuntu-official-v2') {
      // Sync Ubuntu packages from official repository (v2 with better error handling)
      await PackageFetcherV2.fetchUbuntuPackages()
      return NextResponse.json({ 
        message: 'Ubuntu packages synced from official repository (v2)',
        timestamp: new Date().toISOString()
      })
    } else if (source === 'all-official-v2') {
      // Sync all Debian-based packages from official repositories (v2)
      await PackageFetcherV2.syncAll()
      return NextResponse.json({ 
        message: 'All Debian-based packages synced from official repositories (v2)',
        timestamp: new Date().toISOString()
      })
    } else if (source === 'debian-official') {
      // Sync Debian packages from official repository
      await DebianPackageFetcher.fetchDebianPackages()
      return NextResponse.json({ 
        message: 'Debian packages synced from official repository',
        timestamp: new Date().toISOString()
      })
    } else if (source === 'ubuntu-official') {
      // Sync Ubuntu packages from official repository
      await DebianPackageFetcher.fetchUbuntuPackages()
      return NextResponse.json({ 
        message: 'Ubuntu packages synced from official repository',
        timestamp: new Date().toISOString()
      })
    } else if (source === 'all-official') {
      // Sync all Debian-based packages from official repositories
      await DebianPackageFetcher.syncAll()
      return NextResponse.json({ 
        message: 'All Debian-based packages synced from official repositories',
        timestamp: new Date().toISOString()
      })
    } else if (all_platforms) {
      // Sync all platforms (legacy method)
      await MetadataFetcher.syncAllPlatforms()
      return NextResponse.json({ 
        message: 'All platforms synced successfully',
        timestamp: new Date().toISOString()
      })
    } else if (platform_id) {
      // Sync specific platform (legacy method)
      await MetadataFetcher.syncPlatform(platform_id)
      return NextResponse.json({ 
        message: `Platform ${platform_id} synced successfully`,
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json(
        { error: 'Either platform_id, all_platforms, or source must be specified' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error during sync:', error)
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Return sync status (would need to implement status tracking)
    return NextResponse.json({
      status: 'ready',
      last_sync: null,
      platforms: ['ubuntu', 'fedora', 'arch', 'windows', 'macos']
    })
  } catch (error) {
    console.error('Error getting sync status:', error)
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
}
