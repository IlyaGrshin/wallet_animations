import { useEffect, useState } from "react"

import { fetchCoinProfile, fetchMarketStats } from "../utils/assetProfile"

/**
 * Market figures and CoinGecko copy of a coin (see utils/assetProfile).
 * Each part is `undefined` while loading and `null` when the source has none
 * (or fetching is off).
 * @param {string} ticker Upper case, e.g. "XRP"
 * @param {string} quoteSymbol TradingView symbol, e.g. "CRYPTO:XRPUSD"
 * @param {boolean} [enabled=true] Skip fetching (e.g. for a stock).
 */
export default function useAssetProfile(ticker, quoteSymbol, enabled = true) {
    const [stats, setStats] = useState(undefined)
    const [profile, setProfile] = useState(undefined)

    useEffect(() => {
        if (!enabled) return undefined
        let current = true
        fetchMarketStats(quoteSymbol).then(
            (value) => current && setStats(value)
        )
        fetchCoinProfile(ticker).then((value) => current && setProfile(value))
        return () => {
            current = false
        }
    }, [ticker, quoteSymbol, enabled])

    return enabled ? { stats, profile } : { stats: null, profile: null }
}
