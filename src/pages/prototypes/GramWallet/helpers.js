const moneyFmt = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

export const EMPTY_WALLET = { tonAmount: null, balance: null }

function rawToFloat(raw, decimals) {
    if (raw == null) return 0
    return Number(raw) / 10 ** decimals
}

function formatBalance(raw, decimals) {
    if (raw == null) return null
    return moneyFmt.format(rawToFloat(raw, decimals))
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
    const tonValue = rawToFloat(account.balance, 9)
    const tonRate = ratesData.rates?.TON?.prices?.USD || 0
    return {
        tonAmount: formatBalance(account.balance, 9),
        balance: `$${moneyFmt.format(tonValue * tonRate)}`,
    }
}
