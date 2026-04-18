import { useEffect, useState } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"
import * as styles from "./ModalView.module.scss"

import WebApp, { BackButton } from "../../lib/twa"

import { blendColors } from "../../utils/common"

const CSS_CLOSE_DURATION = 550

const getHeaderColor = () => WebApp.themeParams.secondary_bg_color || "#EFEFF4"

const ModalView = ({
    isOpen,
    onClose,
    useCssAnimation = false,
    children,
    ...props
}) => {
    const [shouldRender, setShouldRender] = useState(isOpen)
    const [animate, setAnimate] = useState(isOpen)

    if (isOpen && !shouldRender) setShouldRender(true)
    if (!isOpen && animate && useCssAnimation) setAnimate(false)

    const actualShouldRender = isOpen || shouldRender

    useEffect(() => {
        const headerColor = getHeaderColor()
        const headerColorWithOverlay = `#${blendColors(headerColor, "#000000", 0.5)}`

        if (isOpen) {
            document.body.style.overflow = "hidden"
            WebApp.disableVerticalSwipes()
            WebApp.setHeaderColor(headerColorWithOverlay)
        } else {
            document.body.style.overflow = "auto"
            WebApp.enableVerticalSwipes()
            WebApp.setHeaderColor(headerColor)
        }

        if (!useCssAnimation) return

        if (isOpen) {
            const timer = setTimeout(() => setAnimate(true), 10)
            return () => clearTimeout(timer)
        }

        const timer = setTimeout(
            () => setShouldRender(false),
            CSS_CLOSE_DURATION
        )
        return () => clearTimeout(timer)
    }, [isOpen, useCssAnimation])

    useEffect(
        () => () => {
            document.body.style.overflow = "auto"
            WebApp.enableVerticalSwipes()
            WebApp.setHeaderColor(getHeaderColor())
        },
        []
    )

    const overlayAnimation = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2, ease: "linear" } },
        exit: { opacity: 0, transition: { duration: 0.2, ease: "linear" } },
    }

    const modalAnimation = {
        hidden: { transform: "translateY(100dvh)" },
        visible: {
            transform: "translateY(0dvh)",
            transition: { type: "spring", damping: 30, stiffness: 250 },
        },
        exit: {
            transform: "translateY(100dvh)",
            transition: { duration: 0.2, ease: "linear" },
        },
    }

    if (useCssAnimation) {
        return (
            actualShouldRender && (
                <>
                    <BackButton onClick={onClose} />
                    <div
                        className={`${styles.overlay} ${styles.animation} ${animate ? styles.open : ""}`}
                        onClick={onClose}
                    >
                        <div
                            className={`${styles.root} ${styles.animation} ${animate ? styles.open : ""}`}
                            onClick={(e) => e.stopPropagation()}
                            {...props}
                        >
                            {children}
                        </div>
                    </div>
                </>
            )
        )
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <BackButton onClick={onClose} />
                    <m.div
                        className={styles.overlayFramer}
                        variants={overlayAnimation}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                    >
                        <m.div
                            className={styles.root}
                            variants={modalAnimation}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                            {...props}
                        >
                            {children}
                        </m.div>
                    </m.div>
                </>
            )}
        </AnimatePresence>
    )
}

ModalView.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    useCssAnimation: PropTypes.bool,
    children: PropTypes.node,
}
export default ModalView
