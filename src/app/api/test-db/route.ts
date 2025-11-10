import { NextResponse } from 'next/server'
import { query } from '@/lib/database/config'

export async function GET() {
  try {
    // Test 1: Database connection
    const dbTest = await query('SELECT NOW() as current_time', [])
    
    // Test 2: Packages table count
    const packageCount = await query('SELECT COUNT(*) as count FROM packages', [])
    
    // Test 3: Debian packages count
    const debianCount = await query('SELECT COUNT(*) as count FROM packages WHERE platform_id = $1', ['debian'])
    
    // Test 4: Active packages count
    const activeCount = await query('SELECT COUNT(*) as count FROM packages WHERE is_active = true', [])
    
    // Test 5: Sample packages
    const samplePackages = await query(`
      SELECT id, name, version, platform_id 
      FROM packages 
      WHERE platform_id = $1 AND is_active = true 
      LIMIT 5
    `, ['debian'])
    
    return NextResponse.json({
      database: {
        connected: true,
        currentTime: dbTest.rows[0].current_time
      },
      packages: {
        total: packageCount.rows[0].count,
        debian: debianCount.rows[0].count,
        active: activeCount.rows[0].count,
        sample: samplePackages.rows
      }
    })
    
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      database: { connected: false }
    }, { status: 500 })
  }
}
