import { useLayoutEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import * as styles from "./WalletCard.module.scss"
import FitText from "../FitText"
import StarField from "./StarField"
import TitaniumTexture from "../TitaniumTexture"
import useDeviceTilt from "./useDeviceTilt"
import QrIcon from "./assets/qr.svg?react"
import UsdtIcon from "./assets/usdt.svg?react"
import GramIcon from "./assets/gram.svg?react"

const DEFAULT_ADDRESS = "UQAl1dViv82p5sllNyPXJenPJqRfaHrVGkhmhFcrIjYinqYK"
const VIEWBOX_W = 336
const VIEWBOX_H = 205
const ZONE_PADDING = 8

function formatAddress(raw) {
    const clean = raw.replace(/\s+/g, "")
    const groups = clean.match(/.{1,4}/g) || []
    const half = Math.ceil(groups.length / 2)
    return [
        groups.slice(0, half).join(" "),
        groups.slice(half).join(" "),
    ]
}

function unionRect(a, b) {
    return {
        left: Math.min(a.left, b.left),
        top: Math.min(a.top, b.top),
        right: Math.max(a.right, b.right),
        bottom: Math.max(a.bottom, b.bottom),
    }
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
    usdtAmount = "0",
    gramAmount = "0",
    balance = "$3,450.04",
    onQrClick,
    debugSafeZones = false,
}) {
    const [line1, line2] = formatAddress(address)
    const rootRef = useRef(null)
    const moneyRef = useRef(null)
    const nameRef = useRef(null)
    const addressRef = useRef(null)
    const qrRef = useRef(null)
    const balanceLabelRef = useRef(null)
    const balanceValueRef = useRef(null)
    const [safeZones, setSafeZones] = useState([])

    useDeviceTilt(rootRef)

    useLayoutEffect(() => {
        const root = rootRef.current
        if (!root) return undefined

        const measure = () => {
            const rb = root.getBoundingClientRect()
            if (rb.width === 0 || rb.height === 0) return
            const sx = VIEWBOX_W / rb.width
            const sy = VIEWBOX_H / rb.height

            const zones = []
            for (const ref of [moneyRef, nameRef, addressRef, qrRef]) {
                const el = ref.current
                if (el) zones.push(rectToZone(el.getBoundingClientRect(), rb, sx, sy))
            }

            const lbl = balanceLabelRef.current?.getBoundingClientRect()
            const val = balanceValueRef.current?.getBoundingClientRect()
            if (lbl && val) {
                zones.push(rectToZone(unionRect(lbl, val), rb, sx, sy))
            }

            setSafeZones(zones)
        }

        measure()
        const ro = new ResizeObserver(measure)
        ro.observe(root)
        return () => ro.disconnect()
    }, [name, address, usdtAmount, gramAmount, balance])

    return (
        <div ref={rootRef} className={styles.root}>
            <div className={styles.shine} aria-hidden="true" />

            <div className={styles.blur} aria-hidden="true" />

            <TitaniumTexture brushed={0.35} amount={1} />

            <div className={styles.stars} aria-hidden="true">
                <StarField safeZones={safeZones} />
            </div>

            <div ref={moneyRef} className={styles.money}>
                <div className={styles.amount}>
                    <UsdtIcon className={styles.coinIcon} />
                    <span className={styles.amountValue}>{usdtAmount}</span>
                    <span className={styles.amountUnit}>USDT</span>
                </div>
                <div className={styles.amount}>
                    <GramIcon className={styles.coinIcon} />
                    <span className={styles.amountValue}>{gramAmount}</span>
                    <span className={styles.amountUnit}>GRAM</span>
                </div>
            </div>

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
                    >
                        <span className={styles.addressLine}>{line1}</span>
                        <span className={styles.addressLine}>{line2}</span>
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

            <p ref={balanceLabelRef} className={styles.balanceLabel}>
                Balance
            </p>
            <p ref={balanceValueRef} className={styles.balanceValue}>
                {balance}
            </p>

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
    )
}

WalletCard.propTypes = {
    name: PropTypes.string,
    address: PropTypes.string,
    usdtAmount: PropTypes.string,
    gramAmount: PropTypes.string,
    balance: PropTypes.string,
    onQrClick: PropTypes.func,
    debugSafeZones: PropTypes.bool,
}

export default WalletCard
