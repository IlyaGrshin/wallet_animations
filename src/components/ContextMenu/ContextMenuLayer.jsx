import { useLayoutEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { AnimatePresence, useReducedMotion } from "motion/react"
import cx from "clsx"

import { MenuPanel } from "../DropdownMenu"
import { itemShape } from "../DropdownMenu/MenuPanel"
import { POPOVER_VARIANTS, SPRING } from "../../utils/animations"
import { DELAY, PRESS_DELAY } from "./useLongPress"
import { placeMenu } from "./placement"

import * as styles from "./ContextMenu.module.scss"

// The row grows to this scale over the rest of the hold, so the lift feels
// continuous with the finger staying down.
const LIFTED_SCALE = 1.03
const GROW = {
    duration: (DELAY - PRESS_DELAY) / 1000,
    ease: [0.23, 1, 0.32, 1],
}
const FADE = { duration: 0.2, ease: "easeOut" }
const INSTANT = { duration: 0 }
const REDUCED_VARIANTS = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: FADE },
    exit: { opacity: 0, transition: FADE },
}

const inset = (radius) => `inset(0px round ${radius}px)`
// drop-shadow on the unclipped wrapper follows the clipped card's shape.
const shadow = (alpha) => `drop-shadow(0px 6px 20px rgb(0 0 0 / ${alpha}))`

// Portal layer: the row lifted out of the list (from the moment the hold is
// intentional), then on activation a dim overlay under it and the menu in the
// space left over.
const ContextMenuLayer = ({
    isOpen,
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
        if (!isOpen || !el) return
        const size = { width: el.offsetWidth, height: el.offsetHeight }
        setPlace(placeMenu(rect, size, point.x))
    }, [isOpen, rect, point])

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
                    scale: reduceMotion ? 1 : LIFTED_SCALE,
                    filter: shadow(0.14),
                    transition: { default: grow, y: settle },
                }}
                exit={{ y: 0, scale: 1, filter: shadow(0), transition: settle }}
            >
                <m.div
                    className={styles.card}
                    initial={{ clipPath: inset(0) }}
                    animate={{ clipPath: inset(radius), transition: grow }}
                    exit={{ clipPath: inset(0), transition: settle }}
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
