import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"
import * as styles from "./ModalView.module.scss"

import WebApp, { BackButton } from "../../lib/twa"

import ModalPage, { parsePages } from "./ModalPage"
import TrayPages from "./TrayPages"
import { useDismissDrag } from "./useDismissDrag"
import { blendColors } from "../../utils/common"
import { useFocusTrap } from "../../hooks/useFocusTrap"
import { useSplitView } from "../../hooks/useSplitView"
import { SPRING } from "../../utils/animations"

const getHeaderColor = () => WebApp.themeParams.secondary_bg_color || "#EFEFF4"

// Entrance/exit read the viewport at animation time (not mount time) so the
// slide stays correct after keyboard-driven viewport resizes.
const panelVariants = {
    hidden: () => ({ y: window.innerHeight }),
    visible: { y: 0, transition: SPRING.MODAL },
    exit: () => ({
        y: window.innerHeight,
        transition: { duration: 0.2, ease: "easeOut" },
    }),
}

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2, ease: "linear" } },
    exit: { opacity: 0, transition: { duration: 0.2, ease: "linear" } },
}

const ModalView = ({
    isOpen,
    onClose,
    initialPage,
    style,
    children,
    ...props
}) => {
    const modalRef = useRef(null)
    const isWide = useSplitView()

    const pages = parsePages(children)
    const isTray = pages !== null
    const rootId = initialPage ?? pages?.[0]?.id

    const [nav, setNav] = useState({
        stack: [rootId],
        direction: 0,
        wasOpen: isOpen,
    })
    // Reset to the root page when (re)opening; keep the stack while closing so
    // the exiting panel still shows the page the user was on.
    if (isOpen !== nav.wasOpen) {
        setNav(
            isOpen
                ? { stack: [rootId], direction: 0, wasOpen: true }
                : { ...nav, wasOpen: false }
        )
    }

    const canPop = nav.stack.length > 1
    const activeId = nav.stack[nav.stack.length - 1]
    const push = (id) =>
        setNav((state) => ({
            ...state,
            stack: [...state.stack, id],
            direction: 1,
        }))
    const pop = () =>
        setNav((state) =>
            state.stack.length > 1
                ? { ...state, stack: state.stack.slice(0, -1), direction: -1 }
                : state
        )

    const {
        y,
        overlayOpacity,
        dragProps,
        onPanelPointerDown,
    } = useDismissDrag({ onClose, panelRef: modalRef })

    useFocusTrap(modalRef, isOpen)

    useEffect(() => {
        const headerColor = getHeaderColor()
        const headerColorWithOverlay = `#${blendColors(headerColor, "#000000", 0.5)}`

        if (isOpen) {
            document.body.style.overflow = "hidden"
            WebApp.disableVerticalSwipes?.()
            WebApp.setHeaderColor(headerColorWithOverlay)
        } else {
            document.body.style.overflow = "auto"
            WebApp.enableVerticalSwipes?.()
            WebApp.setHeaderColor(headerColor)
        }
    }, [isOpen])

    // Escape mirrors the BackButton: pop first, close from the root page.
    useEffect(() => {
        if (!isOpen) return
        const onKeyDown = (event) => {
            if (event.key !== "Escape") return
            if (canPop) pop()
            else onClose()
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [isOpen, canPop, pop, onClose])

    useEffect(
        () => () => {
            document.body.style.overflow = "auto"
            WebApp.enableVerticalSwipes?.()
            WebApp.setHeaderColor(getHeaderColor())
        },
        []
    )

    const overlayClass = [
        styles.overlay,
        isWide ? styles.centered : styles.sheet,
    ].join(" ")
    // The panel is a child of the overlay, so overlay opacity dims everything
    // inside. On the phone sheet that must not track the drag — the sheet
    // stays opaque and slides; the overlay gets a plain enter/exit fade. Only
    // the centered split-view dialog fades along with the gesture.
    const overlayMotion = isWide
        ? { style: { opacity: overlayOpacity } }
        : {
              variants: overlayVariants,
              initial: "hidden",
              animate: "visible",
              exit: "exit",
          }
    const panelClass = [
        styles.panel,
        isWide ? styles.dialog : styles.bottomSheet,
        isTray ? styles.tray : styles.plain,
    ].join(" ")

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <BackButton onClick={canPop ? pop : onClose} />
                    <m.div
                        className={overlayClass}
                        {...overlayMotion}
                        onClick={onClose}
                    >
                        <m.div
                            ref={modalRef}
                            role="dialog"
                            aria-modal="true"
                            className={panelClass}
                            variants={panelVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            style={{ ...style, y }}
                            {...dragProps}
                            onPointerDown={onPanelPointerDown}
                            onClick={(event) => event.stopPropagation()}
                            {...props}
                        >
                            {isTray ? (
                                <TrayPages
                                    pages={pages}
                                    activeId={activeId}
                                    depth={nav.stack.length}
                                    direction={nav.direction}
                                    nav={{
                                        push,
                                        pop,
                                        canPop,
                                        activeId,
                                        close: onClose,
                                    }}
                                />
                            ) : (
                                <div className={styles.content}>
                                    {children}
                                </div>
                            )}
                        </m.div>
                    </m.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}

ModalView.Page = ModalPage

ModalView.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    initialPage: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
}

export default ModalView
