import { rawToFriendly } from "../../../lib/tonapi"

const moneyFmt = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

export const EMPTY_WALLET = { tonAmount: null, usdtAmount: null, balance: null }

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

function shortenAddress(addr) {
    if (!addr) return ""
    const friendly = rawToFriendly(addr)
    return `${friendly.slice(0, 4)}…${friendly.slice(-4)}`
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
    let amount = null
    if (preview.value) {
        amount = isTransfer
            ? `${direction === "in" ? "+" : "−"}${preview.value}`
            : preview.value
    }
    return {
        id: event.event_id,
        name,
        description,
        caption: formatTimestamp(event.timestamp),
        amount,
        icon: counterparty?.icon || fallback?.icon,
    }
}

export function mapEvents(events, rawAddress) {
    return (events || [])
        .filter((e) => !e.is_scam)
        .map((e) => mapEvent(e, rawAddress))
        .filter(Boolean)
}

function pickPreview(item) {
    const previews = item.previews || []
    const small = previews.find((p) => p.resolution === "100x100")
    return small?.url || previews[0]?.url || item.metadata?.image
}

export function mapNft(item) {
    return {
        id: item.address,
        name: item.metadata?.name || "Untitled",
        description: item.collection?.name || "",
        image: pickPreview(item),
    }
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
        usdtAmount: usdt ? formatBalance(usdt.balance, usdt.jetton.decimals) : "0.00",
        balance: `$${moneyFmt.format(tonValue * tonRate + usdtValue)}`,
    }
}
