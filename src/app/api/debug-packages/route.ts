import { NextRequest, NextResponse } from 'next/server'
import { PackageService } from '@/services/packageService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform_id = searchParams.get('platform_id') || 'debian'
    
    console.log('🐛 Debug: Fetching packages for platform:', platform_id)
    
    // Test 1: Simple query without filters
    const result1 = await PackageService.getMany({
      platform_id,
      limit: 10
    })
    
    console.log('🐛 Debug: Simple query result:', {
      total: result1.total,
      packageCount: result1.packages.length,
      firstPackage: result1.packages[0]?.name || 'None'
    })
    
    // Test 2: Query with search
    const result2 = await PackageService.getMany({
      platform_id,
      search: 'firefox',
      limit: 10
    })
    
    console.log('🐛 Debug: Search query result:', {
      total: result2.total,
      packageCount: result2.packages.length,
      firstPackage: result2.packages[0]?.name || 'None'
    })
    
    // Test 3: Raw SQL query
    const rawQuery = `
      SELECT COUNT(*) as total, 
             MIN(p.name) as first_package
      FROM packages p 
      WHERE p.platform_id = $1 AND p.is_active = true
    `
    
    const rawResult = await query(rawQuery, [platform_id])
    console.log('🐛 Debug: Raw SQL result:', rawResult.rows[0])
    
    return NextResponse.json({
      simpleQuery: {
        total: result1.total,
        packages: result1.packages.slice(0, 3).map(p => ({
          id: p.id,
          name: p.name,
          version: p.version
        }))
      },
      searchQuery: {
        total: result2.total,
        packages: result2.packages.slice(0, 3).map(p => ({
          id: p.id,
          name: p.name,
          version: p.version
        }))
      },
      rawSql: rawResult.rows[0]
    })
    
  } catch (error) {
    console.error('🐛 Debug: Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
