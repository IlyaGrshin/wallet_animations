import { useRef } from "react"
import PropTypes from "prop-types"
import * as styles from "./WalletCard.module.scss"
import FitText from "../FitText"
import useDeviceTilt from "./useDeviceTilt"
import QrIcon from "./assets/qr.svg?react"
import UsdtIcon from "./assets/usdt.svg?react"
import GramIcon from "./assets/gram.svg?react"

const DEFAULT_ADDRESS = "UQAl1dViv82p5sllNyPXJenPJqRfaHrVGkhmhFcrIjYinqYK"

function formatAddress(raw) {
    const clean = raw.replace(/\s+/g, "")
    const groups = clean.match(/.{1,4}/g) || []
    const half = Math.ceil(groups.length / 2)
    return [
        groups.slice(0, half).join(" "),
        groups.slice(half).join(" "),
    ]
}

function WalletCard({
    name = "Alicia Torreaux",
    address = DEFAULT_ADDRESS,
    usdtAmount = "0",
    gramAmount = "0",
    balance = "$3,450.04",
    onQrClick,
}) {
    const [line1, line2] = formatAddress(address)
    const shineRef = useRef(null)
    useDeviceTilt(shineRef)

    return (
        <div className={styles.root}>
            <div
                ref={shineRef}
                className={styles.shine}
                aria-hidden="true"
            />

            <div className={styles.money}>
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

            <p className={styles.name}>{name}</p>

            <div className={styles.addressOuter} aria-hidden="true">
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
                type="button"
                className={styles.qrButton}
                onClick={onQrClick}
                aria-label="Show QR code"
            >
                <QrIcon className={styles.qrIcon} />
            </button>

            <p className={styles.balanceLabel}>Balance</p>
            <p className={styles.balanceValue}>{balance}</p>

            <div className={styles.innerShadow} aria-hidden="true" />
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
}

export default WalletCard
