import { useLayoutEffect, useRef, useState } from "react"

import { findScroller } from "./useScrolled"

/**
 * Finds the scrolling ancestor of a virtualized list and the list's offset
 * inside it, for `useVirtualizer`'s `getScrollElement` and `scrollMargin`.
 * Re-measured when the list resizes, since content above can move its start.
 * @param {import("react").RefObject<HTMLElement>} listRef The list's sizer.
 * @returns {{ scrollEl: HTMLElement | null, listOffset: number }}
 * @example
 * const listRef = useRef(null)
 * const { scrollEl, listOffset } = useScrollMargin(listRef)
 * useVirtualizer({ getScrollElement: () => scrollEl, scrollMargin: listOffset })
 */
export default function useScrollMargin(listRef) {
    const scrollerRef = useRef(null)
    const [scrollEl, setScrollEl] = useState(null)
    const [listOffset, setListOffset] = useState(0)

    useLayoutEffect(() => {
        const list = listRef.current
        const firstMount = !scrollerRef.current
        scrollerRef.current ??= findScroller(list)
        const scroller = scrollerRef.current
        setScrollEl(scroller)
        if (!scroller) return undefined
        const measure = () =>
            setListOffset(
                list.getBoundingClientRect().top -
                    scroller.getBoundingClientRect().top +
                    scroller.scrollTop
            )
        if (firstMount) measure()
        const observer = new ResizeObserver(measure)
        observer.observe(list)
        return () => observer.disconnect()
    }, [listRef])

    return { scrollEl, listOffset }
}
