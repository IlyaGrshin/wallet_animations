import { useLayoutEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { AnimatePresence, useReducedMotion } from "motion/react"
import cx from "clsx"

import MenuPanel, { itemShape } from "../DropdownMenu/MenuPanel"
import { useSkin } from "../../hooks/DeviceProvider"
import {
    DURATION,
    EASING,
    POPOVER_VARIANTS,
    SPRING,
} from "../../utils/animations"
import { DELAY, PRESS_DELAY } from "../../hooks/useLongPress"
import { placeMenu } from "./placement"
import { useMenuInteraction } from "./useMenuInteraction"

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
    dragSelect,
    items,
    onSelect,
    onClose,
}) => {
    const reduceMotion = useReducedMotion()
    const { isApple } = useSkin()
    const menuRef = useRef(null)
    const cardRef = useRef(null)
    const [place, setPlace] = useState(null)
    const { rect, point, radiusFrom, radiusTo, source, savedOpacity } = shape
    // Grows while held, then settles (a row slightly narrower) once open.
    const heldScale = reduceMotion ? 1 : shape.scale
    const openScale = reduceMotion ? 1 : shape.settledScale
    const scale = isOpen ? openScale : heldScale

    // offsetWidth/Height ignore the menu's entry scale, so this measures the
    // final size before the first paint.
    useLayoutEffect(() => {
        const el = menuRef.current
        if (!isOpen || !el) return
        const size = { width: el.offsetWidth, height: el.offsetHeight }
        setPlace(placeMenu(rect, size, point.x, openScale))
    }, [isOpen, rect, point, openScale])

    useMenuInteraction({
        menuRef,
        ready: isOpen && Boolean(place),
        dragSelect,
        onClose,
    })

    // The preview is a DOM snapshot of the element, not a second render of
    // it: no duplicate mount effects, and it shows the element's live state.
    useLayoutEffect(() => {
        const card = cardRef.current
        if (!card || !source) return
        const copy = source.cloneNode(true)
        copy.style.opacity = savedOpacity ?? ""
        // The press feedback caught mid-hold (Tappable tint / ripple, a
        // button's whileTap scale) must not freeze into the preview.
        copy.style.transform = ""
        for (const el of copy.querySelectorAll("[data-tap-feedback]"))
            el.remove()
        for (const el of [copy, ...copy.querySelectorAll("[id], [tabindex]")]) {
            el.removeAttribute("id")
            el.removeAttribute("tabindex")
        }
        card.appendChild(copy)
        return () => copy.remove()
    }, [source, savedOpacity])

    // HIG: read from the edge nearest the finger, so a menu above the row
    // lists its items bottom-up.
    const above = place?.originY === "100%"
    const orderedItems = above ? [...items].reverse() : items
    // Map the shown position back to the caller's index (duplicate labels
    // included), rather than looking the item up by value.
    const toIndex = (shown) => (above ? items.length - 1 - shown : shown)

    const grow = reduceMotion ? INSTANT : GROW
    const platformSpring = isApple ? SPRING.APPLE : SPRING.MATERIAL
    const settle = reduceMotion ? INSTANT : platformSpring
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
                        // A new touch dismisses, not a click: releasing the
                        // finger that opened the menu fires a click on
                        // whatever is under it, which is now this overlay.
                        onPointerDown={onClose}
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
                    // The hold grows slowly; opening springs to the settled size.
                    transition: isOpen
                        ? { default: grow, y: settle, scale: settle }
                        : { default: grow, y: settle },
                }}
                exit={{ y: 0, scale: 1, filter: shadow(0), transition: settle }}
            >
                <m.div
                    ref={cardRef}
                    className={cx(styles.card, surface && styles.surface)}
                    initial={{ clipPath: inset(radiusFrom) }}
                    animate={{ clipPath: inset(radiusTo), transition: grow }}
                    exit={{ clipPath: inset(radiusFrom), transition: settle }}
                />
            </m.div>
            <AnimatePresence propagate>
                {isOpen && (
                    <MenuPanel
                        key="menu"
                        ref={menuRef}
                        items={orderedItems}
                        onSelect={(item, shown) =>
                            onSelect(item, toIndex(shown))
                        }
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
                            maxHeight: place?.maxHeight,
                            overflowY: "auto",
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
        settledScale: PropTypes.number.isRequired,
        point: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number })
            .isRequired,
        source: PropTypes.object,
        savedOpacity: PropTypes.string,
    }).isRequired,
    surface: PropTypes.bool,
    dragSelect: PropTypes.bool,
    items: PropTypes.arrayOf(itemShape).isRequired,
    onSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default ContextMenuLayer
