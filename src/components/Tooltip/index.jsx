import PropTypes from "prop-types"
import { FloatingPortal } from "@floating-ui/react"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"

import { POPOVER_VARIANTS } from "../../utils/animations"
import TooltipBody from "./TooltipBody"
import { useTooltipFloating } from "./useTooltipFloating"
import { TAIL_HEIGHT_COMPACT, TAIL_HEIGHT_REGULAR } from "./tooltipPath"

import * as styles from "./Tooltip.module.scss"

/**
 * Hover/tap tooltip rendered in a portal with edge-aware placement and a
 * pointing tail. `children` is the trigger; opens on hover or tap, closes on
 * outside click / Esc.
 * @param {import("react").ReactNode} props.content Tooltip body (required).
 * @param {string} [props.badge]
 * @param {"regular"|"compact"} [props.type="regular"]
 * @param {"auto"|"top"|"bottom"|"left"|"right"} [props.placement="auto"]
 * @example
 * <Tooltip content="Copied to clipboard" placement="top">
 *   <InfoIcon />
 * </Tooltip>
 */
const Tooltip = ({
    content,
    badge,
    type = "regular",
    placement = "auto",
    children,
}) => {
    const compact = type === "compact"

    const {
        isOpen,
        isPositioned,
        setReference,
        setFloating,
        floatingStyles,
        shellStyle,
        getReferenceProps,
        getFloatingProps,
    } = useTooltipFloating({
        placement,
        protrusion: compact ? TAIL_HEIGHT_COMPACT : TAIL_HEIGHT_REGULAR,
    })

    return (
        <span className={styles.container}>
            <span
                ref={setReference}
                className={styles.trigger}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                {...getReferenceProps()}
            >
                {children}
            </span>
            <FloatingPortal>
                <AnimatePresence>
                    {isOpen && (
                        <div
                            key="tooltip"
                            ref={setFloating}
                            className={styles.positioner}
                            style={floatingStyles}
                            {...getFloatingProps()}
                        >
                            <m.div
                                className={styles.shell}
                                initial="hidden"
                                animate={isPositioned ? "visible" : "hidden"}
                                exit="exit"
                                variants={POPOVER_VARIANTS}
                                style={shellStyle}
                            >
                                <TooltipBody
                                    content={content}
                                    badge={badge}
                                    compact={compact}
                                />
                            </m.div>
                        </div>
                    )}
                </AnimatePresence>
            </FloatingPortal>
        </span>
    )
}

Tooltip.propTypes = {
    content: PropTypes.node.isRequired,
    badge: PropTypes.string,
    type: PropTypes.oneOf(["regular", "compact"]),
    placement: PropTypes.oneOf(["auto", "top", "bottom", "left", "right"]),
    children: PropTypes.node.isRequired,
}

export default Tooltip
