import { LRUCache } from 'lru-cache'

type Options = {
    uniqueTokenPerInterval?: number
    interval?: number
}

export default function rateLimit(options?: Options) {
    const tokenCache = new LRUCache({
        max: options?.uniqueTokenPerInterval || 500,
        ttl: options?.interval || 60000,
    })

    return {
        check: (res: Response | null, limit: number, token: string) =>
            new Promise<void>((resolve, reject) => {
                const tokenCount = (tokenCache.get(token) as number[]) || [0]
                if (tokenCount[0] === 0) {
                    tokenCache.set(token, tokenCount)
                }
                tokenCount[0] += 1

                const currentUsage = tokenCount[0]
                const isRateLimited = currentUsage >= limit

                // If we had a response object we could set headers, but for Next.js middleware
                // we just want to know if we should block.

                if (isRateLimited) {
                    reject()
                } else {
                    resolve()
                }
            }),
    }
}
