import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import { createPortal } from "react-dom"
import { AnimatePresence } from "motion/react"
import cx from "clsx"

import WebApp from "../../lib/twa"
import { useSkin } from "../../hooks/DeviceProvider"
import { itemShape } from "../DropdownMenu/MenuPanel"
import ContextMenuLayer from "./ContextMenuLayer"
import { useLongPress } from "./useLongPress"

import * as styles from "./ContextMenu.module.scss"

const APPLE_RADIUS = 24
const MATERIAL_RADIUS = 16

const haptic = () => {
    try {
        WebApp.HapticFeedback?.impactOccurred("medium")
    } catch {
        // older clients may not support HapticFeedback
    }
}

const getRect = (el) => {
    const { left, top, right, bottom, width, height } =
        el.getBoundingClientRect()
    return { left, top, right, bottom, width, height }
}

/**
 * Long-press (or right-click) context menu. A plain tap leaves the row
 * untouched; an intentional hold lifts it out of the list and slowly scales
 * it up with rounded corners. On activation (haptic) a dim overlay fades in
 * under it and the menu opens in the remaining space. Tap the overlay or Esc to close.
 * @param {Array} props.items Menu entries: strings or `{ label, icon, destructive }`.
 * @param {(item, index: number) => void} [props.onSelect] Fires with the picked entry.
 * @example
 * <ContextMenu items={[{ label: "Delete", icon: <Trash />, destructive: true }]}
 *   onSelect={handle}>
 *   <Cell><Cell.Text title="Wallet" /></Cell>
 * </ContextMenu>
 */
const ContextMenu = ({ items, onSelect, children, className }) => {
    const { isApple } = useSkin()
    const radius = isApple ? APPLE_RADIUS : MATERIAL_RADIUS
    const triggerRef = useRef(null)
    // `target` outlives `phase` so the original row stays hidden until the
    // lifted copy has settled back into place.
    const [target, setTarget] = useState(null)
    // "idle" | "pressing" (hold in progress) | "open" (menu shown)
    const [phase, setPhase] = useState("idle")
    const isOpen = phase === "open"

    const lift = (point) => {
        const el = triggerRef.current
        if (el) setTarget({ rect: getRect(el), point })
    }
    const close = () => setPhase("idle")

    const handlers = useLongPress({
        onPressStart: (point) => {
            lift(point)
            setPhase("pressing")
        },
        onCancel: close,
        onLongPress: (point) => {
            // Right-click skips the hold, so the row may not be lifted yet.
            lift(point)
            haptic()
            setPhase("open")
        },
        // Busy while the menu is open or the copy is still settling back.
        disabled: isOpen || (phase === "idle" && target !== null),
    })

    const handleSelect = (item, index) => {
        close()
        onSelect?.(item, index)
    }

    // The lifted copy is pinned to the row's on-screen rect, so anything that
    // moves the page closes the menu rather than leaving it detached.
    useEffect(() => {
        if (!isOpen) return
        const onKeyDown = (event) => {
            if (event.key === "Escape") close()
        }
        document.addEventListener("keydown", onKeyDown)
        window.addEventListener("scroll", close, true)
        window.addEventListener("resize", close)
        return () => {
            document.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("scroll", close, true)
            window.removeEventListener("resize", close)
        }
    }, [isOpen])

    return (
        <>
            <div
                ref={triggerRef}
                className={cx(
                    styles.trigger,
                    target && styles.hidden,
                    className
                )}
                {...handlers}
            >
                {children}
            </div>
            {createPortal(
                <AnimatePresence onExitComplete={() => setTarget(null)}>
                    {phase !== "idle" && target && (
                        <ContextMenuLayer
                            isOpen={isOpen}
                            rect={target.rect}
                            point={target.point}
                            radius={radius}
                            items={items}
                            onSelect={handleSelect}
                            onClose={close}
                        >
                            {children}
                        </ContextMenuLayer>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    )
}

ContextMenu.propTypes = {
    items: PropTypes.arrayOf(itemShape).isRequired,
    onSelect: PropTypes.func,
    children: PropTypes.node,
    className: PropTypes.string,
}

export default ContextMenu
