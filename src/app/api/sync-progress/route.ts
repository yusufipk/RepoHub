import { NextRequest } from 'next/server'
import { SimplePackageFetcher } from '@/services/simplePackageFetcher'
import { PlatformInitializer } from '@/services/platformInitializer'
import { setSyncInProgress, setSyncProgress } from '@/app/api/sync-status/route'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  let cancelled = false
  
  // Set sync as in progress
  setSyncInProgress(true)
  
  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Helper function to send progress updates
        const sendProgress = (message: string, progress?: number, total?: number) => {
          if (cancelled) return
          
          const data = JSON.stringify({ 
            message, 
            progress, 
            total,
            timestamp: new Date().toISOString()
          })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          setSyncProgress(message, progress, total)
        }

        sendProgress('🔄 Starting package synchronization...')

        // Initialize platforms
        sendProgress('📋 Initializing platforms...')
        await PlatformInitializer.initializePlatforms()
        sendProgress('✅ Platforms initialized')

        // Fetch Debian packages
        sendProgress('🐧 Fetching Debian packages...')
        await SimplePackageFetcher.fetchDebianPackagesWithProgress(sendProgress)
        
        if (cancelled) {
          sendProgress('❌ Sync cancelled during Debian processing')
          controller.close()
          return
        }
        
        sendProgress('✅ Debian packages completed')

        // Fetch Ubuntu packages
        sendProgress('🐧 Fetching Ubuntu packages...')
        await SimplePackageFetcher.fetchUbuntuPackagesWithProgress(sendProgress)
        
        if (cancelled) {
          sendProgress('❌ Sync cancelled during Ubuntu processing')
          controller.close()
          return
        }
        
        sendProgress('✅ Ubuntu packages completed')

        // Final success message
        sendProgress('🎉 All packages synchronized successfully!')

        // Close the stream
        controller.close()
        setSyncInProgress(false)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const errorData = JSON.stringify({ 
          error: errorMessage,
          timestamp: new Date().toISOString()
        })
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
        controller.close()
        setSyncInProgress(false)
      }
    },
    
    cancel() {
      cancelled = true
      setSyncInProgress(false)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
