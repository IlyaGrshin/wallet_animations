import { useSyncExternalStore } from "react"

import { openBarStream } from "../utils/tradingViewBars"

const DAY = 86_400
// Ticks arrive several times a second; screens repaint at most this often.
const FLUSH_INTERVAL = 1_000
// A series outlives its last subscriber for a while: flipping ranges or
// stepping back into an asset reuses the open stream and its bars.
const IDLE_TEARDOWN = 30_000

// Chart ranges of an asset page: bar size and depth per segment, plus the
// caption that sits next to the change. `span` (seconds) trims the history
// to the range itself: 288 five-minute bars are a day of crypto but several
// sessions of a stock.
export const PRICE_RANGES = {
    "1D": { resolution: "5", count: 288, span: DAY, caption: "Today" },
    "1W": { resolution: "60", count: 168, span: 7 * DAY, caption: "Past Week" },
    "1M": {
        resolution: "240",
        count: 180,
        span: 30 * DAY,
        caption: "Past Month",
    },
    "1Y": {
        resolution: "1D",
        count: 365,
        span: 365 * DAY,
        caption: "Past Year",
    },
    All: { resolution: "1W", count: 520, caption: "All Time" },
}

// Candle sizes for the candlestick view: enough history to pan back through,
// the caption names the candle the change is measured over.
export const CANDLE_INTERVALS = {
    "1M": { resolution: "1", count: 300, caption: "1M" },
    "5M": { resolution: "5", count: 300, caption: "5M" },
    "15M": { resolution: "15", count: 300, caption: "15M" },
    "1H": { resolution: "60", count: 300, caption: "1H" },
    "4H": { resolution: "240", count: 300, caption: "4H" },
    "12H": { resolution: "720", count: 300, caption: "12H" },
}

const trim = (bars, span) => {
    if (!span || !bars.length) return bars
    const from = bars.at(-1).time - span
    return bars.filter((bar) => bar.time >= from)
}

// The forming bar replaces the last one; a newer one appends.
const mergeBar = (bars, bar) => {
    const last = bars.at(-1)
    if (!last || bar.time > last.time) return [...bars, bar]
    if (bar.time === last.time) return [...bars.slice(0, -1), bar]
    return bars
}

// One entry per symbol + range, shared by every subscriber: a single
// websocket however many screens show the series.
const series = new Map()

const notify = (entry) => entry.listeners.forEach((listener) => listener())

const flush = (entry) => {
    entry.flushTimer = null
    if (!entry.pending || !entry.bars) return
    // Re-trim as bars append, so a long-lived stream keeps to its span.
    const bars = trim(mergeBar(entry.bars, entry.pending), entry.spec.span)
    entry.pending = null
    if (bars.at(-1) === entry.bars.at(-1)) return
    entry.bars = bars
    notify(entry)
}

const open = (entry) => {
    const { resolution, count, span } = entry.spec
    entry.stream = openBarStream({
        symbol: entry.symbol,
        resolution,
        count,
        onBars: (bars) => {
            entry.bars = trim(bars, span)
            notify(entry)
        },
        onUpdate: (bar) => {
            entry.pending = bar
            entry.flushTimer ??= setTimeout(() => flush(entry), FLUSH_INTERVAL)
        },
    })
}

// Past the idle window the series goes entirely, bars included: the next
// visit starts a fresh stream instead of holding every history ever seen.
const close = (entry) => {
    entry.stream?.close()
    clearTimeout(entry.flushTimer)
    series.delete(entry.key)
}

const entryFor = (symbol, spec) => {
    const key = `${symbol}|${spec.resolution}|${spec.count}|${spec.span ?? ""}`
    if (!series.has(key)) {
        series.set(key, {
            key,
            symbol,
            spec,
            bars: null,
            pending: null,
            listeners: new Set(),
            stream: null,
            flushTimer: null,
            teardownTimer: null,
        })
    }
    return series.get(key)
}

const subscribe = (entry, listener) => {
    entry.listeners.add(listener)
    clearTimeout(entry.teardownTimer)
    if (!entry.stream) open(entry)

    return () => {
        entry.listeners.delete(listener)
        if (entry.listeners.size) return
        entry.teardownTimer = setTimeout(() => close(entry), IDLE_TEARDOWN)
    }
}

const noop = () => () => {}

// Subscribes to the shared series and reads `select(bars)` off it; a
// primitive selection re-renders only when that value changes.
const useSeries = (symbol, spec, select) => {
    const entry = symbol ? entryFor(symbol, spec) : null
    return useSyncExternalStore(
        entry ? (listener) => subscribe(entry, listener) : noop,
        () => select(entry?.bars ?? null)
    )
}

const allBars = (bars) => bars
const lastClose = (bars) => bars?.at(-1)?.close ?? null

/**
 * Live OHLC history of `symbol` from TradingView's chart websocket, shaped by
 * `spec` (one of PRICE_RANGES or CANDLE_INTERVALS). Re-renders at most once
 * per second, and only when the forming bar actually moved. `null` until the
 * first snapshot.
 * @param {string} symbol TradingView symbol, e.g. "CRYPTO:GRAMUSD"
 * @param {{resolution: string, count: number, span?: number}} [spec]
 * @returns {Array<{time:number,open:number,high:number,low:number,close:number,value:number}> | null}
 */
export default function usePriceHistory(symbol, spec = PRICE_RANGES["1D"]) {
    return useSeries(symbol, spec, allBars)
}

/**
 * Latest price of `symbol`, off the same shared 1D stream: subscribers
 * re-render only when the price itself changes, not on every new bar.
 */
export function useLatestPrice(symbol) {
    return useSeries(symbol, PRICE_RANGES["1D"], lastClose)
}
