import React, { useRef, useEffect } from "react"
import * as styles from "./Gallery.module.scss"

const Gallery = ({ children, onPageChange, onScrollProgress }) => {
    const containerRef = useRef(null)

    const handleScroll = () => {
        if (containerRef.current) {
            const scrollLeft = containerRef.current.scrollLeft
            const pageWidth = containerRef.current.offsetWidth
            const newPage = Math.round(scrollLeft / pageWidth)

            const progress = (scrollLeft % pageWidth) / pageWidth

            if (onPageChange) {
                onPageChange(newPage)
            }
            if (onScrollProgress) {
                onScrollProgress(progress)
            }
        }
    }

    useEffect(() => {
        const container = containerRef.current
        container.addEventListener("scroll", handleScroll)

        return () => {
            container.removeEventListener("scroll", handleScroll)
        }
    }, [])

    return (
        <div className={styles.root} ref={containerRef}>
            {React.Children.map(children, (child) => (
                <div className={styles.page}>{child}</div>
            ))}
        </div>
    )
}

export default Gallery
