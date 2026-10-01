import { useEffect } from "react"

import { haptic } from "../../lib/twa"

const getItems = (menu) => [...menu.querySelectorAll('[role="menuitem"]')]

// Keyboard reach: focus lands on the first item once the menu is placed;
// arrows move between items, Enter / Space pick the focused one. Tab would
// walk focus out under the overlay, so it dismisses instead.
const useMenuKeyboard = (menuRef, active, onClose) => {
    useEffect(() => {
        const menu = menuRef.current
        if (!active || !menu) return
        getItems(menu)[0]?.focus({ preventScroll: true })
        const onKeyDown = (event) => {
            const list = getItems(menu)
            const index = list.indexOf(document.activeElement)
            if (event.key === "Tab") {
                event.preventDefault()
                onClose()
            } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault()
                const step = event.key === "ArrowDown" ? 1 : -1
                list[(index + step + list.length) % list.length]?.focus()
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
    }, [menuRef, active, onClose])
}

// iOS drag-to-select: the finger that opened the menu is still down; the item
// under it is highlighted (selection haptic on each change) and picked on
// release. Hit-testing, since a touch stays captured to the element it
// started on and items never see pointerenter.
const useDragToSelect = (menuRef, active) => {
    useEffect(() => {
        const menu = menuRef.current
        if (!active || !menu) return
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
    }, [menuRef, active])
}

/** Keyboard and drag-to-select for a placed, open context menu. */
export const useMenuInteraction = ({ menuRef, ready, dragSelect, onClose }) => {
    useMenuKeyboard(menuRef, ready, onClose)
    useDragToSelect(menuRef, ready && dragSelect)
}
