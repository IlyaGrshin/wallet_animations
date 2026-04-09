import { useEffect } from "react"

export function usePreventScroll() {
    useEffect(() => {
        const preventScroll = (e) => {
            e.preventDefault()
            window.scrollTo(0, 0)
        }

        const timeoutId = setTimeout(() => {
            Object.assign(document.body.style, {
                overflow: "hidden",
                position: "fixed",
                width: "100%",
                top: "0",
            })
        }, 300)

        window.addEventListener("scroll", preventScroll, { passive: false })
        window.addEventListener("touchmove", preventScroll, { passive: false })

        return () => {
            clearTimeout(timeoutId)
            Object.assign(document.body.style, {
                overflow: "",
                position: "",
                width: "",
                top: "",
            })
            window.removeEventListener("scroll", preventScroll)
            window.removeEventListener("touchmove", preventScroll)
        }
    }, [])
}
