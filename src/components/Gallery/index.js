import { useRef, useEffect, Children } from "react"
import PropTypes from "prop-types"
import * as styles from "./Gallery.module.scss"

const Gallery = ({ children, onPageChange, onScrollProgress }) => {
    const containerRef = useRef(null)

    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                const scrollLeft = containerRef.current.scrollLeft
                const pageWidth = containerRef.current.offsetWidth
                const newPage = Math.round(scrollLeft / pageWidth)

                const progress = (scrollLeft % pageWidth) / pageWidth

                onPageChange?.(newPage)
                onScrollProgress?.(progress)
            }
        }

        const container = containerRef.current
        if (container) {
            container.addEventListener("scroll", handleScroll)
            return () => container.removeEventListener("scroll", handleScroll)
        }
    }, [onPageChange, onScrollProgress])

    return (
        <div className={styles.root} ref={containerRef}>
            {Children.map(children, (child) => (
                <div className={styles.page}>{child}</div>
            ))}
        </div>
    )
}

Gallery.propTypes = {
    children: PropTypes.node,
    onPageChange: PropTypes.func,
    onScrollProgress: PropTypes.func,
}
export default Gallery
