import PropTypes from "prop-types"
import * as styles from "./Coin.module.scss"

const SIZE_PX = {
    sm: 64,
    md: 120,
    lg: 180,
}

function Coin({ ticker, image, size = "md" }) {
    const px = SIZE_PX[size]
    return (
        <div
            className={`${styles.root} ${styles[size]}`}
            style={{ width: px, height: px }}
        >
            <img
                src={image}
                alt={ticker}
                width={px}
                height={px}
                draggable={false}
                className={styles.img}
            />
        </div>
    )
}

Coin.propTypes = {
    ticker: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    size: PropTypes.oneOf(["sm", "md", "lg"]),
}

export default Coin
