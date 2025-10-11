import * as styles from "./GlassContainer.module.scss"
import GlassBorder from "./GlassBorder"

const GlassContainer = ({ children, className = "", style = {}, ...rest }) => {
    // If no children, render as overlay only
    if (!children) {
        return (
            <>
                <div className={styles.glassBackground} aria-hidden="true" />
                <div className={styles.glassShadow} aria-hidden="true" />
                <GlassBorder />
            </>
        )
    }

    // With children, render as wrapper
    return (
        <div className={`${styles.root} ${className}`} style={style} {...rest}>
            <div className={styles.glassBackground} aria-hidden="true" />
            <div className={styles.glassShadow} aria-hidden="true" />
            <GlassBorder />
            {children}
        </div>
    )
}

export default GlassContainer
