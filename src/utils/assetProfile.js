import { readJson } from "../lib/requestCache"

// Reference data of a coin page, from two open-CORS sources: market figures
// off TradingView's coin screener (the same universe as the prices), copy
// and links off CoinGecko. Both are cached for the session — CoinGecko's
// public quota is a few requests a minute, so requestCache's 30s TTL would
// spend it on re-visits — and concurrent requests share one fetch.
const SCANNER = "https://scanner.tradingview.com/coin/scan"
const GECKO = "https://api.coingecko.com/api/v3"

const STATS_COLUMNS = [
    "market_cap_calc",
    "24h_close_change|5",
    "24h_vol_cmc",
    "24h_vol_change_cmc",
    "circulating_supply",
]

// CoinGecko lists some coins under another ticker (Toncoin is "GRAM" there).
const GECKO_IDS = { TON: "the-open-network" }

const memo = (load) => {
    const cache = new Map()
    return (key) => {
        if (!cache.has(key)) {
            cache.set(
                key,
                load(key).catch(() => {
                    cache.delete(key) // let a later visit retry
                    return null
                })
            )
        }
        return cache.get(key)
    }
}

const json = async (url, init) => readJson(await fetch(url, init), url)

/**
 * Market cap (with its 24h change, which tracks the price), 24h volume with
 * its change, circulating supply. Null when the screener doesn't list it.
 * @param {string} quoteSymbol e.g. "CRYPTO:BTCUSD"
 */
export const fetchMarketStats = memo(async (quoteSymbol) => {
    const { data } = await json(SCANNER, {
        method: "POST",
        body: JSON.stringify({
            symbols: { tickers: [quoteSymbol] },
            columns: STATS_COLUMNS,
        }),
    })
    const row = data?.[0]?.d
    if (!row) return null
    const [marketCap, marketCapChange, volume, volumeChange, supply] = row
    return { marketCap, marketCapChange, volume, volumeChange, supply }
})

// The most valuable coin trading under `ticker`.
const geckoIdFor = async (ticker) => {
    if (GECKO_IDS[ticker]) return GECKO_IDS[ticker]
    const { coins } = await json(`${GECKO}/search?query=${ticker}`)
    const matches = coins
        .filter((coin) => coin.symbol.toUpperCase() === ticker)
        .sort(
            (a, b) =>
                (a.market_cap_rank ?? Infinity) -
                (b.market_cap_rank ?? Infinity)
        )
    return matches[0]?.id ?? null
}

// First paragraph of CoinGecko's HTML description, as plain text.
const plainText = (html) => {
    const doc = new DOMParser().parseFromString(
        html.split(/\r?\n\r?\n/)[0],
        "text/html"
    )
    return doc.body.textContent.replace(/\s+/g, " ").trim()
}

/**
 * Description and links of a coin by ticker. Null when CoinGecko has no
 * coin under it.
 * @param {string} ticker Upper case, e.g. "XRP"
 * @returns {Promise<{description: string|null, homepage: string|null,
 *   telegram: string|null, twitter: string|null} | null>}
 */
export const fetchCoinProfile = memo(async (ticker) => {
    const id = await geckoIdFor(ticker)
    if (!id) return null
    const coin = await json(
        `${GECKO}/coins/${id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`
    )
    const description = coin.description?.en
    return {
        description: description ? plainText(description) : null,
        homepage: coin.links?.homepage?.find(Boolean) ?? null,
        telegram: coin.links?.telegram_channel_identifier || null,
        twitter: coin.links?.twitter_screen_name || null,
    }
})
