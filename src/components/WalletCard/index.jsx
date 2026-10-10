import { useLayoutEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import { useSmoothCorners } from "@lisse/react"
import { CORNER_RADIUS, CORNER_SMOOTHING } from "./corners"
import { useResizeObserver } from "../../hooks/useResizeObserver"
import * as styles from "./WalletCard.module.scss"
import StarField from "./StarField"
import CardBalance from "./CardBalance"
import CardIdentity from "./CardIdentity"
import QrChip from "./QrChip"
import useDeviceTilt from "./useDeviceTilt"

const DEFAULT_ADDRESS = "UQAl1dViv82p5sllNyPXJenPJqRfaHrVGkhmhFcrIjYinqYK"
const VIEWBOX_W = 361
const VIEWBOX_H = 220
const ZONE_PADDING = 8

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
    const sceneRef = useRef(null)
    const rootRef = useRef(null)
    const moneyRef = useRef(null)
    const nameRef = useRef(null)
    const addressRef = useRef(null)
    const qrRef = useRef(null)
    const fiatRef = useRef(null)
    const [safeZones, setSafeZones] = useState([])

    useDeviceTilt(tilt ? sceneRef : null)

    const measure = () => {
        const root = rootRef.current
        if (!root) return
        const rb = root.getBoundingClientRect()
        if (rb.width === 0 || rb.height === 0) return
        const sx = VIEWBOX_W / rb.width
        const sy = VIEWBOX_H / rb.height

        const zones = []
        for (const ref of [moneyRef, fiatRef, nameRef, addressRef, qrRef]) {
            const el = ref.current
            if (el)
                zones.push(rectToZone(el.getBoundingClientRect(), rb, sx, sy))
        }

        setSafeZones(zones)
    }

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

                    <StarField safeZones={safeZones} />

                    <div className={styles.fresnel} aria-hidden="true" />

                    <CardBalance
                        gramAmount={gramAmount}
                        balance={balance}
                        valuesHidden={valuesHidden}
                        moneyRef={moneyRef}
                        fiatRef={fiatRef}
                        amountRef={amountRef}
                        balanceRef={balanceRef}
                    />

                    <CardIdentity
                        name={name}
                        address={address}
                        nameRef={nameRef}
                        addressRef={addressRef}
                    />

                    <QrChip ref={qrRef} onClick={onQrClick} />

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
