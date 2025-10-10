import { useEffect, useState } from "react"
import NumberFlow, { continuous } from "@number-flow/react"
import { Spoiler } from "spoiled"

import * as styles from "./Profile.module.scss"
import * as ButtonStyles from "../../../../../components/Button/MultilineButton/MultilineButton.module.scss"
import Text from "../../../../../components/Text"
import { MultilineButton } from "../../../../../components/Button"
import { generateRandomBalance } from "../../../../../utils/number"
import { DURATION, COMPLEX_EASING } from "../../../../../utils/animations"

import ArrowUpCircleFill from "../../../../../icons/28/Arrow Up Circle Fill.svg?react"
import ArrowLiftAndRightCircleFill28 from "../../../../../icons/28/Arrow Left & Right Circle Fill.svg?react"
import PlusCircleFill28 from "../../../../../icons/28/Plus Circle Fill.svg?react"

export default function Profile() {
    const [balance, setBalance] = useState("261.69")
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
        <div className={styles.profile}>
            <div className={styles.data}>
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
                    TON Wallet Balance
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
            <div className={styles.buttons}>
                <MultilineButton
                    variant="plain"
                    icon={<ArrowUpCircleFill />}
                    label="Send"
                    className={`${ButtonStyles.button} ${styles.overlayButton}`}
                />
                <MultilineButton
                    variant="plain"
                    icon={<PlusCircleFill28 />}
                    label="Deposit"
                    className={`${ButtonStyles.button} ${styles.overlayButton}`}
                />
                <MultilineButton
                    variant="plain"
                    icon={<ArrowLiftAndRightCircleFill28 />}
                    label="Swap"
                    className={`${ButtonStyles.button} ${styles.overlayButton}`}
                />
            </div>
        </div>
    )
}
