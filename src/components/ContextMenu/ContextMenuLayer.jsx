import { useLayoutEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { useReducedMotion } from "motion/react"
import cx from "clsx"

import { MenuPanel } from "../DropdownMenu"
import { itemShape } from "../DropdownMenu/MenuPanel"
import { POPOVER_VARIANTS, SPRING } from "../../utils/animations"
import { placeMenu } from "./placement"

import * as styles from "./ContextMenu.module.scss"

// The row is held at this scale while pressing (see the .pressing class), so
// the lifted copy starts there and springs back to full size.
export const PRESSED_SCALE = 0.97

const FADE = { duration: 0.2, ease: "easeOut" }
const INSTANT = { duration: 0 }
const REDUCED_VARIANTS = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: FADE },
    exit: { opacity: 0, transition: FADE },
}

const inset = (radius) => `inset(0px round ${radius}px)`

// Portal layer: a dim overlay, the row lifted above it with rounded corners,
// and the menu in the space left over.
const ContextMenuLayer = ({
    rect,
    point,
    radius,
    items,
    onSelect,
    onClose,
    children,
}) => {
    const reduceMotion = useReducedMotion()
    const menuRef = useRef(null)
    const [place, setPlace] = useState(null)

    // offsetWidth/Height ignore the menu's entry scale, so this measures the
    // final size before the first paint.
    useLayoutEffect(() => {
        const el = menuRef.current
        if (!el) return
        const size = { width: el.offsetWidth, height: el.offsetHeight }
        setPlace(placeMenu(rect, size, point.x))
    }, [rect, point])

    const lift = reduceMotion ? INSTANT : SPRING.APPLE
    const fade = reduceMotion ? INSTANT : FADE

    return (
        <>
            <m.div
                className={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: fade }}
                exit={{ opacity: 0, transition: fade }}
                onClick={onClose}
            />
            <m.div
                aria-hidden
                className={styles.lifted}
                style={{
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                }}
                initial={{
                    y: 0,
                    scale: reduceMotion ? 1 : PRESSED_SCALE,
                    clipPath: inset(0),
                }}
                animate={{
                    y: place?.shift ?? 0,
                    scale: 1,
                    clipPath: inset(radius),
                    transition: lift,
                }}
                exit={{ y: 0, scale: 1, clipPath: inset(0), transition: lift }}
            >
                {children}
            </m.div>
            <MenuPanel
                ref={menuRef}
                items={items}
                onSelect={onSelect}
                className={cx(styles.menu, !place && styles.measuring)}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={reduceMotion ? REDUCED_VARIANTS : POPOVER_VARIANTS}
                style={{
                    top: place?.top ?? 0,
                    left: place?.left ?? 0,
                    transformOrigin: place
                        ? `${place.originX} ${place.originY}`
                        : undefined,
                }}
            />
        </>
    )
}

ContextMenuLayer.propTypes = {
    rect: PropTypes.shape({
        top: PropTypes.number,
        left: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
    }).isRequired,
    point: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number })
        .isRequired,
    radius: PropTypes.number.isRequired,
    items: PropTypes.arrayOf(itemShape).isRequired,
    onSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node,
}

export default ContextMenuLayer
