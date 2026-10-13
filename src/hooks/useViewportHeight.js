import { useEffect, useState } from "react"
import { usePlatform } from "../lib/platform"

export function useViewportHeight() {
    const platform = usePlatform()
    const [height, setHeight] = useState(() => platform.getViewportHeight())

    useEffect(() => {
        let rafId = null

        const updateHeight = () => {
            if (rafId) cancelAnimationFrame(rafId)

            rafId = requestAnimationFrame(() => {
                const newHeight = platform.getViewportHeight()
                setHeight(newHeight)
                window.scrollTo(0, 0)
            })
        }

        updateHeight()

        const unsubscribe = platform.onViewportChange(updateHeight)
        window.addEventListener("resize", updateHeight, { passive: true })

        return () => {
            if (rafId) cancelAnimationFrame(rafId)
            unsubscribe()
            window.removeEventListener("resize", updateHeight)
        }
    }, [platform])

    return height
}
