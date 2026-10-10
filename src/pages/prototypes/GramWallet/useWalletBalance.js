import { useEffect, useState } from "react"
import { getRates } from "../../../lib/tonapi"
import { getAccountState } from "../../../lib/toncenter"
import { EMPTY_WALLET, computeBalance } from "./helpers"

const IDLE = { ...EMPTY_WALLET, error: null }

function errorText(err) {
    return err?.message || String(err)
}

export default function useWalletBalance(address) {
    const [balance, setBalance] = useState(IDLE)

    useEffect(() => {
        let cancelled = false
        setBalance(IDLE)

        Promise.allSettled([
            getAccountState(address),
            getRates(["ton"], ["usd"]),
        ]).then(([state, rates]) => {
            if (cancelled) return
            if (state.status === "rejected") {
                setBalance({ ...EMPTY_WALLET, error: errorText(state.reason) })
                return
            }
            const account = state.value.accounts[0]
            if (rates.status === "rejected") {
                setBalance({
                    ...EMPTY_WALLET,
                    tonAmount: computeBalance(account, {}).tonAmount,
                    error: errorText(rates.reason),
                })
                return
            }
            setBalance({ ...computeBalance(account, rates.value), error: null })
        })

        return () => {
            cancelled = true
        }
    }, [address])

    return balance
}
