import { useEffect, useLayoutEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import { createPortal } from "react-dom"
import { AnimatePresence } from "motion/react"

import { haptic } from "../../lib/twa"
import { useSkin } from "../../hooks/DeviceProvider"
import { itemShape } from "../DropdownMenu/MenuPanel"
import ContextMenuLayer from "./ContextMenuLayer"
import { measureShape } from "./shape"
import { useLongPress } from "../../hooks/useLongPress"

import * as styles from "./ContextMenu.module.scss"

// Corner radius a square-cornered element (a list row) rounds off to.
const APPLE_RADIUS = 24
const MATERIAL_RADIUS = 16

/**
 * Long-press (or right-click) context menu for any tappable element. A plain
 * tap passes through to the element untouched; an intentional hold lifts it
 * and slowly scales it up. On activation (haptic) a dim overlay fades in under
 * it and the menu opens in the remaining space. Tap the overlay or Esc to
 * close. The element keeps its own shape; square-cornered ones round off.
 * For a bare long press without a menu, use the `useLongPress` hook.
 * @param {Array} props.items Menu entries: strings or `{ label, icon, destructive }`.
 * @param {(item, index: number) => void} [props.onSelect] Fires with the picked entry.
 * @param {import("react").ReactElement} props.children A single element. It
 * needs no special props: the gesture lives on a `display: contents` wrapper,
 * so the element keeps its own layout.
 * @param {boolean} [props.surface] Paint the section background under the
 * lifted copy — for list rows, whose background comes from the list.
 * @example
 * <ContextMenu surface items={[{ label: "Delete", icon: <Trash />, destructive: true }]}
 *   onSelect={handle}>
 *   <Cell><Cell.Text title="Wallet" /></Cell>
 * </ContextMenu>
 * <ContextMenu items={["Copy", "Share"]}>
 *   <MultilineButton icon={<SendIcon />} label="Send" />
 * </ContextMenu>
 */
const ContextMenu = ({ items, onSelect, surface = false, children }) => {
    const { isApple } = useSkin()
    const fallbackRadius = isApple ? APPLE_RADIUS : MATERIAL_RADIUS
    const triggerRef = useRef(null)
    // `target` outlives `phase` so the original row stays hidden until the
    // lifted copy has settled back into place.
    const [target, setTarget] = useState(null)
    // "idle" | "pressing" (hold in progress) | "open" (menu shown)
    const [phase, setPhase] = useState("idle")
    const isOpen = phase === "open"

    // The wrapper is `display: contents` (no box), so the visual target is
    // its element child.
    const getElement = () => triggerRef.current?.firstElementChild
    // Measures once per gesture: a hold lifts on press start, and the later
    // activation reuses that shape; right-click arrives with nothing lifted.
    const lift = (point) =>
        setTarget((prev) => {
            const el = getElement()
            if (prev || !el) return prev
            return { ...measureShape(el, fallbackRadius), point }
        })
    const close = () => setPhase("idle")

    const handlers = useLongPress({
        onPressStart: (point) => {
            lift(point)
            setPhase("pressing")
        },
        onCancel: close,
        onLongPress: (point) => {
            lift(point)
            haptic.impact("medium")
            setPhase("open")
        },
        // Busy while the menu is open or the copy is still settling back.
        disabled: isOpen || (phase === "idle" && target !== null),
    })

    // The lifted copy stands in for the element while held or open. Opacity,
    // not visibility, so it keeps receiving the pointer events of the hold.
    useLayoutEffect(() => {
        const el = getElement()
        if (!el) return
        el.style.opacity = target ? "0" : ""
    }, [target])

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
            <span ref={triggerRef} className={styles.trigger} {...handlers}>
                {children}
            </span>
            {createPortal(
                <AnimatePresence onExitComplete={() => setTarget(null)}>
                    {phase !== "idle" && target && (
                        <ContextMenuLayer
                            isOpen={isOpen}
                            shape={target}
                            surface={surface}
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
    surface: PropTypes.bool,
    items: PropTypes.arrayOf(itemShape).isRequired,
    onSelect: PropTypes.func,
    children: PropTypes.element.isRequired,
}

export default ContextMenu
