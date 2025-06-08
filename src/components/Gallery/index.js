import { useRef, useEffect, Children, useCallback, useEffectEvent } from "react"
import * as styles from "./Gallery.module.scss"

const Gallery = ({ children, onPageChange, onScrollProgress }) => {
    const containerRef = useRef(null)

    const handleScroll = useEffectEvent(() => {
        if (containerRef.current) {
            const scrollLeft = containerRef.current.scrollLeft
            const pageWidth = containerRef.current.offsetWidth
            const newPage = Math.round(scrollLeft / pageWidth)

            const progress = (scrollLeft % pageWidth) / pageWidth

            onPageChange?.(newPage)
            onScrollProgress?.(progress)
        }
    })

    useEffect(() => {
        const container = containerRef.current
        if (container) {
            container.addEventListener("scroll", handleScroll)
            return () => container.removeEventListener("scroll", handleScroll)
        }
    }, [])

    return (
        <div className={styles.root} ref={containerRef}>
            {Children.map(children, (child) => (
                <div className={styles.page}>{child}</div>
            ))}
        </div>
    )
}

export default Gallery
