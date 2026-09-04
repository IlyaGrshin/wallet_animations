import { useEffect, useState } from "react"
import { getRates } from "../../../lib/tonapi"
import { getAccountState } from "../../../lib/toncenter"
import { EMPTY_WALLET, computeBalance } from "./helpers"

const IDLE = { ...EMPTY_WALLET, error: null }

export default function useWalletBalance(address) {
    const [balance, setBalance] = useState(IDLE)

    useEffect(() => {
        let cancelled = false
        setBalance(IDLE)

        Promise.all([getAccountState(address), getRates(["ton"], ["usd"])])
            .then(([state, rates]) => {
                if (cancelled) return
                setBalance({
                    ...computeBalance(state.accounts[0], rates),
                    error: null,
                })
            })
            .catch((err) => {
                if (cancelled) return
                setBalance({
                    ...EMPTY_WALLET,
                    error: err.message || String(err),
                })
            })

        return () => {
            cancelled = true
        }
    }, [address])

    return balance
}
