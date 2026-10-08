import * as styles from "./FilledGlass.module.scss"

/**
 * iOS 27 light on a filled button: a burn shade under the top edge, additive
 * glare along the top and bottom, and a rim sharp outside and soft inside. It
 * lights the button's own fill, so there is no backdrop-filter. The host must
 * be positioned, isolated and clip its overflow.
 * @example
 * <m.div className={styles.filled}>
 *     <FilledGlass />
 *     {label}
 * </m.div>
 */
const FilledGlass = () => (
    <>
        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.glare} aria-hidden="true" />
        <div className={styles.rim} aria-hidden="true" />
    </>
)

export default FilledGlass
