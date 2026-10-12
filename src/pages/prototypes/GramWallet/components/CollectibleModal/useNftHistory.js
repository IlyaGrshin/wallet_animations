import { useEffect, useState } from "react"

import {
    getDeployTransaction,
    getNftTransfers,
} from "../../../../../lib/toncenter"
import { mapMintDate, mapNftHistory } from "../../nft"

const EMPTY = { from: null, since: null, minted: null }
const IDLE = { isLoading: false, ...EMPTY }

export default function useNftHistory(collectible) {
    const [state, setState] = useState(IDLE)
    const address = collectible?.id ?? null
    const owner = collectible?.ownerAddress

    useEffect(() => {
        if (!address) {
            setState(IDLE)
            return
        }
        let cancelled = false
        setState({ isLoading: true, ...EMPTY })
        Promise.all([getNftTransfers(address), getDeployTransaction(address)])
            .then(([transfers, deploy]) => {
                if (cancelled) return
                setState({
                    isLoading: false,
                    ...mapNftHistory(transfers, owner),
                    minted: mapMintDate(deploy),
                })
            })
            .catch(() => {
                if (!cancelled) setState(IDLE)
            })

        return () => {
            cancelled = true
        }
    }, [address, owner])

    return state
}
