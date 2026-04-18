import PropTypes from "prop-types"
import { motion, AnimatePresence } from "motion/react"
import { useLocation } from "wouter"
import { EASING } from "../../utils/animations"

import * as styles from "./PageTransition.module.scss"

const variants = {
    initial: { opacity: 0, scale: 1.006 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.01 },
}

const transition = {
    duration: 0.3,
    ease: EASING.MATERIAL_STANDARD,
}

const PageTransition = ({ children, bottomInset = false }) => {
    const [location] = useLocation()

    return (
        <div className={styles.root}>
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={location}
                    className={`${styles.scroll} ${bottomInset ? styles.withBottomInset : ""}`}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={transition}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

PageTransition.propTypes = {
    children: PropTypes.node,
    bottomInset: PropTypes.bool,
}

export default PageTransition
