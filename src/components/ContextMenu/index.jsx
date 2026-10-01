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

// The row is mid press-in (scaled) when the menu fires; take its resting box
// so the lifted copy matches the layout slot it came from.
const unscaledRect = (el) => {
    const box = el.getBoundingClientRect()
    const width = el.offsetWidth
    const height = el.offsetHeight
    const left = box.left + box.width / 2 - width / 2
    const top = box.top + box.height / 2 - height / 2
    return {
        left,
        top,
        width,
        height,
        right: left + width,
        bottom: top + height,
    }
}

/**
 * Long-press (or right-click) context menu. While held the row presses in;
 * on activation (haptic) it lifts above a dim overlay with rounded corners
 * and the menu opens in the remaining space. Tap the overlay or Esc to close.
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
    // `target` outlives `isOpen` so the original row stays hidden until the
    // lifted copy has flown back into place.
    const [target, setTarget] = useState(null)
    const [isOpen, setIsOpen] = useState(false)

    const open = (point) => {
        const el = triggerRef.current
        if (!el) return
        haptic()
        setTarget({ rect: unscaledRect(el), point })
        setIsOpen(true)
    }
    const close = () => setIsOpen(false)

    const { pressing, handlers } = useLongPress({
        onLongPress: open,
        disabled: Boolean(target),
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
                    pressing && styles.pressing,
                    target && styles.hidden,
                    className
                )}
                style={{ "--context-menu-radius": `${radius}px` }}
                {...handlers}
            >
                {children}
            </div>
            {createPortal(
                <AnimatePresence onExitComplete={() => setTarget(null)}>
                    {isOpen && target && (
                        <ContextMenuLayer
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
