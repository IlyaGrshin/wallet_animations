import { useLayoutEffect, useRef } from "react"

// Any element can carry a menu, so the trigger is made reachable by keyboard
// and announced as a menu button when it isn't focusable itself.
const prepare = (el) => {
    if (!el) return
    if (el.tabIndex < 0 && !el.hasAttribute("tabindex")) el.tabIndex = 0
    el.setAttribute("aria-haspopup", "menu")
}

/**
 * The trigger's own DOM node (the first child of the `display: contents`
 * wrapper): keeps it keyboard-reachable across root-node swaps (e.g. a
 * placeholder replaced by the real cell) and hides it while `hidden`,
 * restoring its own inline opacity afterwards.
 */
export const useTriggerElement = (wrapperRef, hidden) => {
    const savedOpacityRef = useRef(null)
    const getElement = () => wrapperRef.current?.firstElementChild ?? null

    useLayoutEffect(() => {
        const wrapper = wrapperRef.current
        if (!wrapper) return
        prepare(wrapper.firstElementChild)
        const observer = new MutationObserver(() =>
            prepare(wrapper.firstElementChild)
        )
        observer.observe(wrapper, { childList: true })
        return () => observer.disconnect()
    }, [wrapperRef])

    // The lifted copy stands in for the element while held or open. Opacity,
    // not visibility, so it keeps receiving the pointer events of the hold.
    useLayoutEffect(() => {
        const el = getElement()
        if (!el) return
        if (hidden && savedOpacityRef.current === null) {
            savedOpacityRef.current = el.style.opacity
            el.style.opacity = "0"
        } else if (!hidden && savedOpacityRef.current !== null) {
            el.style.opacity = savedOpacityRef.current
            savedOpacityRef.current = null
        }
    }, [hidden])

    return getElement
}
