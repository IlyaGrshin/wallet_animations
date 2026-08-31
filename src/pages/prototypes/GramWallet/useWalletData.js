import { useEffect, useRef, useState } from "react"
import { getRates } from "../../../lib/tonapi"
import {
    getAccountState,
    getActions,
    getOwnedNfts,
} from "../../../lib/toncenter"
import { EMPTY_WALLET, computeBalance } from "./helpers"
import { ACTION_TYPES, lastActionLt, mapActions } from "./actions"
import { isFragmentItem, mapNft } from "./nft"

const PAGE_SIZE = 100

export default function useWalletData(address) {
    const [wallet, setWallet] = useState(EMPTY_WALLET)
    const [transactions, setTransactions] = useState(null)
    const [hasMoreTransactions, setHasMoreTransactions] = useState(false)
    const [isLoadingMoreTransactions, setIsLoadingMoreTransactions] = useState(false)
    const [collectibles, setCollectibles] = useState(null)
    const [isLoadingCollectibles, setIsLoadingCollectibles] = useState(false)
    const [error, setError] = useState(null)
    const pageRef = useRef({ rawAddress: null, endLt: null })
    const collectiblesLoadedRef = useRef(false)

    useEffect(() => {
        let cancelled = false
        setWallet(EMPTY_WALLET)
        setTransactions(null)
        setHasMoreTransactions(false)
        setCollectibles(null)
        setError(null)
        pageRef.current = { rawAddress: null, endLt: null }
        collectiblesLoadedRef.current = false

        const accountPromise = getAccountState(address)
        const fail = (err) => !cancelled && setError(err.message || String(err))

        Promise.all([accountPromise, getRates(["ton"], ["usd"])])
            .then(([state, rates]) => {
                if (cancelled) return
                setWallet(computeBalance(state.accounts[0], rates))
            })
            .catch(fail)

        Promise.all([accountPromise, getActions(address, ACTION_TYPES, PAGE_SIZE)])
            .then(([state, page]) => {
                if (cancelled) return
                const rawAddress = state.accounts[0].address
                pageRef.current = { rawAddress, endLt: lastActionLt(page) }
                setTransactions(mapActions(page, rawAddress))
                setHasMoreTransactions(
                    (page.actions || []).length === PAGE_SIZE
                )
            })
            .catch(fail)

        return () => {
            cancelled = true
        }
    }, [address])

    async function loadMoreTransactions() {
        const page = pageRef.current
        if (!page.endLt || !page.rawAddress || isLoadingMoreTransactions) return
        setIsLoadingMoreTransactions(true)
        try {
            const next = await getActions(address, ACTION_TYPES, PAGE_SIZE, page.endLt)
            const rows = mapActions(next, page.rawAddress)
            setTransactions((prev) => [...(prev || []), ...rows])
            pageRef.current = { ...page, endLt: lastActionLt(next) }
            setHasMoreTransactions((next.actions || []).length === PAGE_SIZE)
        } finally {
            setIsLoadingMoreTransactions(false)
        }
    }

    async function loadCollectibles() {
        if (collectiblesLoadedRef.current || isLoadingCollectibles) return
        collectiblesLoadedRef.current = true
        setIsLoadingCollectibles(true)
        try {
            const data = await getOwnedNfts(address)
            setCollectibles(
                (data.nft_items || [])
                    .filter(isFragmentItem)
                    .map((item) => mapNft(item, data))
            )
        } catch (err) {
            setError(err.message || String(err))
        } finally {
            setIsLoadingCollectibles(false)
        }
    }

    return {
        ...wallet,
        transactions,
        hasMoreTransactions,
        loadMoreTransactions,
        collectibles,
        loadCollectibles,
        error,
    }
}
