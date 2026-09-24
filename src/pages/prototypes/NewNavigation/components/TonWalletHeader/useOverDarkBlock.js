import { useLayoutEffect, useRef, useState } from "react"

import { findScroller } from "../../../../../hooks/useScrolled"

const DARK_BLOCK = "[data-header-scheme='dark']"

export function useOverDarkBlock() {
    const ref = useRef(null)
    const [overDark, setOverDark] = useState(false)

    useLayoutEffect(() => {
        const bar = ref.current?.firstElementChild
        const block = ref.current?.parentElement?.querySelector(DARK_BLOCK)
        const scroller = findScroller(ref.current)
        if (!bar || !block || !scroller) return

        const update = () =>
            setOverDark(
                block.getBoundingClientRect().bottom >
                    bar.getBoundingClientRect().bottom
            )

        let raf = 0
        const onScroll = () => {
            if (raf) return
            raf = requestAnimationFrame(() => {
                raf = 0
                update()
            })
        }

        update()
        scroller.addEventListener("scroll", onScroll, { passive: true })

        return () => {
            scroller.removeEventListener("scroll", onScroll)
            if (raf) cancelAnimationFrame(raf)
        }
    }, [])

    return [ref, overDark]
}
