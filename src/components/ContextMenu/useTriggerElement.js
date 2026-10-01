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
    // The node currently hidden and its own inline opacity, so a root swap
    // mid-gesture hands the hidden state to the new node and each node gets
    // back exactly what it had.
    const hiddenRef = useRef(null)
    const hiddenNow = useRef(hidden)
    const getElement = () => wrapperRef.current?.firstElementChild ?? null

    const hide = (el) => {
        if (!el || hiddenRef.current?.el === el) return
        hiddenRef.current = { el, opacity: el.style.opacity }
        el.style.opacity = "0"
    }
    const show = () => {
        const entry = hiddenRef.current
        hiddenRef.current = null
        if (entry?.el.isConnected) entry.el.style.opacity = entry.opacity
    }

    useLayoutEffect(() => {
        const wrapper = wrapperRef.current
        if (!wrapper) return
        prepare(wrapper.firstElementChild)
        const observer = new MutationObserver(() => {
            const el = wrapper.firstElementChild
            prepare(el)
            if (!hiddenNow.current) return
            show()
            hide(el)
        })
        observer.observe(wrapper, { childList: true })
        return () => observer.disconnect()
    }, [wrapperRef])

    // The lifted copy stands in for the element while held or open. Opacity,
    // not visibility, so it keeps receiving the pointer events of the hold.
    useLayoutEffect(() => {
        hiddenNow.current = hidden
        if (hidden) hide(getElement())
        else show()
    }, [hidden])

    return getElement
}
