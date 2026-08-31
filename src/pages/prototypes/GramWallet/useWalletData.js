import { useEffect, useRef, useState } from "react"
import { getAccount, getEvents, getJettons, getRates } from "../../../lib/tonapi"
import { getNftsByAddress, getOwnedNfts } from "../../../lib/toncenter"
import { EMPTY_WALLET, computeBalance, mapEvents } from "./helpers"
import { isFragmentItem, mapNft, rawKey } from "./nft"

async function withFragmentNfts(rows) {
    const addresses = [...new Set(rows.map((r) => r.nftAddress).filter(Boolean))]
    if (!addresses.length) return rows
    try {
        const data = await getNftsByAddress(addresses)
        const byAddress = new Map(
            (data.nft_items || [])
                .filter(isFragmentItem)
                .map((item) => [rawKey(item.address), mapNft(item, data)])
        )
        return rows
            .filter(
                (row) =>
                    !row.nftAddress || byAddress.has(rawKey(row.nftAddress))
            )
            .map((row) =>
                row.nftAddress
                    ? { ...row, nft: byAddress.get(rawKey(row.nftAddress)) }
                    : row
            )
    } catch {
        return rows
    }
}

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
            .then(async ([acc, evt]) => {
                if (cancelled) return
                pageRef.current = { rawAddress: acc.address, nextFrom: evt.next_from || null }
                const rows = await withFragmentNfts(
                    mapEvents(evt.events, acc.address)
                )
                if (cancelled) return
                setTransactions(rows)
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
            const more = await withFragmentNfts(
                mapEvents(data.events, page.rawAddress)
            )
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
