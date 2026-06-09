import { useEffect, useRef, useState } from "react"
import {
    getAccount,
    getAccountNftHistory,
    getCollectionsBulk,
    getEvents,
    getJettons,
    getNfts,
    getRates,
} from "../../../lib/tonapi"
import {
    EMPTY_WALLET,
    computeBalance,
    formatTimestamp,
    mapEvents,
    mapNft,
} from "./helpers"

export default function useWalletData(address) {
    const [wallet, setWallet] = useState(EMPTY_WALLET)
    const [transactions, setTransactions] = useState(null)
    const [hasMoreTransactions, setHasMoreTransactions] = useState(false)
    const [isLoadingMoreTransactions, setIsLoadingMoreTransactions] = useState(false)
    const [collectibles, setCollectibles] = useState(null)
    const [isLoadingCollectibles, setIsLoadingCollectibles] = useState(false)
    const [error, setError] = useState(null)
    const pageRef = useRef({ rawAddress: null, nextFrom: null })
    const collectiblesLoadedRef = useRef(false)

    useEffect(() => {
        let cancelled = false
        setWallet(EMPTY_WALLET)
        setTransactions(null)
        setHasMoreTransactions(false)
        setCollectibles(null)
        setError(null)
        pageRef.current = { rawAddress: null, nextFrom: null }
        collectiblesLoadedRef.current = false

        const accountPromise = getAccount(address)
        const fail = (err) => !cancelled && setError(err.message || String(err))

        Promise.all([
            accountPromise,
            getJettons(address),
            getRates(["ton"], ["usd"]),
        ])
            .then((r) => !cancelled && setWallet(computeBalance(...r)))
            .catch(fail)

        Promise.all([accountPromise, getEvents(address, 20)])
            .then(([acc, evt]) => {
                if (cancelled) return
                pageRef.current = { rawAddress: acc.address, nextFrom: evt.next_from || null }
                setTransactions(mapEvents(evt.events, acc.address))
                setHasMoreTransactions(!!evt.next_from)
            })
            .catch(fail)

        return () => {
            cancelled = true
        }
    }, [address])

    async function loadMoreTransactions() {
        const page = pageRef.current
        if (!page.nextFrom || !page.rawAddress || isLoadingMoreTransactions) return
        setIsLoadingMoreTransactions(true)
        try {
            const data = await getEvents(address, 20, page.nextFrom)
            const more = mapEvents(data.events, page.rawAddress)
            setTransactions((prev) => [...(prev || []), ...more])
            pageRef.current = { ...pageRef.current, nextFrom: data.next_from || null }
            setHasMoreTransactions(!!data.next_from)
        } finally {
            setIsLoadingMoreTransactions(false)
        }
    }

    async function loadCollectibles() {
        if (collectiblesLoadedRef.current || isLoadingCollectibles) return
        collectiblesLoadedRef.current = true
        setIsLoadingCollectibles(true)
        try {
            const [nftsRes, historyRes, account] = await Promise.all([
                getNfts(address, 200),
                getAccountNftHistory(address, 200),
                getAccount(address),
            ])
            const items = (nftsRes.nft_items || []).filter((i) => i.collection?.address)
            const addrs = [...new Set(items.map((i) => i.collection.address))]
            const { nft_collections: cols = [] } = await getCollectionsBulk(addrs)
            const isOfficial = (c) =>
                c.approved_by?.length > 0 &&
                (c.metadata?.external_link || "").includes("fragment.com")
            const ok = new Set(cols.filter(isOfficial).map((c) => c.address))
            const receivedAt = {}
            for (const op of historyRes.operations || []) {
                const a = op.item?.address
                if (!a || op.destination?.address !== account.address) continue
                if (!receivedAt[a] || op.utime > receivedAt[a]) receivedAt[a] = op.utime
            }
            setCollectibles(
                items
                    .filter((i) => ok.has(i.collection.address))
                    .map((i) => ({
                        ...mapNft(i),
                        caption: receivedAt[i.address] ? formatTimestamp(receivedAt[i.address]) : null,
                    }))
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
        isLoadingMoreTransactions,
        loadMoreTransactions,
        collectibles,
        isLoadingCollectibles,
        loadCollectibles,
        error,
    }
}
