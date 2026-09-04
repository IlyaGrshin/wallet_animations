import { createContext, useContext } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { Calligraph } from "calligraph"
import cx from "clsx"

import Text from "../../../../../components/Text"
import Tappable from "../../../../../components/Tappable"
import GramIcon from "../../../../../icons/28/Gram.svg?react"
import SwapIcon from "../../../../../icons/18/Arrow Up Arrow Down.svg?react"

import { GRAM, USD, other, splitAmount } from "../../currency"
import * as styles from "./AmountField.module.scss"

const SWAP = { type: "spring", duration: 0.45, bounce: 0 }
const TYPING = {
    variant: "text",
    animation: "smooth",
    trend: 1,
    drift: { x: 0 },
}
const ROLLING = { variant: "number", animation: "smooth" }

const AmountContext = createContext({
    amount: "",
    counterAmount: "",
    flying: false,
})

const Glyphs = ({ settings, children }) => {
    const { flying } = useContext(AmountContext)
    if (flying) return <span>{children}</span>
    return <Calligraph {...settings}>{children}</Calligraph>
}

Glyphs.propTypes = {
    settings: PropTypes.object.isRequired,
    children: PropTypes.string.isRequired,
}

const Digits = ({ currency, active }) => {
    const { amount, counterAmount, flying } = useContext(AmountContext)
    const value = active ? amount : counterAmount
    const isGram = currency === GRAM
    const unit = active === isGram ? (isGram ? "GRAM" : "USD") : null

    return (
        <span
            className={cx(styles.value, active && value === "" && styles.blank)}
        >
            {!isGram && (
                <span className={styles.mark}>{active ? "$" : "~"}</span>
            )}
            {active ? (
                <Typed value={value} />
            ) : (
                <Glyphs settings={ROLLING}>{value}</Glyphs>
            )}
            {active && (
                <span
                    className={cx(styles.caret, flying && styles.caretHidden)}
                    aria-hidden="true"
                />
            )}
            {unit && <span className={styles.unit}>{unit}</span>}
        </span>
    )
}

Digits.propTypes = {
    currency: PropTypes.oneOf([GRAM, USD]).isRequired,
    active: PropTypes.bool,
}

const Typed = ({ value }) => {
    const { whole, fraction } = splitAmount(value)
    return (
        <span className={styles.number}>
            <Glyphs settings={TYPING}>{whole}</Glyphs>
            <span className={styles.fraction}>
                <Glyphs settings={TYPING}>{fraction}</Glyphs>
            </span>
        </span>
    )
}

Typed.propTypes = {
    value: PropTypes.string.isRequired,
}

const Money = ({ currency, active = false, onLand }) => (
    <m.span
        layoutId={`money-${currency}`}
        layout
        transition={SWAP}
        onLayoutAnimationComplete={onLand}
        className={cx(styles.money, active ? styles.primary : styles.secondary)}
    >
        {currency === GRAM && (
            <GramIcon className={styles.diamond} aria-hidden="true" />
        )}
        <Digits currency={currency} active={active} />
    </m.span>
)

Money.propTypes = {
    currency: PropTypes.oneOf([GRAM, USD]).isRequired,
    active: PropTypes.bool,
    onLand: PropTypes.func.isRequired,
}

const AmountField = ({
    amount,
    onAmountChange,
    currency,
    counterAmount,
    onSwap,
    canSwap,
    flying,
    onLand,
}) => {
    const next = other(currency)

    return (
        <AmountContext.Provider value={{ amount, counterAmount, flying }}>
            <div className={styles.root}>
                <Money
                    key={currency}
                    currency={currency}
                    active
                    onLand={onLand}
                />
                <Tappable
                    as="button"
                    type="button"
                    mode="opacity"
                    className={styles.pill}
                    disabled={!canSwap}
                    onClick={onSwap}
                    aria-label={`Switch to ${next === GRAM ? "Grams" : "USD"}`}
                >
                    <m.span
                        layout
                        layoutDependency={currency}
                        transition={SWAP}
                        className={styles.surface}
                        style={{ borderRadius: 100 }}
                        aria-hidden="true"
                    />
                    <Text
                        as="span"
                        className={styles.pillText}
                        apple={{ variant: "footnote", weight: "semibold" }}
                        material={{ variant: "caption2", weight: "medium" }}
                        skeleton={!canSwap}
                    >
                        <Money key={next} currency={next} onLand={onLand} />
                    </Text>
                    <m.span
                        layout
                        layoutDependency={currency}
                        transition={SWAP}
                        className={cx(styles.swap, flying && styles.shuttling)}
                        aria-hidden="true"
                    >
                        <SwapIcon />
                    </m.span>
                </Tappable>
                <input
                    className={styles.input}
                    name="amount"
                    value={amount}
                    onChange={(event) => onAmountChange(event.target.value)}
                    inputMode="decimal"
                    autoComplete="off"
                    enterKeyHint="done"
                    aria-label={
                        currency === GRAM ? "Amount in Grams" : "Amount in USD"
                    }
                    autoFocus
                />
            </div>
        </AmountContext.Provider>
    )
}

AmountField.propTypes = {
    amount: PropTypes.string.isRequired,
    onAmountChange: PropTypes.func.isRequired,
    currency: PropTypes.oneOf([GRAM, USD]).isRequired,
    counterAmount: PropTypes.string.isRequired,
    onSwap: PropTypes.func.isRequired,
    canSwap: PropTypes.bool,
    flying: PropTypes.bool,
    onLand: PropTypes.func.isRequired,
}

export default AmountField
