import { useContext, useRef } from "react"
import PropTypes from "prop-types"
import { useSmoothCorners } from "@lisse/react"
import cx from "clsx"
import * as styles from "./SectionList.module.scss"
import SectionHeader from "../../components/SectionHeader"
import { SectionListContext } from "./context"
import { useSkin } from "../../hooks/DeviceProvider"

// Radii mirror SectionList.module.scss: Apple rounds the inner .container
// (26px, header sits above it); Material rounds the whole .card (16px).
const APPLE_RADIUS = 26
const MATERIAL_RADIUS = 16
const SMOOTHING = 0.6 // Figma iOS squircle smoothing

/**
 * Grouped list container. Wrap rows in `SectionList.Item`, which adds an
 * optional header and a footer description.
 * @param {"insetGrouped"|"grouped"} [props.type="insetGrouped"] Inset cards with
 * squircled corners, or full-bleed sections that reach the screen edges.
 * @example
 * <SectionList>
 *   <SectionList.Item header="General" description="Applies to all wallets">
 *     <Cell><Cell.Text title="Currency" /></Cell>
 *   </SectionList.Item>
 * </SectionList>
 */
const SectionList = ({ children, type = "insetGrouped", ...props }) => {
    return (
        <SectionListContext.Provider value={type}>
            <section className={cx(styles.root, styles[type])} {...props}>
                {children}
            </section>
        </SectionListContext.Provider>
    )
}

const SectionListItem = ({ children, header, description, ...props }) => {
    const { isApple } = useSkin()
    const grouped = useContext(SectionListContext) === "grouped"
    const cardRef = useRef(null)
    const containerRef = useRef(null)
    const squareRef = useRef(null)

    // Squircle the element that carries the section background. The hook is
    // keyed on the ref, so a skin switch restores the old element's clip-path
    // and re-applies to the new target. clip-path only, no SVG effects.
    useSmoothCorners(
        grouped ? squareRef : isApple ? containerRef : cardRef,
        {
            radius: isApple ? APPLE_RADIUS : MATERIAL_RADIUS,
            smoothing: SMOOTHING,
        },
        { autoEffects: false }
    )

    return (
        <section
            {...(header && { "data-header": "" })}
            {...(description && { "data-footer": "" })}
            {...props}
        >
            <div ref={cardRef} className={styles.card}>
                {header && <SectionHeader title={header} />}
                <div ref={containerRef} className={styles.container}>
                    {children}
                </div>
            </div>
            {description && <SectionHeader type="Footer" title={description} />}
        </section>
    )
}

SectionListItem.propTypes = {
    children: PropTypes.node,
    header: PropTypes.string,
    description: PropTypes.string,
}

SectionList.Item = SectionListItem

SectionList.propTypes = {
    children: PropTypes.node,
    type: PropTypes.oneOf(["insetGrouped", "grouped"]),
}
export default SectionList
