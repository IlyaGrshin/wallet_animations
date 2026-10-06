import PropTypes from "prop-types"
import Tappable from "../Tappable"
import QrIcon from "./assets/qr.svg?react"
import * as styles from "./QrChip.module.scss"

export default function QrChip({ ref, onClick }) {
    return (
        <div ref={ref} className={styles.root}>
            <Tappable
                as="button"
                type="button"
                mode="opacity"
                className={styles.button}
                onClick={onClick}
                aria-label="Show QR code"
            >
                <QrIcon className={styles.icon} />
            </Tappable>
        </div>
    )
}

QrChip.propTypes = {
    ref: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    onClick: PropTypes.func,
}
