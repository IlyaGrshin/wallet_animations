import { useEffect, useRef, useState } from "react"
import {
    getAccountState,
    getActions,
    getOwnedNfts,
} from "../../../lib/toncenter"
import { ACTION_TYPES, mapActions } from "./actions"
import { isFragmentItem, mapNft } from "./nft"
import useWalletBalance from "./useWalletBalance"

const PAGE_SIZE = 100

function appendUnique(prev, rows) {
    const seen = new Set((prev || []).map((row) => row.id))
    return [...(prev || []), ...rows.filter((row) => !seen.has(row.id))]
}

export default function useWalletData(address) {
    const {
        tonAmount,
        balance,
        error: balanceError,
    } = useWalletBalance(address)
    const [transactions, setTransactions] = useState(null)
    const [hasMoreTransactions, setHasMoreTransactions] = useState(false)
    const [collectibles, setCollectibles] = useState(null)
    const [transactionsError, setTransactionsError] = useState(null)
    const [collectiblesError, setCollectiblesError] = useState(null)
    const pageRef = useRef({ rawAddress: null, offset: 0, loading: false })
    const collectiblesStatusRef = useRef("idle")

    useEffect(() => {
        let cancelled = false
        setTransactions(null)
        setHasMoreTransactions(false)
        setCollectibles(null)
        setTransactionsError(null)
        setCollectiblesError(null)
        pageRef.current = { rawAddress: null, offset: 0, loading: false }
        collectiblesStatusRef.current = "idle"

        Promise.all([
            getAccountState(address),
            getActions(address, ACTION_TYPES, PAGE_SIZE),
        ])
            .then(([state, page]) => {
                if (cancelled) return
                const rawAddress = state.accounts[0].address
                pageRef.current = {
                    rawAddress,
                    offset: (page.actions || []).length,
                    loading: false,
                }
                setTransactions(mapActions(page, rawAddress))
                setHasMoreTransactions(
                    (page.actions || []).length === PAGE_SIZE
                )
            })
            .catch((err) => {
                if (!cancelled) setTransactionsError(err.message || String(err))
            })

        return () => {
            cancelled = true
        }
    }, [address])

    async function loadMoreTransactions() {
        const page = pageRef.current
        if (!page.offset || !page.rawAddress || page.loading) return
        pageRef.current = { ...page, loading: true }
        try {
            const next = await getActions(
                address,
                ACTION_TYPES,
                PAGE_SIZE,
                page.offset
            )
            const rows = mapActions(next, page.rawAddress)
            setTransactions((prev) => appendUnique(prev, rows))
            pageRef.current = {
                ...page,
                offset: page.offset + (next.actions || []).length,
            }
            setHasMoreTransactions((next.actions || []).length === PAGE_SIZE)
        } catch {
            pageRef.current = { ...page, loading: false }
            setHasMoreTransactions(false)
        }
    }

    async function loadCollectibles() {
        if (collectiblesStatusRef.current !== "idle") return
        collectiblesStatusRef.current = "loading"
        setCollectiblesError(null)
        try {
            const data = await getOwnedNfts(address)
            setCollectibles(
                (data.nft_items || [])
                    .filter(isFragmentItem)
                    .map((item) => mapNft(item, data))
            )
            collectiblesStatusRef.current = "done"
        } catch (err) {
            collectiblesStatusRef.current = "idle"
            setCollectiblesError(err.message || String(err))
        }
    }

    return {
        tonAmount,
        balance,
        balanceError,
        transactions,
        hasMoreTransactions,
        loadMoreTransactions,
        collectibles,
        loadCollectibles,
        transactionsError,
        collectiblesError,
    }
}
