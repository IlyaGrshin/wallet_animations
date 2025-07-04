import { useEffect, useState } from "react"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"
import * as styles from "./ModalView.module.scss"

import WebApp from "@twa-dev/sdk"
import { BackButton } from "@twa-dev/sdk/react"

import { hexToRgb } from "../../utils/common"

function blendColors(color1, color2, alpha) {
    const [r1, g1, b1] = hexToRgb(color1, "array")
    const [r2, g2, b2] = hexToRgb(color2, "array")
    const r = Math.round(r1 * (1 - alpha) + r2 * alpha)
    const g = Math.round(g1 * (1 - alpha) + g2 * alpha)
    const b = Math.round(b1 * (1 - alpha) + b2 * alpha)

    return ((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)
        .toUpperCase()
}

const ModalView = ({
    isOpen,
    onClose,
    useCssAnimation = false,
    children,
    ...props
}) => {
    const [shouldRender, setShouldRender] = useState(false)
    const [animate, setAnimate] = useState(false)

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "auto"

        const headerColor = WebApp.themeParams.secondary_bg_color || "#EFEFF4"
        const headerColorWithOverlay = `#${blendColors(headerColor, "#000000", 0.5)}`

        if (useCssAnimation) {
            if (isOpen) {
                WebApp.disableVerticalSwipes()
                setShouldRender(true)
                setTimeout(() => {
                    setAnimate(true)
                    WebApp.setHeaderColor(headerColorWithOverlay)
                }, 10)
            } else {
                WebApp.enableVerticalSwipes()
                WebApp.BackButton.hide()
                WebApp.MainButton.hide()
                WebApp.setHeaderColor(headerColor)
                setAnimate(false)
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
            shouldRender && (
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
