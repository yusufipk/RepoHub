
import { apiClient } from '../src/lib/api/client'

// Mock fetch for testing if running outside of browser/node with fetch
if (!global.fetch) {
    console.error("Fetch is not available")
    process.exit(1)
}

async function testRateLimit() {
    console.log('🚀 Starting Rate Limit Test...')

    const url = 'http://localhost:3002/api/packages?limit=1'
    let successCount = 0
    let failCount = 0

    const startTime = Date.now()

    for (let i = 0; i < 120; i++) {
        try {
            const res = await fetch(url)
            if (res.status === 200) {
                successCount++
                process.stdout.write('.')
            } else if (res.status === 429) {
                failCount++
                process.stdout.write('x')
            } else {
                console.log(`\nUnexpected status: ${res.status}`)
            }
        } catch (e) {
            console.error(`\nRequest failed: ${e}`)
        }
    }

    const duration = (Date.now() - startTime) / 1000
    console.log(`\n\n📊 Results:`)
    console.log(`Time: ${duration.toFixed(2)}s`)
    console.log(`Success: ${successCount}`)
    console.log(`Rate Limited: ${failCount}`)

    if (failCount > 0) {
        console.log('✅ Rate limiting is working!')
    } else {
        console.log('❌ Rate limiting did NOT trigger.')
    }
}

testRateLimit()
