import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { useTransform } from "motion/react"
import { Calligraph } from "calligraph"
import cx from "clsx"

import Text from "../../../components/Text"
import { useSkin } from "../../../hooks/DeviceProvider"
import GramIcon from "../../../icons/28/Gram.svg?react"

import * as styles from "./GramWallet.module.scss"

// On the card the gem is 28px against 22px digits; in the bar both are one em,
// so the gem carries the difference as its own scale while it is down there.
const CARD_GEM_SCALE = 28 / 22

// The parked lines pivot in the card's plane: the pivot is the card centre in
// line-local coordinates, measured by the flight, and the perspective matches
// the card scene's.
const tiltStyle = (tilt, origin) =>
    tilt
        ? {
              "--line-tilt-origin": `${origin.x}px ${origin.y}px`,
              "--line-tilt-perspective": `${tilt.perspective}px`,
          }
        : undefined

const HeaderBalances = ({ gramAmount, balance, flight, gramRef, fiatRef }) => {
    const { isApple } = useSkin()
    const { progress, gather, ready } = flight

    // The resting bar shows a plain Wallet title; it slips away as soon as the
    // card starts moving, well before the balances arrive.
    const titleOpacity = useTransform(progress, [0, 0.35], [1, 0])
    const gemScale = useTransform(
        gather,
        (v) => 1 + (CARD_GEM_SCALE - 1) * (1 - v)
    )
    const unitOpacity = useTransform(gather, [0, 0.5], [1, 0])
    // The title stays semibold; only the subtitle relaxes to the bar's regular
    // along the variable weight axis.
    const cardWeight = isApple ? 600 : 500
    const fiatWeight = useTransform(
        gather,
        (v) => cardWeight - (cardWeight - 400) * v
    )

    return (
        <div className={styles.headerBalances}>
            <Text
                as={m.span}
                className={styles.walletTitle}
                style={{ opacity: titleOpacity }}
                apple={{ variant: "body", weight: "semibold" }}
                material={{ variant: "title2" }}
            >
                Wallet
            </Text>
            <div className={styles.balancesStack}>
                <Text
                    as={m.div}
                    ref={gramRef}
                    className={styles.gramLine}
                    style={{
                        x: flight.gram.x,
                        y: flight.gram.y,
                        scale: flight.gram.scale,
                        opacity: ready,
                    }}
                    apple={{ variant: "body" }}
                    material={{ variant: "body" }}
                >
                    <span
                        className={styles.lineTilt}
                        style={tiltStyle(flight.tilt, flight.tilt?.gram)}
                    >
                        <span className={cx(styles.lineLayer, styles.barLook)}>
                            <m.span
                                className={styles.gem}
                                style={{ scale: gemScale }}
                            >
                                <GramIcon />
                            </m.span>
                            <Calligraph variant="number" animation="smooth">
                                {gramAmount}
                            </Calligraph>
                        </span>
                        <m.span
                            aria-hidden="true"
                            className={cx(styles.lineLayer, styles.cardLook)}
                            style={{ clipPath: flight.gram.wipe }}
                        >
                            <m.span
                                className={styles.gem}
                                style={{ scale: gemScale }}
                            >
                                <GramIcon />
                            </m.span>
                            <Calligraph variant="number" animation="smooth">
                                {gramAmount}
                            </Calligraph>
                            <m.span
                                className={styles.gramUnit}
                                style={{ opacity: unitOpacity }}
                            >
                                GRAM
                            </m.span>
                        </m.span>
                    </span>
                </Text>
                <Text
                    as={m.div}
                    ref={fiatRef}
                    className={styles.fiatLine}
                    style={{
                        x: flight.fiat.x,
                        y: flight.fiat.y,
                        scale: flight.fiat.scale,
                        fontWeight: fiatWeight,
                        opacity: ready,
                    }}
                    apple={{ variant: "footnote" }}
                    material={{ variant: "subheadline2" }}
                >
                    <span
                        className={styles.lineTilt}
                        style={tiltStyle(flight.tilt, flight.tilt?.fiat)}
                    >
                        <span className={cx(styles.lineLayer, styles.barLook)}>
                            <Calligraph variant="number" animation="smooth">
                                {balance}
                            </Calligraph>
                        </span>
                        <m.span
                            aria-hidden="true"
                            className={cx(styles.lineLayer, styles.cardLook)}
                            style={{ clipPath: flight.fiat.wipe }}
                        >
                            <Calligraph variant="number" animation="smooth">
                                {balance}
                            </Calligraph>
                        </m.span>
                    </span>
                </Text>
            </div>
        </div>
    )
}

HeaderBalances.propTypes = {
    gramAmount: PropTypes.string,
    balance: PropTypes.string,
    flight: PropTypes.object.isRequired,
    gramRef: PropTypes.func,
    fiatRef: PropTypes.func,
}

export default HeaderBalances
