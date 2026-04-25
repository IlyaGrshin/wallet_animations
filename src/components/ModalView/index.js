import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"
import * as styles from "./ModalView.module.scss"

import WebApp, { BackButton } from "../../lib/twa"

import { blendColors } from "../../utils/common"
import { useFocusTrap } from "../../hooks/useFocusTrap"

const CSS_CLOSE_DURATION = 550
const OVERLAY_ALPHA = 0.5

const normalizeHex = (input) => {
    if (!input) return null
    if (input.startsWith("#")) return input
    const themed = WebApp.themeParams?.[input]
    return themed || null
}

const getPageBgColor = () =>
    normalizeHex(WebApp.backgroundColor) ||
    WebApp.themeParams.bg_color ||
    WebApp.themeParams.secondary_bg_color ||
    "#EFEFF4"

const activeModals = new Set()
let appliedHeader = null
let pendingHeader = false

const flushHeader = () => {
    if (pendingHeader) return
    pendingHeader = true
    queueMicrotask(() => {
        pendingHeader = false
        const next =
            activeModals.size > 0
                ? `#${blendColors(getPageBgColor(), "#000000", OVERLAY_ALPHA)}`
                : getPageBgColor()
        if (next === appliedHeader) return
        appliedHeader = next
        WebApp.setHeaderColor(next)
    })
}

const enterModalMode = (id) => {
    const wasEmpty = activeModals.size === 0
    activeModals.add(id)
    if (wasEmpty) {
        document.body.style.overflow = "hidden"
        WebApp.disableVerticalSwipes()
    }
    flushHeader()
}

const leaveModalMode = (id) => {
    if (!activeModals.has(id)) return
    activeModals.delete(id)
    if (activeModals.size === 0) {
        document.body.style.overflow = "auto"
        WebApp.enableVerticalSwipes()
        flushHeader()
    }
}

const ModalView = ({
    isOpen,
    onClose,
    useCssAnimation = false,
    children,
    ...props
}) => {
    const [shouldRender, setShouldRender] = useState(isOpen)
    const [animate, setAnimate] = useState(isOpen)
    const modalRef = useRef(null)

    if (isOpen && !shouldRender) setShouldRender(true)
    if (!isOpen && animate && useCssAnimation) setAnimate(false)

    const actualShouldRender = isOpen || shouldRender

    useFocusTrap(modalRef, isOpen)

    useEffect(() => {
        if (!isOpen) {
            let timer
            if (useCssAnimation) {
                timer = setTimeout(
                    () => setShouldRender(false),
                    CSS_CLOSE_DURATION
                )
            }
            return () => {
                if (timer) clearTimeout(timer)
            }
        }

        const id = Symbol("ModalView")
        enterModalMode(id)

        let timer
        if (useCssAnimation) {
            timer = setTimeout(() => setAnimate(true), 10)
        }

        return () => {
            if (timer) clearTimeout(timer)
            leaveModalMode(id)
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
                            ref={modalRef}
                            role="dialog"
                            aria-modal="true"
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
                            ref={modalRef}
                            role="dialog"
                            aria-modal="true"
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
