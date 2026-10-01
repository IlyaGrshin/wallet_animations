import {
    cloneElement,
    isValidElement,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react"
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
    // The element's own inline opacity while it is hidden, to put back after.
    const savedOpacityRef = useRef(null)
    // Where focus was when the menu opened, restored once it is gone.
    const returnFocusRef = useRef(null)
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
    const open = (point) => {
        lift(point)
        haptic.impact("medium")
        returnFocusRef.current = document.activeElement
        setPhase("open")
    }

    const handlers = useLongPress({
        onPressStart: (point) => {
            lift(point)
            setPhase("pressing")
        },
        onCancel: close,
        onLongPress: open,
        // Busy while the menu is open or the copy is still settling back.
        disabled: isOpen || (phase === "idle" && target !== null),
    })

    // The lifted copy stands in for the element while held or open. Opacity,
    // not visibility, so it keeps receiving the pointer events of the hold.
    // Any inline opacity of its own is saved and put back afterwards.
    useLayoutEffect(() => {
        const el = getElement()
        if (!el) return
        if (target && savedOpacityRef.current === null) {
            savedOpacityRef.current = el.style.opacity
            el.style.opacity = "0"
        } else if (!target && savedOpacityRef.current !== null) {
            el.style.opacity = savedOpacityRef.current
            savedOpacityRef.current = null
        }
    }, [target])

    // Keyboard: Shift+F10 or the Menu key opens the menu for a focused element.
    const handleKeyDown = (event) => {
        const isMenuKey =
            event.key === "ContextMenu" ||
            (event.shiftKey && event.key === "F10")
        if (!isMenuKey || isOpen || target) return
        event.preventDefault()
        const el = getElement()
        if (!el) return
        const box = el.getBoundingClientRect()
        open({ x: box.left + box.width / 2, y: box.top + box.height / 2 })
    }

    const handleExitComplete = () => {
        setTarget(null)
        // Focus left with the menu; hand it back to where it came from.
        const ret = returnFocusRef.current
        returnFocusRef.current = null
        // Exit completes just before the menu unmounts, so focus may still
        // sit on one of its items; anywhere else, the user has moved on.
        const active = document.activeElement
        const stranded =
            !active ||
            active === document.body ||
            active.closest('[role="menu"]')
        if (ret?.isConnected && stranded) ret.focus({ preventScroll: true })
    }

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
            <span
                ref={triggerRef}
                className={styles.trigger}
                onKeyDown={handleKeyDown}
                {...handlers}
            >
                {children}
            </span>
            {createPortal(
                <AnimatePresence onExitComplete={handleExitComplete}>
                    {phase !== "idle" && target && (
                        <ContextMenuLayer
                            isOpen={isOpen}
                            shape={target}
                            surface={surface}
                            items={items}
                            onSelect={handleSelect}
                            onClose={close}
                        >
                            {/* A visual copy: the caller's ref stays on the
                                real element. */}
                            {isValidElement(children)
                                ? cloneElement(children, { ref: null })
                                : children}
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
