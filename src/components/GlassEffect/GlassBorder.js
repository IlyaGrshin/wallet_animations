import * as styles from "./GlassBorder.module.scss"

const GlassBorder = ({ className = "" }) => {
    return (
        <div
            className={`${styles.glassBorder} ${className}`}
            aria-hidden="true"
        />
    )
}

export default GlassBorder
