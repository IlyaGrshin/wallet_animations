import PropTypes from "prop-types"
import { motion, AnimatePresence } from "motion/react"
import { useLocation } from "wouter"
import { EASING } from "../../utils/animations"

const PageTransition = ({ children }) => {
    const [location] = useLocation()

    const variants = {
        initial: {
            opacity: 0,
            scale: 1.006,
        },
        animate: {
            opacity: 1,
            scale: 1,
        },
        exit: {
            opacity: 0,
            scale: 1.01,
        },
    }

    const transition = {
        duration: 0.3,
        ease: EASING.MATERIAL_STANDARD,
    }

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                height: "100vh",
                overflow: "hidden",
            }}
        >
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={location}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={transition}
                    style={{
                        width: "100%",
                        height: "100%",
                        overflowY: "auto",
                        willChange: "transform, opacity",
                    }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

PageTransition.propTypes = {
    children: PropTypes.node,
}

export default PageTransition
