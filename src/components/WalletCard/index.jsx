import { useCallback, useLayoutEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import { useSmoothCorners } from "@lisse/react"
import { CORNER_RADIUS, CORNER_SMOOTHING } from "./corners"
import { Calligraph } from "calligraph"
import cx from "clsx"
import { useResizeObserver } from "../../hooks/useResizeObserver"
import { formatAddress } from "../../utils/address"
import * as styles from "./WalletCard.module.scss"
import FitText from "../FitText"
import StarField from "./StarField"
import useDeviceTilt from "./useDeviceTilt"
import QrIcon from "./assets/qr.svg?react"
import GramIcon from "../../icons/28/Gram.svg?react"

const DEFAULT_ADDRESS = "UQAl1dViv82p5sllNyPXJenPJqRfaHrVGkhmhFcrIjYinqYK"
const VIEWBOX_W = 361
const VIEWBOX_H = 220
const ZONE_PADDING = 8

function splitAmount(raw) {
    const str = String(raw)
    const idx = str.lastIndexOf(".")
    if (idx === -1) return [str, ""]
    return [str.slice(0, idx), str.slice(idx)]
}

function rectToZone(r, root, sx, sy) {
    return [
        (r.left - root.left) * sx - ZONE_PADDING,
        (r.top - root.top) * sy - ZONE_PADDING,
        (r.right - root.left) * sx + ZONE_PADDING,
        (r.bottom - root.top) * sy + ZONE_PADDING,
    ]
}

function WalletCard({
    name = "Alicia Torreaux",
    address = DEFAULT_ADDRESS,
    gramAmount = "0",
    balance = "$3,450.04",
    amountRef,
    balanceRef,
    valuesHidden = false,
    tilt = true,
    onQrClick,
    debugSafeZones = false,
}) {
    const [line1, line2] = formatAddress(address)
    const [gramWhole, gramFraction] = splitAmount(gramAmount)
    const sceneRef = useRef(null)
    const rootRef = useRef(null)
    const moneyRef = useRef(null)
    const nameRef = useRef(null)
    const addressRef = useRef(null)
    const qrRef = useRef(null)
    const fiatRef = useRef(null)
    const [safeZones, setSafeZones] = useState([])

    useDeviceTilt(tilt ? sceneRef : null)

    const measure = useCallback(() => {
        const root = rootRef.current
        if (!root) return
        const rb = root.getBoundingClientRect()
        if (rb.width === 0 || rb.height === 0) return
        const sx = VIEWBOX_W / rb.width
        const sy = VIEWBOX_H / rb.height

        const zones = []
        for (const ref of [moneyRef, fiatRef, nameRef, addressRef, qrRef]) {
            const el = ref.current
            if (el) zones.push(rectToZone(el.getBoundingClientRect(), rb, sx, sy))
        }

        setSafeZones(zones)
    }, [])

    useLayoutEffect(() => {
        measure()
    }, [measure, name, address, gramAmount, balance])

    useResizeObserver(rootRef, measure)

    useSmoothCorners(
        rootRef,
        { radius: CORNER_RADIUS, smoothing: CORNER_SMOOTHING },
        { autoEffects: false }
    )

    return (
        <div ref={sceneRef} className={styles.scene}>
            <div className={styles.body}>
                <div className={styles.edge} aria-hidden="true" />
                <div ref={rootRef} className={styles.root}>
                    <div className={styles.shine} aria-hidden="true" />

                    <div className={styles.blur} aria-hidden="true" />

                    <div className={styles.stars} aria-hidden="true">
                        <StarField safeZones={safeZones} />
                    </div>

                    <div className={styles.fresnel} aria-hidden="true" />

                    <div ref={moneyRef} className={styles.money}>
                        <div
                            ref={amountRef}
                            className={cx(
                                styles.amount,
                                valuesHidden && styles.hiddenValue
                            )}
                        >
                            <GramIcon className={styles.coinIcon} />
                            <span className={styles.amountValue}>
                                <Calligraph
                                    variant="number"
                                    animation="smooth"
                                >
                                    {gramWhole}
                                </Calligraph>
                                {gramFraction && (
                                    <span className={styles.amountFraction}>
                                        <Calligraph
                                            variant="number"
                                            animation="smooth"
                                        >
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
                        className={cx(
                            styles.fiat,
                            valuesHidden && styles.hiddenValue
                        )}
                    >
                        <Calligraph variant="number" animation="smooth">
                            {balance}
                        </Calligraph>
                    </p>

                    <p ref={nameRef} className={styles.name}>{name}</p>

                    <div
                        ref={addressRef}
                        className={styles.addressOuter}
                        aria-hidden="true"
                    >
                        <div className={styles.addressRotator}>
                            <FitText
                                innerClassName={styles.addressInner}
                                minScale={0.5}
                                maxScale={1.5}
                            >
                                <span className={styles.addressLine}>
                                    {line1}
                                </span>
                                <span className={styles.addressLine}>
                                    {line2}
                                </span>
                            </FitText>
                        </div>
                    </div>

                    <button
                        ref={qrRef}
                        type="button"
                        className={styles.qrButton}
                        onClick={onQrClick}
                        aria-label="Show QR code"
                    >
                        <QrIcon className={styles.qrIcon} />
                    </button>

                    <div className={styles.innerShadow} aria-hidden="true" />

                    {debugSafeZones && (
                        <svg
                            className={styles.zonesDebug}
                            viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            {safeZones.map(([x1, y1, x2, y2], i) => (
                                <rect
                                    key={i}
                                    x={x1}
                                    y={y1}
                                    width={x2 - x1}
                                    height={y2 - y1}
                                    fill="rgb(255 60 60 / 32%)"
                                    stroke="rgb(255 60 60 / 80%)"
                                    strokeWidth="0.5"
                                />
                            ))}
                        </svg>
                    )}
                </div>
            </div>
        </div>
    )
}

WalletCard.propTypes = {
    name: PropTypes.string,
    address: PropTypes.string,
    gramAmount: PropTypes.string,
    balance: PropTypes.string,
    amountRef: PropTypes.func,
    balanceRef: PropTypes.func,
    valuesHidden: PropTypes.bool,
    tilt: PropTypes.bool,
    onQrClick: PropTypes.func,
    debugSafeZones: PropTypes.bool,
}

export default WalletCard
