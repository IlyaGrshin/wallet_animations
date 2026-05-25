import WebApp from "./twa"

const TONAPI_BASE = "https://tonapi.io"
const PROXY_URL = import.meta.env.VITE_TONAPI_PROXY_URL
const DIRECT_KEY = import.meta.env.VITE_TONAPI_KEY
const CACHE_TTL = 30_000

const cache = new Map()
const inflight = new Map()

function buildRequest(path) {
    const initData = WebApp?.initData
    if (PROXY_URL && initData) {
        return {
            url: `${PROXY_URL}?path=${encodeURIComponent(path)}`,
            headers: { Authorization: `tma ${initData}` },
        }
    }
    return {
        url: `${TONAPI_BASE}${path}`,
        headers: DIRECT_KEY
            ? { Authorization: `Bearer ${DIRECT_KEY}` }
            : undefined,
    }
}

async function get(path) {
    const cached = cache.get(path)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data
    }
    if (inflight.has(path)) return inflight.get(path)

    const promise = (async () => {
        try {
            const { url, headers } = buildRequest(path)
            const res = await fetch(url, { headers })
            if (!res.ok) throw new Error(`tonapi ${path}: ${res.status}`)
            const data = await res.json()
            cache.set(path, { timestamp: Date.now(), data })
            return data
        } finally {
            inflight.delete(path)
        }
    })()

    inflight.set(path, promise)
    return promise
}

export function getAccount(address) {
    return get(`/v2/accounts/${address}`)
}

export function getEvents(address, limit = 20, beforeLt = null) {
    const before = beforeLt ? `&before_lt=${beforeLt}` : ""
    return get(`/v2/accounts/${address}/events?limit=${limit}${before}`)
}

export function getNfts(address, limit = 20) {
    return get(`/v2/accounts/${address}/nfts?limit=${limit}`)
}

export function getJettons(address) {
    return get(`/v2/accounts/${address}/jettons`)
}

export function getRates(tokens, currencies = ["usd"]) {
    const t = tokens.join(",")
    const c = currencies.join(",")
    return get(`/v2/rates?tokens=${t}&currencies=${c}`)
}

function crc16(bytes) {
    let crc = 0
    for (const byte of bytes) {
        crc ^= byte << 8
        for (let i = 0; i < 8; i++) {
            crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
            crc &= 0xffff
        }
    }
    return crc
}

export function rawToFriendly(rawAddress, { bounceable = false } = {}) {
    if (!rawAddress || !rawAddress.includes(":")) return rawAddress || ""
    const [wcStr, hexHash] = rawAddress.split(":")
    if (hexHash.length !== 64) return rawAddress
    const workchain = parseInt(wcStr, 10)
    const bytes = new Uint8Array(36)
    bytes[0] = bounceable ? 0x11 : 0x51
    bytes[1] = workchain & 0xff
    for (let i = 0; i < 32; i++) {
        bytes[2 + i] = parseInt(hexHash.substr(i * 2, 2), 16)
    }
    const crc = crc16(bytes.subarray(0, 34))
    bytes[34] = (crc >> 8) & 0xff
    bytes[35] = crc & 0xff
    let bin = ""
    for (const b of bytes) bin += String.fromCharCode(b)
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_")
}
