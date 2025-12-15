import { useState, useEffect } from "react"
import NumberFlow, { continuous } from "@number-flow/react"
import { Spoiler } from "spoiled"

import Train from "../../../../../components/Train"
import Text from "../../../../../components/Text"
import { generateRandomBalance } from "../../../../../utils/number"
import { DURATION, COMPLEX_EASING } from "../../../../../utils/animations"

import * as styles from "./BalanceCard.module.scss"

/**
 * BalanceCard - универсальный компонент для отображения баланса
 * 
 * @param {string} label - Текст лейбла (например, "Balance" или "TON Wallet Balance")
 * @param {string} initialBalance - Начальное значение баланса
 * @param {"default" | "overlay"} variant - Визуальный вариант: default (светлый фон) или overlay (для тёмного фона)
 * @param {React.ReactNode} actions - Кнопки действий (опционально)
 * @param {string} className - Дополнительные CSS классы
 */
export default function BalanceCard({
    label,
    initialBalance = "0.00",
    variant = "default",
    actions,
    className,
}) {
    const [balance, setBalance] = useState(initialBalance)
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

    const variantClass = variant === "overlay" ? styles.cardOverlay : styles.cardDefault

    return (
        <div
            className={[
                styles.card,
                variantClass,
                className
            ].filter(Boolean).join(" ")}
        >
            <div className={styles.data}>
                <Text
                    apple={{
                        variant: "subheadline2",
                        weight: "semibold",
                    }}
                    material={{
                        variant: "body1",
                        weight: "regular",
                    }}
                    className={styles.label}
                >
                    {label}
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
                        style={{ color: "inherit" }}
                        spinTiming={{
                            duration: DURATION.BALANCE_ANIMATION,
                            easing: COMPLEX_EASING,
                        }}
                        opacityTiming={{
                            duration: DURATION.OPACITY,
                        }}
                    />
                </Spoiler>
                <Train divider="space">
                    <Text
                        apple={{ variant: "subheadline2", weight: "semibold" }}
                        style={{ color: "var(--text-confirm-color)" }}
                    >
                        +0.82
                    </Text>
                    <Text.Badge
                        apple={{
                            variant: "subheadline2",
                            weight: "semibold",
                            arrow: { direction: "up" },
                        }}
                        variant="tinted"
                        circled
                        style={{
                            color: "var(--text-confirm-color)",
                        }}
                    >
                        0.11%
                    </Text.Badge>
                    <Text
                        apple={{ variant: "subheadline2", weight: "semibold" }}
                        style={{ color: "var(--tg-theme-subtitle-text-color)" }}
                    >
                        Today
                    </Text>
                </Train>
            </div>
            {actions && <div className={styles.actions}>{actions}</div>}
        </div>
    )
}
