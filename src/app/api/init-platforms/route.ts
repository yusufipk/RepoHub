import { NextResponse } from 'next/server'
import { PlatformInitializer } from '@/services/platformInitializer'

export async function POST() {
  try {
    await PlatformInitializer.initializePlatforms()
    return NextResponse.json({ 
      success: true, 
      message: 'Platforms initialized successfully' 
    })
  } catch (error) {
    console.error('Error initializing platforms:', error)
    return NextResponse.json(
      { error: 'Failed to initialize platforms' },
      { status: 500 }
    )
  }
}
