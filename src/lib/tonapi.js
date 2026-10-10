import { cachedRequest, readJson } from "./requestCache"
import WebApp from "./twa"

const TONAPI_BASE = "https://tonapi.io"
const PROXY_URL = import.meta.env.VITE_TONAPI_PROXY_URL
const DIRECT_KEY = import.meta.env.VITE_TONAPI_KEY

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

function get(path) {
    const label = `tonapi ${path}`
    return cachedRequest(label, async () => {
        const { url, headers } = buildRequest(path)
        return readJson(await fetch(url, { headers }), label)
    })
}

export function getRates(tokens, currencies = ["usd"]) {
    const t = tokens.join(",")
    const c = currencies.join(",")
    return get(`/v2/rates?tokens=${t}&currencies=${c}`)
}
