import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"
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

const PageTransition = ({ children, bottomInset = false, contained = false }) => {
    const [location] = useLocation()

    const rootClassName = contained
        ? `${styles.root} ${styles.contained}`
        : styles.root

    return (
        <div className={rootClassName}>
            <AnimatePresence mode="popLayout">
                <m.div
                    key={location}
                    className={`${styles.scroll} ${bottomInset ? styles.withBottomInset : ""}`}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={transition}
                >
                    {children}
                </m.div>
            </AnimatePresence>
        </div>
    )
}

PageTransition.propTypes = {
    children: PropTypes.node,
    bottomInset: PropTypes.bool,
    contained: PropTypes.bool,
}

export default PageTransition
