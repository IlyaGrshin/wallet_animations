const CACHE_TTL = 30_000

const cache = new Map()
const inflight = new Map()

export function cachedRequest(key, send) {
    const cached = cache.get(key)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return Promise.resolve(cached.data)
    }
    if (inflight.has(key)) return inflight.get(key)

    const promise = (async () => {
        try {
            const data = await send()
            cache.set(key, { timestamp: Date.now(), data })
            return data
        } finally {
            inflight.delete(key)
        }
    })()

    inflight.set(key, promise)
    return promise
}

export async function readJson(res, label) {
    if (!res.ok) throw new Error(`${label}: ${res.status}`)
    return res.json()
}
