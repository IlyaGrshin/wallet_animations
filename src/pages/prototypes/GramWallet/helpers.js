import { TON_DECIMALS } from "./constants"
import { format } from "./currency"

export const EMPTY_WALLET = { tonAmount: null, balance: null, rate: null }

function rawToFloat(raw, decimals) {
    if (raw == null) return 0
    return Number(raw) / 10 ** decimals
}

function formatBalance(raw, decimals) {
    if (raw == null) return null
    return format(rawToFloat(raw, decimals))
}

export function formatDate(unixSeconds) {
    return new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

export function formatTimestamp(unixSeconds) {
    const date = new Date(unixSeconds * 1000)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const time = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    })
    if (isToday) return `Today at ${time}`
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${time}`
    }
    const month = date.toLocaleString("en-US", { month: "short" })
    return `${month} ${date.getDate()} at ${time}`
}

export function computeBalance(account, ratesData) {
    const tonValue = rawToFloat(account.balance, TON_DECIMALS)
    const tonRate = ratesData.rates?.TON?.prices?.USD || 0
    return {
        tonAmount: formatBalance(account.balance, TON_DECIMALS),
        balance: `$${format(tonValue * tonRate)}`,
        rate: tonRate,
    }
}
