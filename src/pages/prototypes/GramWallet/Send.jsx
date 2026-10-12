import { useState } from "react"
import { useLocation } from "wouter"

import Page from "../../../components/Page"
import PanelHeader from "../../../components/PanelHeader"
import Text from "../../../components/Text"
import { RegularButton } from "../../../components/Button"
import { useViewportHeight } from "../../../hooks/useViewportHeight"
import { BackButton } from "../../../lib/twa"

import AmountField from "./components/AmountField"
import { GRAM, format, formatExact, other, sanitize, toEntry } from "./currency"
import { MY_ADDRESS, WALLET_PATH } from "./constants"
import useWalletBalance from "./useWalletBalance"
import * as styles from "./Send.module.scss"

const RECIPIENT = "Monika"
const INITIAL_AMOUNT = "2.46"

const Send = () => {
    const [, navigate] = useLocation()
    const [amount, setAmount] = useState(INITIAL_AMOUNT)
    const [currency, setCurrency] = useState(GRAM)
    const [flying, setFlying] = useState(false)
    const viewportHeight = useViewportHeight()
    const { tonAmount, rate, error } = useWalletBalance(MY_ADDRESS)
    const settled = tonAmount !== null || Boolean(error)
    const unavailable = error ? "—" : null

    const goBack = () => navigate(WALLET_PATH)

    const isGram = currency === GRAM
    const entered = Number(amount) || 0
    const grams = isGram ? entered : entered / (rate || 1)
    const counter = isGram ? entered * (rate || 0) : grams

    const swap = () => {
        setFlying(true)
        setCurrency(other(currency))
        setAmount((prev) => {
            const value = Number(prev)
            if (prev === "" || !Number.isFinite(value)) return ""
            return sanitize(toEntry(isGram ? value * rate : value / (rate || 1)))
        })
    }

    return (
        <Page mode="primary">
            <BackButton onClick={goBack} />
            <div className={styles.root} style={{ maxHeight: viewportHeight }}>
                <PanelHeader
                    pin="sticky"
                    left={<PanelHeader.BackIcon />}
                    onLeft={goBack}
                    right={<PanelHeader.MoreIcon />}
                >
                    Send Money to{" "}
                    <span className={styles.recipient}>{RECIPIENT}</span>
                </PanelHeader>

                <AmountField
                    amount={amount}
                    onAmountChange={(value, pasted) =>
                        setAmount(sanitize(value, pasted))
                    }
                    currency={currency}
                    counterAmount={
                        rate ? format(counter) : (unavailable ?? format(0))
                    }
                    onSwap={swap}
                    canSwap={Boolean(rate)}
                    pending={!rate && !error}
                    flying={flying}
                    onLand={() => setFlying(false)}
                />

                <div className={styles.footer}>
                    <div className={styles.balance}>
                        <Text
                            apple={{ variant: "footnote" }}
                            material={{ variant: "caption2" }}
                            skeleton={!settled}
                        >
                            Balance: {tonAmount ?? unavailable ?? "0.00"} Grams
                        </Text>
                    </div>
                    <RegularButton
                        variant={grams > 0 ? "filled" : "disabled"}
                        label={
                            grams > 0
                                ? `Send ${formatExact(grams)} Grams`
                                : "Send"
                        }
                        isFill
                    />
                </div>
            </div>
        </Page>
    )
}

export default Send
