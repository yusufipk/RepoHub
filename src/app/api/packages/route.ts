import { NextRequest, NextResponse } from 'next/server'
import { PackageService } from '@/services/packageService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const filter = {
      platform_id: searchParams.get('platform_id') || undefined,
      category_id: searchParams.get('category_id') ?
        parseInt(searchParams.get('category_id')!) : undefined,
      type: searchParams.get('type') as 'gui' | 'cli' | undefined,
      repository: searchParams.get('repository') as 'official' | 'third-party' | 'aur' | undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ?
        Math.min(parseInt(searchParams.get('limit')!), 100) : undefined,
      offset: searchParams.get('offset') ?
        parseInt(searchParams.get('offset')!) : undefined,
      sort_by: searchParams.get('sort_by') as
        'name' | 'popularity_score' | 'last_updated' | 'downloads_count' | undefined,
      sort_order: searchParams.get('sort_order') as 'asc' | 'desc' | undefined
    }

    const result = await PackageService.getMany(filter)

    return NextResponse.json({
      packages: result.packages,
      total: result.total,
      limit: filter.limit,
      offset: filter.offset
    })
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const packageData = await PackageService.create(body)
    return NextResponse.json(packageData, { status: 201 })
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { error: 'Failed to create package' },
      { status: 500 }
    )
  }
}
