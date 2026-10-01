import { useEffect, useLayoutEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { AnimatePresence, useReducedMotion } from "motion/react"
import cx from "clsx"

import MenuPanel, { itemShape } from "../DropdownMenu/MenuPanel"
import { useSkin } from "../../hooks/DeviceProvider"
import { haptic } from "../../lib/twa"
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
    dragSelect,
    items,
    onSelect,
    onClose,
    children,
}) => {
    const reduceMotion = useReducedMotion()
    const { isApple } = useSkin()
    const menuRef = useRef(null)
    const [place, setPlace] = useState(null)
    const { rect, point, radiusFrom, radiusTo } = shape
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

    // Keyboard reach: focus lands on the first item once the menu is placed;
    // arrows move between items, Enter / Space pick the focused one. Tab
    // would walk focus out under the overlay, so it dismisses instead.
    useEffect(() => {
        const menu = menuRef.current
        if (!isOpen || !place || !menu) return
        const getItems = () => [...menu.querySelectorAll('[role="menuitem"]')]
        getItems()[0]?.focus({ preventScroll: true })
        const onKeyDown = (event) => {
            const list = getItems()
            const index = list.indexOf(document.activeElement)
            if (event.key === "Tab") {
                event.preventDefault()
                onClose()
            } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault()
                const step = event.key === "ArrowDown" ? 1 : -1
                const next = (index + step + list.length) % list.length
                list[next]?.focus()
            } else if (
                (event.key === "Enter" || event.key === " ") &&
                index >= 0
            ) {
                event.preventDefault()
                list[index].click()
            }
        }
        document.addEventListener("keydown", onKeyDown)
        return () => document.removeEventListener("keydown", onKeyDown)
    }, [isOpen, place, onClose])

    // iOS drag-to-select: the finger that opened the menu is still down; the
    // item under it is highlighted (selection haptic on each change) and
    // picked on release. Hit-testing, since a touch stays captured to the
    // element it started on and items never see pointerenter.
    useEffect(() => {
        const menu = menuRef.current
        if (!isOpen || !place || !dragSelect || !menu) return
        let current = null
        const highlight = (el) => {
            if (el === current) return
            current?.removeAttribute("data-highlighted")
            current = el
            if (!el) return
            el.setAttribute("data-highlighted", "")
            haptic.selection()
        }
        const onMove = (event) => {
            const hit = document
                .elementFromPoint(event.clientX, event.clientY)
                ?.closest('[role="menuitem"]')
            highlight(hit && menu.contains(hit) ? hit : null)
        }
        const stop = () => {
            document.removeEventListener("pointermove", onMove)
            document.removeEventListener("pointerup", onUp)
            document.removeEventListener("pointercancel", onCancel)
        }
        const end = (pick) => {
            const el = current
            highlight(null)
            stop()
            if (pick && el) el.click()
        }
        const onUp = () => end(true)
        const onCancel = () => end(false)
        document.addEventListener("pointermove", onMove)
        document.addEventListener("pointerup", onUp)
        document.addEventListener("pointercancel", onCancel)
        return stop
    }, [isOpen, place, dragSelect])

    // HIG: read from the edge nearest the finger, so a menu above the row
    // lists its items bottom-up.
    const above = place?.originY === "100%"
    const orderedItems = above ? [...items].reverse() : items

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
                        items={orderedItems}
                        onSelect={(item) => onSelect(item, items.indexOf(item))}
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
    }).isRequired,
    surface: PropTypes.bool,
    dragSelect: PropTypes.bool,
    items: PropTypes.arrayOf(itemShape).isRequired,
    onSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node,
}

export default ContextMenuLayer
