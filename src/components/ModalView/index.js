import { useEffect, useState } from "react"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"
import * as styles from "./ModalView.module.scss"

import WebApp from "@twa-dev/sdk"
import { BackButton } from "@twa-dev/sdk/react"

import { blendColors } from "../../utils/common"

const ModalView = ({
    isOpen,
    onClose,
    useCssAnimation = false,
    children,
    ...props
}) => {
    const [shouldRender, setShouldRender] = useState(isOpen)
    const [animate, setAnimate] = useState(isOpen)
    const actualShouldRender = isOpen ? true : shouldRender

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "auto"

        const headerColor = WebApp.themeParams.secondary_bg_color || "#EFEFF4"
        const headerColorWithOverlay = `#${blendColors(headerColor, "#000000", 0.5)}`

        if (useCssAnimation) {
            if (isOpen) {
                WebApp.disableVerticalSwipes()
                setTimeout(() => {
                    setAnimate(true)
                    WebApp.setHeaderColor(headerColorWithOverlay)
                }, 10)
            } else {
                WebApp.enableVerticalSwipes()
                WebApp.BackButton.hide()
                WebApp.MainButton.hide()
                WebApp.setHeaderColor(headerColor)
                const timer = setTimeout(() => setAnimate(false), 0)
                return () => clearTimeout(timer)
            }
        } else {
            if (isOpen) {
                WebApp.setHeaderColor(headerColorWithOverlay)
                WebApp.disableVerticalSwipes()
            } else {
                WebApp.enableVerticalSwipes()
                WebApp.BackButton.hide()
                WebApp.MainButton.hide()
                WebApp.setHeaderColor(headerColor)
            }
        }
    }, [isOpen, useCssAnimation])

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

    const onAnimationEnd = (e) => {
        if (e.target === e.currentTarget && !animate) {
            setShouldRender(false)
        }
    }

    if (useCssAnimation) {
        return (
            actualShouldRender && (
                <>
                    <BackButton onClick={onClose} />
                    <div
                        className={`${styles.overlay} ${styles.animation} ${animate ? `${styles.open}` : ""}`}
                        onClick={onClose}
                        onTransitionEnd={onAnimationEnd}
                    >
                        <div
                            className={`${styles.root} ${styles.animation} ${animate ? `${styles.open}` : ""}`}
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

export default ModalView
