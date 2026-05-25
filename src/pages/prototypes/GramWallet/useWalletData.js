import { useEffect, useRef, useState } from "react"
import {
    getAccount,
    getEvents,
    getJettons,
    getNfts,
    getRates,
    rawToFriendly,
} from "../../../lib/tonapi"

const moneyFmt = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

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

function formatTimestamp(unixSeconds) {
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
    const recipientAddr = detail.recipient?.address
    const isIncoming = recipientAddr === myRawAddress
    return {
        counterparty: isIncoming ? detail.sender : detail.recipient,
        direction: isIncoming ? "in" : "out",
    }
}

const ALLOWED_JETTON_SYMBOLS = new Set(["USDT", "USD₮", "XAUt0"])
const TRANSFER_TYPES = new Set([
    "TonTransfer",
    "JettonTransfer",
    "NftItemTransfer",
])

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
    const fallbackAccount = preview.accounts?.[0]
    const name =
        counterparty?.name ||
        shortenAddress(counterparty?.address) ||
        fallbackAccount?.name ||
        shortenAddress(fallbackAccount?.address) ||
        preview.name ||
        "Activity"
    const isCurrencyTransfer =
        action.type === "TonTransfer" || action.type === "JettonTransfer"
    let description
    if (isCurrencyTransfer) {
        description = direction === "in" ? "Deposit" : "Withdrawal"
    } else {
        description = preview.name || action.type
    }
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
        icon: counterparty?.icon || fallbackAccount?.icon,
    }
}

function mapEvents(events, rawAddress) {
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

function mapNft(item) {
    return {
        id: item.address,
        name: item.metadata?.name || "Untitled",
        description: item.collection?.name || "",
        image: pickPreview(item),
    }
}

const EMPTY_STATE = {
    transactions: null,
    collectibles: null,
    tonAmount: null,
    usdtAmount: null,
    balance: null,
    error: null,
}

export default function useWalletData(address) {
    const [state, setState] = useState(EMPTY_STATE)
    const [hasMoreTransactions, setHasMoreTransactions] = useState(false)
    const [isLoadingMoreTransactions, setIsLoadingMoreTransactions] =
        useState(false)
    const pageRef = useRef({ rawAddress: null, nextFrom: null })

    useEffect(() => {
        let cancelled = false
        setState(EMPTY_STATE)
        setHasMoreTransactions(false)
        pageRef.current = { rawAddress: null, nextFrom: null }

        Promise.all([
            getAccount(address),
            getEvents(address, 20),
            getNfts(address, 20),
            getJettons(address),
            getRates(["ton"], ["usd"]),
        ])
            .then(([account, eventsData, nftsData, jettonsData, ratesData]) => {
                if (cancelled) return
                const rawAddress = account.address
                const transactions = mapEvents(eventsData.events, rawAddress)
                const collectibles = (nftsData.nft_items || []).map(mapNft)
                const tonValue = rawToFloat(account.balance, 9)
                const tonAmount = formatBalance(account.balance, 9)
                const usdt = (jettonsData.balances || []).find(
                    (b) => b.jetton?.symbol === "USD₮" ||
                        b.jetton?.symbol === "USDT"
                )
                const usdtValue = usdt
                    ? rawToFloat(usdt.balance, usdt.jetton.decimals)
                    : 0
                const usdtAmount = usdt
                    ? formatBalance(usdt.balance, usdt.jetton.decimals)
                    : "0.00"
                const tonRate = ratesData.rates?.TON?.prices?.USD || 0
                const totalUsd = tonValue * tonRate + usdtValue
                const balance = `$${moneyFmt.format(totalUsd)}`
                pageRef.current = {
                    rawAddress,
                    nextFrom: eventsData.next_from || null,
                }
                setHasMoreTransactions(!!eventsData.next_from)
                setState({
                    transactions,
                    collectibles,
                    tonAmount,
                    usdtAmount,
                    balance,
                    error: null,
                })
            })
            .catch((err) => {
                if (cancelled) return
                setState({
                    ...EMPTY_STATE,
                    error: err.message || String(err),
                })
            })

        return () => {
            cancelled = true
        }
    }, [address])

    async function loadMoreTransactions() {
        const page = pageRef.current
        if (!page.nextFrom || !page.rawAddress) return
        if (isLoadingMoreTransactions) return
        setIsLoadingMoreTransactions(true)
        try {
            const data = await getEvents(address, 20, page.nextFrom)
            const more = mapEvents(data.events, page.rawAddress)
            setState((s) => ({
                ...s,
                transactions: [...(s.transactions || []), ...more],
            }))
            pageRef.current = {
                ...pageRef.current,
                nextFrom: data.next_from || null,
            }
            setHasMoreTransactions(!!data.next_from)
        } catch {
            // swallow, leave state as-is
        } finally {
            setIsLoadingMoreTransactions(false)
        }
    }

    return {
        ...state,
        hasMoreTransactions,
        isLoadingMoreTransactions,
        loadMoreTransactions,
        isLoading:
            state.transactions === null &&
            state.collectibles === null &&
            !state.error,
    }
}
