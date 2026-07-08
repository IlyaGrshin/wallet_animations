import { useSyncExternalStore } from "react"

import { openQuoteStream } from "../utils/tradingViewQuotes"

// TradingView's coin screener: one open-CORS request carries prices, 24h
// deltas, volumes, categories AND logo ids for the top coins — data and
// icons come from the same catalog, so tickers always match. The screener
// snapshot defines the universe; live prices then stream over TradingView's
// quote websocket (see utils/tradingViewQuotes) and are flushed into the
// snapshot at most once per FLUSH_INTERVAL.
const ENDPOINT = "https://scanner.tradingview.com/coin/scan"
const SCANNER_INTERVAL = 60_000
const FLUSH_INTERVAL = 1_000

const REQUEST = {
    columns: [
        "base_currency",
        "base_currency_desc",
        "base_currency_logoid",
        "close",
        "24h_close_change|5",
        "24h_vol_cmc",
        "crypto_common_categories",
    ],
    sort: { sortBy: "crypto_total_rank", sortOrder: "asc" },
    range: [0, 100],
}

// The logo catalog shares the scanner's `logoid`, so the icon URL is derived
// straight from the row — never guessed from the ticker (HYPE != XTVCHYPE).
const LOGO_BASE = "https://s3-symbol-logo.tradingview.com"
const logoUrl = (logoid) => (logoid ? `${LOGO_BASE}/${logoid}--big.svg` : null)

// Rows keep the CoinGecko field names the screens already consume;
// `quoteSymbol` (e.g. "CRYPTO:BTCUSD") keys the websocket ticks. `image` is
// part of the shared contract (ColorAssetPage reads it for its accent color).
const mapRows = (data) =>
    data.map(({ s, d }) => ({
        quoteSymbol: s,
        symbol: d[0]?.toLowerCase(),
        name: d[1],
        logoid: d[2],
        image: logoUrl(d[2]),
        current_price: d[3],
        price_change_percentage_24h: d[4],
        total_volume: d[5],
        categories: d[6] ?? [],
    }))

// Module-level store: one scanner poll, one websocket, and one flush timer
// shared across every subscribed screen. The snapshot persists between
// mounts so revisits paint instantly; everything stops when the last
// subscriber leaves.
let snapshot = { assets: null, updatedAt: null, error: null }
let base = null // last scanner rows, before websocket ticks
let baseAt = 0 // timestamp of the current scanner snapshot
const ticks = new Map() // quoteSymbol -> latest streamed fields + `at`
const subscribers = new Set()
let scannerTimer = null
let flushTimer = null
let stream = null
let streamKey = ""
let dirty = false

const notify = () => subscribers.forEach((listener) => listener())

// Live ticks win over the scanner close prices — but only while they are
// fresher than the current snapshot. After an outage/reconnect, or once a
// symbol goes quiet, its stale tick predates the latest scanner refresh, so
// the scanner's current close/chp wins again until the symbol ticks anew.
const applyTicks = (rows) =>
    rows.map((row) => {
        const tick = ticks.get(row.quoteSymbol)
        if (!tick || tick.at < baseAt) return row
        return {
            ...row,
            current_price: tick.lp ?? row.current_price,
            price_change_percentage_24h:
                tick.chp ?? row.price_change_percentage_24h,
        }
    })

const onTick = (name, values) => {
    ticks.set(name, { ...ticks.get(name), ...values, at: Date.now() })
    dirty = true
}

// (Re)subscribe the quote stream when the universe actually changes.
const ensureStream = () => {
    const key = base.map((row) => row.quoteSymbol).join(",")
    if (key === streamKey) return
    stream?.close()
    stream = openQuoteStream({
        symbols: base.map((row) => row.quoteSymbol),
        fields: ["lp", "chp"],
        onTick,
    })
    streamKey = key
}

const publish = () => {
    snapshot = {
        assets: applyTicks(base),
        updatedAt: new Date(),
        error: null,
    }
    notify()
}

const flush = () => {
    if (!dirty || !base) return
    dirty = false
    publish()
}

const refresh = async () => {
    try {
        // No Content-Type header on purpose: the scanner's preflight does
        // not allow it, but a bare POST (text/plain) is a CORS "simple
        // request" — no preflight — and the server parses the JSON body
        // regardless.
        const response = await fetch(ENDPOINT, {
            method: "POST",
            body: JSON.stringify(REQUEST),
        })
        const { data } = await response.json()
        // The last subscriber may have unmounted during the await, closing the
        // stream. Bail before reopening one that nobody owns and would leak.
        if (!subscribers.size) return
        base = mapRows(data)
        baseAt = Date.now()
        ensureStream()
        publish()
    } catch (error) {
        // Keep serving the last good snapshot; only surface the error when
        // there is no data at all. The next tick retries anyway.
        if (!snapshot.assets) {
            snapshot = { assets: null, updatedAt: null, error }
            notify()
        }
    }
}

const subscribe = (listener) => {
    subscribers.add(listener)
    if (subscribers.size === 1) {
        refresh()
        scannerTimer = setInterval(refresh, SCANNER_INTERVAL)
        flushTimer = setInterval(flush, FLUSH_INTERVAL)
    }
    return () => {
        subscribers.delete(listener)
        if (subscribers.size) return
        clearInterval(scannerTimer)
        clearInterval(flushTimer)
        stream?.close()
        stream = null
        streamKey = ""
        ticks.clear() // drop the stale price cache; next mount refetches
    }
}

// Live asset feed: `assets` stays null until the first response so screens
// can render their skeleton in place. After that the scanner refreshes the
// universe every SCANNER_INTERVAL while websocket ticks stream prices and
// deltas in near-realtime — the whole tab updates at once.
export default function useAssets() {
    return useSyncExternalStore(subscribe, () => snapshot)
}
