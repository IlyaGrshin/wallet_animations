import { rawToFriendly } from "../../../lib/tonapi"

const moneyFmt = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

export const EMPTY_WALLET = { tonAmount: null, balance: null }

const ALLOWED_JETTON_SYMBOLS = new Set(["USDT", "USD₮", "XAUt0"])
const TRANSFER_TYPES = new Set([
    "TonTransfer",
    "JettonTransfer",
    "NftItemTransfer",
])

function rawToFloat(raw, decimals) {
    if (raw == null) return 0
    return Number(raw) / 10 ** decimals
}

function formatBalance(raw, decimals) {
    if (raw == null) return null
    return moneyFmt.format(rawToFloat(raw, decimals))
}

export function shortenFriendly(friendly) {
    if (!friendly) return ""
    return `${friendly.slice(0, 4)}…${friendly.slice(-4)}`
}

export function shortenAddress(addr) {
    if (!addr) return ""
    return shortenFriendly(rawToFriendly(addr))
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

function splitValue(previewValue) {
    if (!previewValue) return { value: null, unit: null }
    const match = /^(.+)\s(\S+)$/.exec(previewValue.trim())
    if (!match) return { value: previewValue, unit: null }
    return { value: match[1], unit: match[2] }
}

function pickCounterparty(action, myRawAddress) {
    const detail =
        action.TonTransfer ||
        action.JettonTransfer ||
        action.NftItemTransfer ||
        null
    if (!detail) return { counterparty: null, direction: "in" }
    const isIncoming = detail.recipient?.address === myRawAddress
    return {
        counterparty: isIncoming ? detail.sender : detail.recipient,
        direction: isIncoming ? "in" : "out",
    }
}

function mapEvent(event, myRawAddress) {
    const action = event.actions?.[0]
    if (!action) return null
    if (action.type === "JettonMint") return null
    if (action.type === "JettonTransfer") {
        const symbol = action.JettonTransfer?.jetton?.symbol
        if (!ALLOWED_JETTON_SYMBOLS.has(symbol)) return null
    }
    const { counterparty, direction } = pickCounterparty(action, myRawAddress)
    if (counterparty?.is_scam) return null
    const preview = action.simple_preview || {}
    const fallback = preview.accounts?.[0]
    const name =
        counterparty?.name ||
        shortenAddress(counterparty?.address) ||
        fallback?.name ||
        shortenAddress(fallback?.address) ||
        preview.name ||
        "Activity"
    const isCurrencyTransfer =
        action.type === "TonTransfer" || action.type === "JettonTransfer"
    const description = isCurrencyTransfer
        ? direction === "in" ? "Deposit" : "Withdrawal"
        : preview.name || action.type
    const isTransfer = TRANSFER_TYPES.has(action.type)
    const { value, unit } = splitValue(preview.value)
    const sign = isTransfer && value ? (direction === "in" ? "+" : "−") : ""
    const nft = action.NftItemTransfer?.nft
    return {
        id: event.event_id,
        name,
        description,
        caption: formatTimestamp(event.timestamp),
        amount: value ? `${sign}${value}` : null,
        unit,
        icon: counterparty?.icon || fallback?.icon,
        nftAddress: typeof nft === "string" ? nft : nft?.address,
    }
}

export function mapEvents(events, rawAddress) {
    return (events || [])
        .filter((e) => !e.is_scam)
        .map((e) => mapEvent(e, rawAddress))
        .filter(Boolean)
}

export function computeBalance(account, jettonsData, ratesData) {
    const tonValue = rawToFloat(account.balance, 9)
    const usdt = (jettonsData.balances || []).find(
        (b) => b.jetton?.symbol === "USD₮" || b.jetton?.symbol === "USDT"
    )
    const usdtValue = usdt ? rawToFloat(usdt.balance, usdt.jetton.decimals) : 0
    const tonRate = ratesData.rates?.TON?.prices?.USD || 0
    return {
        tonAmount: formatBalance(account.balance, 9),
        balance: `$${moneyFmt.format(tonValue * tonRate + usdtValue)}`,
    }
}
