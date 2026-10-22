import { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { Calligraph } from "calligraph"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"
import cx from "clsx"

import Train from "../../../../../components/Train"
import Text from "../../../../../components/Text"
import HiddenBalance, {
    useBalanceHidden,
} from "../../../../../components/HiddenBalance"
import {
    formatBalance,
    generateRandomBalance,
} from "../../../../../utils/number"

import * as styles from "./BalanceCard.module.scss"

const CHANGE_DATA = {
    today: {
        value: "+0.82",
        percent: "0.11%",
        label: "Today",
        arrowDirection: "up",
    },
    allTime: {
        value: "+124.56",
        percent: "12.34%",
        label: "All Time",
        arrowDirection: "up",
    },
}

const crossFadeTransition = {
    duration: 0.1,
    ease: [0.32, 0, 0.67, 0],
}

/**
 * BalanceCard - универсальный компонент для отображения баланса
 *
 * @param {string} label - Текст лейбла (например, "Balance" или "TON Wallet Balance")
 * @param {string} initialBalance - Начальное значение баланса
 * @param {"default" | "overlay"} variant - Визуальный вариант: default (светлый фон) или overlay (для тёмного фона)
 * @param {React.ReactNode} actions - Кнопки действий (опционально)
 * @param {string} className - Дополнительные CSS классы
 *
 * Суммы скрываются тапом через HiddenBalance; внутри HiddenBalance.Provider
 * страницы карточка скрывается вместе со всеми балансами страницы.
 */
export default function BalanceCard(props) {
    return (
        <HiddenBalance.Provider>
            <BalanceCardContent {...props} />
        </HiddenBalance.Provider>
    )
}

function BalanceCardContent({
    label,
    initialBalance = "0.00",
    variant = "default",
    actions,
    className,
}) {
    const [balance, setBalance] = useState(initialBalance)
    const { hidden } = useBalanceHidden()
    const [isToday, setIsToday] = useState(true)

    const changeData = isToday ? CHANGE_DATA.today : CHANGE_DATA.allTime

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

    const formattedBalance = formatBalance(balance)

    const variantClass =
        variant === "overlay" ? styles.cardOverlay : styles.cardDefault

    return (
        <div className={cx(styles.card, variantClass, className)}>
            <div className={styles.data}>
                <Text
                    variant="subheadline2"
                    apple={{ weight: "semibold" }}
                    material={{ weight: "medium" }}
                    className={styles.label}
                >
                    {label}
                </Text>
                <HiddenBalance
                    className={styles.amount}
                    style={{ "--balance-length": formattedBalance.length + 1 }}
                >
                    <span className={styles.prefix}>$</span>
                    <Calligraph variant="number" animation="smooth">
                        {formattedBalance}
                    </Calligraph>
                </HiddenBalance>
                <Train
                    divider="space"
                    onClick={() => setIsToday((prev) => !prev)}
                    style={{ cursor: "pointer" }}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <m.span
                            key={`value-${isToday}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={crossFadeTransition}
                        >
                            <HiddenBalance>
                                <Text
                                    as="span"
                                    variant="subheadline2"
                                    apple={{ weight: "semibold" }}
                                    material={{ weight: "medium" }}
                                    style={{
                                        color: "var(--text-confirm-color)",
                                    }}
                                >
                                    {changeData.value}
                                </Text>
                            </HiddenBalance>
                        </m.span>
                    </AnimatePresence>
                    <AnimatePresence mode="wait" initial={false}>
                        <m.span
                            key={`percent-${isToday}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={crossFadeTransition}
                        >
                            <Text.Badge
                                apple={{
                                    variant: "subheadline2",
                                    weight: "semibold",
                                }}
                                material={{
                                    variant: "subheadline2",
                                    weight: "medium",
                                }}
                                variant="tinted"
                                circled
                                style={{
                                    color: "var(--text-confirm-color)",
                                }}
                            >
                                <HiddenBalance>
                                    <Text
                                        as="span"
                                        apple={{
                                            variant: "subheadline2",
                                            weight: "semibold",
                                        }}
                                        material={{
                                            variant: "subheadline2",
                                            weight: "medium",
                                        }}
                                        arrow={{
                                            direction:
                                                changeData.arrowDirection,
                                        }}
                                    >
                                        {changeData.percent}
                                    </Text>
                                </HiddenBalance>
                            </Text.Badge>
                        </m.span>
                    </AnimatePresence>
                    <AnimatePresence mode="wait" initial={false}>
                        <m.span
                            key={`label-${isToday}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={crossFadeTransition}
                        >
                            <Text
                                variant="subheadline2"
                                apple={{ weight: "semibold" }}
                                material={{ weight: "medium" }}
                                style={{
                                    color: "var(--tg-theme-subtitle-text-color)",
                                }}
                            >
                                {changeData.label}
                            </Text>
                        </m.span>
                    </AnimatePresence>
                </Train>
            </div>
            {actions && <div className={styles.actions}>{actions}</div>}
        </div>
    )
}

BalanceCard.propTypes = BalanceCardContent.propTypes = {
    label: PropTypes.string.isRequired,
    initialBalance: PropTypes.string,
    variant: PropTypes.oneOf(["default", "overlay"]),
    actions: PropTypes.node,
    className: PropTypes.string,
}
