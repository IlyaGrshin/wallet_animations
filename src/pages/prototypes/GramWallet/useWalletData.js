import { useEffect, useRef, useState } from "react"
import {
    getAccountState,
    getActions,
    getOwnedNfts,
} from "../../../lib/toncenter"
import { ACTION_TYPES, lastActionLt, mapActions } from "./actions"
import { isFragmentItem, mapNft } from "./nft"
import useWalletBalance from "./useWalletBalance"

const PAGE_SIZE = 100

export default function useWalletData(address) {
    const { tonAmount, balance } = useWalletBalance(address)
    const [transactions, setTransactions] = useState(null)
    const [hasMoreTransactions, setHasMoreTransactions] = useState(false)
    const [collectibles, setCollectibles] = useState(null)
    const [transactionsError, setTransactionsError] = useState(null)
    const [collectiblesError, setCollectiblesError] = useState(null)
    const pageRef = useRef({ rawAddress: null, endLt: null, loading: false })
    const collectiblesStatusRef = useRef("idle")

    useEffect(() => {
        let cancelled = false
        setTransactions(null)
        setHasMoreTransactions(false)
        setCollectibles(null)
        setTransactionsError(null)
        setCollectiblesError(null)
        pageRef.current = { rawAddress: null, endLt: null, loading: false }
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
                    endLt: lastActionLt(page),
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
        if (!page.endLt || !page.rawAddress || page.loading) return
        pageRef.current = { ...page, loading: true }
        try {
            const next = await getActions(
                address,
                ACTION_TYPES,
                PAGE_SIZE,
                page.endLt
            )
            const rows = mapActions(next, page.rawAddress)
            setTransactions((prev) => [...(prev || []), ...rows])
            pageRef.current = { ...page, endLt: lastActionLt(next) }
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
        transactions,
        hasMoreTransactions,
        loadMoreTransactions,
        collectibles,
        loadCollectibles,
        transactionsError,
        collectiblesError,
    }
}
