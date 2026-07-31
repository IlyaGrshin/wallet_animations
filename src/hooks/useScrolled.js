import { useEffect, useState } from "react"

export const findScroller = (node) => {
    let el = node?.parentElement
    while (el) {
        const overflowY = getComputedStyle(el).overflowY
        if (overflowY === "auto" || overflowY === "scroll") return el
        el = el.parentElement
    }
    return null
}

export default function useScrolled(ref, { enabled = true, threshold = 2 } = {}) {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        if (!enabled) return
        const scroller = findScroller(ref.current)
        if (!scroller) return
        let raf = 0
        const onScroll = () => {
            if (raf) return
            raf = requestAnimationFrame(() => {
                raf = 0
                setScrolled(scroller.scrollTop > threshold)
            })
        }
        onScroll()
        scroller.addEventListener("scroll", onScroll, { passive: true })
        return () => {
            scroller.removeEventListener("scroll", onScroll)
            if (raf) cancelAnimationFrame(raf)
        }
    }, [ref, enabled, threshold])

    return enabled && scrolled
}
