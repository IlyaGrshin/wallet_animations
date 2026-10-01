import { useLayoutEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { AnimatePresence, useReducedMotion } from "motion/react"
import cx from "clsx"

import MenuPanel, { itemShape } from "../DropdownMenu/MenuPanel"
import {
    DURATION,
    EASING,
    POPOVER_VARIANTS,
    SPRING,
} from "../../utils/animations"
import { DELAY, PRESS_DELAY } from "../../hooks/useLongPress"
import { placeMenu } from "./placement"

import * as styles from "./ContextMenu.module.scss"

// The element grows over the rest of the hold, so the lift feels continuous
// with the finger staying down.
const GROW = {
    duration: (DELAY - PRESS_DELAY) / 1000,
    ease: EASING.QUINT_OUT,
}
const FADE = { duration: DURATION.OPACITY / 1000, ease: "easeOut" }
const INSTANT = { duration: 0 }
const REDUCED_VARIANTS = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: FADE },
    exit: { opacity: 0, transition: FADE },
}

const inset = (radius) => `inset(0px round ${radius})`
// drop-shadow on the unclipped wrapper follows the clipped card's shape.
const shadow = (alpha) => `drop-shadow(0px 6px 20px rgb(0 0 0 / ${alpha}))`

// Portal layer: the row lifted out of the list (from the moment the hold is
// intentional), then on activation a dim overlay under it and the menu in the
// space left over.
const ContextMenuLayer = ({
    isOpen,
    shape,
    surface,
    items,
    onSelect,
    onClose,
    children,
}) => {
    const reduceMotion = useReducedMotion()
    const menuRef = useRef(null)
    const [place, setPlace] = useState(null)
    const { rect, point, radiusFrom, radiusTo } = shape
    const scale = reduceMotion ? 1 : shape.scale

    // offsetWidth/Height ignore the menu's entry scale, so this measures the
    // final size before the first paint.
    useLayoutEffect(() => {
        const el = menuRef.current
        if (!isOpen || !el) return
        const size = { width: el.offsetWidth, height: el.offsetHeight }
        setPlace(placeMenu(rect, size, point.x, scale))
    }, [isOpen, rect, point, scale])

    const grow = reduceMotion ? INSTANT : GROW
    const settle = reduceMotion ? INSTANT : SPRING.APPLE
    const fade = reduceMotion ? INSTANT : FADE

    return (
        <>
            <AnimatePresence propagate>
                {isOpen && (
                    <m.div
                        key="overlay"
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: fade }}
                        exit={{ opacity: 0, transition: fade }}
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>
            <m.div
                aria-hidden
                className={styles.lifted}
                style={{
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                }}
                initial={{ y: 0, scale: 1, filter: shadow(0) }}
                animate={{
                    y: place?.shift ?? 0,
                    scale,
                    filter: shadow(0.14),
                    transition: { default: grow, y: settle },
                }}
                exit={{ y: 0, scale: 1, filter: shadow(0), transition: settle }}
            >
                <m.div
                    className={cx(styles.card, surface && styles.surface)}
                    initial={{ clipPath: inset(radiusFrom) }}
                    animate={{ clipPath: inset(radiusTo), transition: grow }}
                    exit={{ clipPath: inset(radiusFrom), transition: settle }}
                >
                    {children}
                </m.div>
            </m.div>
            <AnimatePresence propagate>
                {isOpen && (
                    <MenuPanel
                        key="menu"
                        ref={menuRef}
                        items={items}
                        onSelect={onSelect}
                        opaque
                        className={cx(styles.menu, !place && styles.measuring)}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={
                            reduceMotion ? REDUCED_VARIANTS : POPOVER_VARIANTS
                        }
                        style={{
                            top: place?.top ?? 0,
                            left: place?.left ?? 0,
                            transformOrigin: place
                                ? `${place.originX} ${place.originY}`
                                : undefined,
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    )
}

ContextMenuLayer.propTypes = {
    isOpen: PropTypes.bool,
    shape: PropTypes.shape({
        rect: PropTypes.shape({
            top: PropTypes.number,
            left: PropTypes.number,
            right: PropTypes.number,
            bottom: PropTypes.number,
            width: PropTypes.number,
            height: PropTypes.number,
        }).isRequired,
        radiusFrom: PropTypes.string.isRequired,
        radiusTo: PropTypes.string.isRequired,
        scale: PropTypes.number.isRequired,
        point: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number })
            .isRequired,
    }).isRequired,
    surface: PropTypes.bool,
    items: PropTypes.arrayOf(itemShape).isRequired,
    onSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node,
}

export default ContextMenuLayer
