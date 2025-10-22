import PropTypes from "prop-types"
import * as styles from "./GlassBorder.module.scss"

const GlassBorder = ({ className = "" }) => {
    return (
        <div
            className={`${styles.glassBorder} ${className}`}
            aria-hidden="true"
        />
    )
}

GlassBorder.propTypes = {
    className: PropTypes.string,
}

export default GlassBorder
