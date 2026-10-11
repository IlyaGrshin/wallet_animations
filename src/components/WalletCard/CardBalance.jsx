import { useRef } from "react"
import PropTypes from "prop-types"
import { Calligraph } from "calligraph"
import cx from "clsx"
import CardDiamond from "./CardDiamond"
import paintTextLens from "../GramDiamond/paintTextLens"
import GramIcon from "../../icons/28/Gram.svg?react"
import * as styles from "./CardBalance.module.scss"

function splitAmount(raw) {
    const str = String(raw)
    const idx = str.lastIndexOf(".")
    if (idx === -1) return [str, ""]
    return [str.slice(0, idx), str.slice(idx)]
}

export default function CardBalance({
    gramAmount,
    balance,
    valuesHidden,
    moneyRef,
    fiatRef,
    amountRef,
    balanceRef,
}) {
    const [gramWhole, gramFraction] = splitAmount(gramAmount)
    const wholeRef = useRef(null)
    const fractionRef = useRef(null)

    const paintLens = (canvas) =>
        paintTextLens(canvas, [
            [wholeRef.current, gramWhole],
            [fractionRef.current, gramFraction],
            [fiatRef.current, balance],
        ])

    return (
        <>
            <div ref={moneyRef} className={styles.money}>
                <div
                    ref={amountRef}
                    className={cx(
                        styles.amount,
                        valuesHidden && styles.hiddenValue
                    )}
                >
                    {valuesHidden ? (
                        <GramIcon className={styles.coinIcon} />
                    ) : (
                        <CardDiamond
                            className={styles.coinIcon}
                            lens={paintLens}
                            lensKey={`${gramAmount} ${balance}`}
                        />
                    )}
                    <span ref={wholeRef} className={styles.amountValue}>
                        <Calligraph variant="number" animation="smooth">
                            {gramWhole}
                        </Calligraph>
                        {gramFraction && (
                            <span
                                ref={fractionRef}
                                className={styles.amountFraction}
                            >
                                <Calligraph variant="number" animation="smooth">
                                    {gramFraction}
                                </Calligraph>
                            </span>
                        )}
                    </span>
                    <span className={styles.amountUnit}>GRAM</span>
                </div>
            </div>

            <p
                ref={(node) => {
                    fiatRef.current = node
                    balanceRef?.(node)
                }}
                className={cx(styles.fiat, valuesHidden && styles.hiddenValue)}
            >
                <Calligraph variant="number" animation="smooth">
                    {balance}
                </Calligraph>
            </p>
        </>
    )
}

const refShape = PropTypes.oneOfType([PropTypes.func, PropTypes.object])

CardBalance.propTypes = {
    gramAmount: PropTypes.string.isRequired,
    balance: PropTypes.string.isRequired,
    valuesHidden: PropTypes.bool.isRequired,
    moneyRef: refShape.isRequired,
    fiatRef: PropTypes.object.isRequired,
    amountRef: PropTypes.func,
    balanceRef: PropTypes.func,
}
