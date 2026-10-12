import PropTypes from "prop-types"
import cx from "clsx"
import GramDiamond from "../GramDiamond"
import GramIcon from "../../icons/28/Gram.svg?react"
import * as styles from "./CardDiamond.module.scss"

const IOS_STONE = 32

export const cardDiamondStyle = (width) => {
    const unit = width / IOS_STONE
    return {
        widthPoints: width,
        dragGrow: 3,
        growAnchorX: -1,
        growDamping: 0.62,
        steadyStars: false,
        starBrightness: 1.6,
        floatAmplitude: 1.5 * unit,
        floatPeriod: 3.2,
    }
}

export default function CardDiamond({ className, lens, lensKey }) {
    return (
        <GramDiamond
            className={cx(styles.diamond, className)}
            style={cardDiamondStyle}
            interactive
            tinted
            lens={lens}
            lensKey={lensKey}
            fallback={<GramIcon className={styles.fallback} />}
        />
    )
}

CardDiamond.propTypes = {
    className: PropTypes.string,
    lens: PropTypes.func,
    lensKey: PropTypes.string,
}
