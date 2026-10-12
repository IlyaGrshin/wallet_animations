import { useRef } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { useTransform } from "motion/react"
import cx from "clsx"

import GramDiamond from "../../../components/GramDiamond"
import { cardDiamondStyle } from "../../../components/WalletCard/CardDiamond"
import GramIcon from "../../../icons/28/Gram.svg?react"

import * as styles from "./GramWallet.module.scss"

const WIPE = /inset\(0(?:px)? 0(?:px)? ([\d.]+)(px|%) 0(?:px)?\)/
const OPEN = "-100vh -100vw"

function parseWipe(wipe) {
    const match = WIPE.exec(wipe)
    if (!match) return { hidden: false, cut: 0 }
    return { hidden: match[2] === "%", cut: Number(match[1]) }
}

function cardClip(wipe, height) {
    const { hidden, cut } = parseWipe(wipe)
    if (hidden || cut >= height - 0.5) return "inset(0 0 100% 0)"
    return `inset(${OPEN} ${cut > 0 ? `${cut}px` : "-100vh"} -100vw)`
}

function barClip(wipe) {
    const { hidden, cut } = parseWipe(wipe)
    if (hidden) return "inset(0)"
    return `inset(calc(100% - ${cut}px) 0 0 0)`
}

const LineGems = ({ scale, wipe, lens, lensKey }) => {
    const cardLayerRef = useRef(null)
    const cardGemClip = useTransform(wipe, (value) =>
        cardClip(value, cardLayerRef.current?.offsetHeight ?? Infinity)
    )
    const barGemClip = useTransform(wipe, barClip)

    return (
        <>
            <m.span
                aria-hidden="true"
                className={styles.gemLayer}
                style={{ clipPath: barGemClip }}
            >
                <m.span
                    className={cx(styles.gemSlot, styles.barGem)}
                    style={{ scale }}
                >
                    <GramIcon />
                </m.span>
            </m.span>
            <m.span
                ref={cardLayerRef}
                className={styles.gemLayer}
                style={{ clipPath: cardGemClip }}
            >
                <m.span className={styles.gemSlot} style={{ scale }}>
                    <GramDiamond
                        className={styles.lineDiamond}
                        style={cardDiamondStyle}
                        interactive
                        tinted
                        lens={lens}
                        lensKey={lensKey}
                        fallback={
                            <GramIcon className={styles.lineDiamondFallback} />
                        }
                    />
                </m.span>
            </m.span>
        </>
    )
}

LineGems.propTypes = {
    scale: PropTypes.object.isRequired,
    wipe: PropTypes.object.isRequired,
    lens: PropTypes.func.isRequired,
    lensKey: PropTypes.string,
}

export default LineGems
