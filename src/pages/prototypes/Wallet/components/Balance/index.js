import { useState, useEffect } from "react"
import NumberFlow, { continuous } from "@number-flow/react"
import { Spoiler } from "spoiled"

import * as styles from "./Balance.module.scss"
import Text from "../../../../../components/Text"
import { generateRandomBalance } from "../../../../../utils/number"
import { DURATION, COMPLEX_EASING } from "../../../../../utils/animations"

export default function Balance() {
    const [balance, setBalance] = useState("30.06")
    const [hidden, setHidden] = useState(false)

    useEffect(() => {
        const updateBalance = () => {
            if (!hidden) {
                const randomBalance = generateRandomBalance()
                setBalance(randomBalance)
            }
        }

        const interval = setInterval(updateBalance, 1000)

        return () => clearInterval(interval)
    }, [hidden])

    return (
        <div className={styles.balance}>
            <Text
                apple={{
                    variant: "body",
                    weight: "regular",
                }}
                material={{
                    variant: "body1",
                    weight: "regular",
                }}
                className={styles.label}
            >
                Total Balance
            </Text>
            <Spoiler
                className={styles.amount}
                hidden={hidden}
                onClick={() => setHidden((s) => !s)}
            >
                <NumberFlow
                    value={balance}
                    prefix="$"
                    willChange
                    plugins={[continuous]}
                    spinTiming={{
                        duration: DURATION.BALANCE_ANIMATION,
                        easing: COMPLEX_EASING,
                    }}
                    opacityTiming={{
                        duration: DURATION.OPACITY,
                    }}
                />
            </Spoiler>
        </div>
    )
}
