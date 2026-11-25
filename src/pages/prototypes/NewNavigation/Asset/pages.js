import { getAssetIcon } from "../../../../utils/AssetsMap"
import { formatAmount } from "../../../../utils/number"
import { CURATED, transactionsFor } from "./data"
import getMarketStatus, { MARKET_STATUS } from "./marketStatus"

// Tickers listed under another name in the catalog: TradingView lists
// Toncoin as Gram now. Pages, curated copy and lookups key on the left side.
const ALIASES = { GRAM: "TON" }

export const canonicalTicker = (id) => {
    const ticker = id.toUpperCase()
    return ALIASES[ticker] ?? ticker
}

/**
 * One asset page from what the product knows about a ticker: the curated
 * copy (data.js), its catalog listing (TradingView scanner) and the wallet
 * balance. A held asset opens filled, anything else as its empty state; a
 * stock reads the market session once here, for its chip and its buttons.
 * @param {string} ticker Canonical ticker (canonicalTicker)
 * @param {{listing: {name?: string, image?: string, quoteSymbol?: string}, wallet: Array}} sources
 */
export function resolvePage(ticker, { listing, wallet }) {
    const curated = CURATED[ticker] ?? {}
    const held = wallet.find((row) => row.ticker.toUpperCase() === ticker)
    const amount = Number(held?.value ?? 0)
    const balance =
        amount > 0 ? { amount, changePct: parseFloat(held.delta) || 0 } : null
    const page = {
        kind: "crypto",
        name: listing.name ?? held?.name ?? ticker,
        icon: getAssetIcon(ticker) ?? listing.image,
        symbol: listing.quoteSymbol ?? `CRYPTO:${ticker}USD`,
        actions: balance ? ["Buy", "Sell"] : ["Buy"],
        ...curated,
        ticker: curated.ticker ?? ticker,
        balance,
        transactions: balance ? transactionsFor(ticker) : [],
    }

    if (page.kind === "stock") {
        page.market = getMarketStatus()
        if (page.market === MARKET_STATUS.CLOSED) page.actions = null
    }
    return page
}

/**
 * The page's holdings at `price`: the wallet balance, plus the staked part
 * when the asset earns. Null for an asset the user doesn't hold.
 */
export function buildHoldings(page, price) {
    if (!page.balance) return null

    const unit = (value) => `${formatAmount(value)} ${page.ticker}`
    const main = page.balance.amount * price
    const rows = [
        {
            kind: "main",
            amount: unit(page.balance.amount),
            value: main,
            delta: (main * page.balance.changePct) / 100,
        },
    ]
    if (page.earn) {
        rows.push({
            kind: "earn",
            amount: unit(page.earn.amount),
            value: page.earn.amount * price,
            delta: page.earn.delta,
            apy: page.earn.apy,
        })
    }

    const total = rows.reduce((sum, row) => sum + row.value, 0)
    return {
        total,
        change: (total * page.balance.changePct) / 100,
        changePct: page.balance.changePct,
        rows,
    }
}

const OVERVIEW_INFO = {
    marketCap: "The circulating supply multiplied by its current price.",
    volume: "The total volume of all transactions over the past 24 hours.",
    supply: "The amount of coins that are circulating in the market and are in public hands.",
}

const compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

/**
 * Overview rows from market stats. While they load (`undefined`) the rows
 * keep their place with empty values; figures the source lacks drop out.
 */
export function overviewRows(stats) {
    if (stats === null) return null
    const rows = [
        {
            label: "Market Cap",
            value: stats?.marketCap && `$${compact.format(stats.marketCap)}`,
            delta: stats?.marketCapChange,
            info: OVERVIEW_INFO.marketCap,
        },
        {
            label: "Volume",
            value: stats?.volume && `$${compact.format(stats.volume)}`,
            delta: stats?.volumeChange,
            info: OVERVIEW_INFO.volume,
        },
        {
            label: "Circulating Supply",
            value: stats?.supply && compact.format(stats.supply),
            info: OVERVIEW_INFO.supply,
        },
    ]
    return stats ? rows.filter((row) => row.value) : rows
}

// Only web links leave the page: a third-party profile could carry a
// `javascript:` (or other) scheme that the link opener would run.
export const safeWebUrl = (value) => {
    try {
        const url = new URL(value)
        return url.protocol === "https:" || url.protocol === "http:"
            ? url
            : null
    } catch {
        return null
    }
}

// Links from a CoinGecko profile: the Telegram channel, the site, X.
export function profileLinks(page, profile) {
    if (!profile) return null
    const links = []
    const homepage = profile.homepage && safeWebUrl(profile.homepage)
    if (profile.telegram) {
        links.push({
            title: `${page.name} in Telegram`,
            subtitle: `@${profile.telegram}`,
            icon: page.icon,
            url: `https://t.me/${encodeURIComponent(profile.telegram)}`,
        })
    }
    if (homepage) {
        links.push({
            title: homepage.hostname.replace(/^www\./, ""),
            subtitle: "website",
            glyph: "@",
            url: homepage.href,
        })
    }
    if (profile.twitter) {
        links.push({
            title: "X",
            subtitle: `@${profile.twitter}`,
            glyph: "X",
            url: `https://x.com/${encodeURIComponent(profile.twitter)}`,
        })
    }
    return links.length ? links : null
}
