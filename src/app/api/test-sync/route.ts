import { NextRequest, NextResponse } from 'next/server'
import { PackageFetcherV2 } from '@/services/packageFetcherV2'
import { PlatformInitializer } from '@/services/platformInitializer'

export async function GET() {
  try {
    console.log('🧪 Starting test sync...')
    
    // Test 1: Initialize platforms
    await PlatformInitializer.initializePlatforms()
    console.log('✅ Platforms initialized')
    
    // Test 2: Try to fetch a small sample
    console.log('🔄 Testing Debian package fetch...')
    
    // Just test the fetch and parse, don't store in DB
    const response = await fetch('https://packages.debian.org/stable/allpackages?format=txt.gz', {
      headers: {
        'Accept-Encoding': 'gzip, deflate',
        'User-Agent': 'RepoHub-Package-Fetcher/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`)
    }
    
    console.log('✅ Response received, size:', response.headers.get('content-length'))
    
    const buffer = await response.arrayBuffer()
    console.log('✅ Buffer received, size:', buffer.byteLength)
    
    // Check magic bytes
    const bytes = new Uint8Array(buffer.slice(0, 2))
    console.log('🔍 Magic bytes:', bytes[0].toString(16), bytes[1].toString(16))
    
    // Try decompression
    const { gunzip } = await import('zlib')
    const decompressed = await new Promise<Buffer>((resolve, reject) => {
      gunzip(new Uint8Array(buffer), (err, result) => {
        if (err) {
          console.error('❌ Gunzip error:', err)
          reject(err)
        } else {
          console.log('✅ Gunzip successful, size:', result.length)
          resolve(result)
        }
      })
    })
    
    const text = decompressed.toString('utf-8')
    console.log('✅ Text decoded, length:', text.length)
    
    // Parse first 10 lines
    const lines = text.split('\n').slice(0, 20)
    console.log('📋 First 20 lines:')
    lines.forEach((line, i) => console.log(`${i + 1}: ${line}`))
    
    // Test parsing
    const samplePackages = PackageFetcherV2['parseDebianPackageList'](text)
    console.log('📊 Sample packages parsed:', samplePackages.length)
    
    if (samplePackages.length > 0) {
      console.log('📦 First package:', samplePackages[0])
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test completed successfully',
      bufferSize: buffer.byteLength,
      textSize: text.length,
      samplePackages: samplePackages.length,
      firstPackage: samplePackages[0] || null
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
