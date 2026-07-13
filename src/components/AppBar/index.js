import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import { useHashLocation } from "wouter/use-hash-location"

import PanelHeader from "../PanelHeader"
import { useSplitViewContext } from "../SplitView/context"
import { isTelegram } from "../../lib/twa"
import ChevronLeftIcon from "../../icons/28/Chevron Left.svg?react"

import * as styles from "./AppBar.module.scss"

const findScroller = (node) => {
    let el = node?.parentElement
    while (el) {
        const overflowY = getComputedStyle(el).overflowY
        if (overflowY === "auto" || overflowY === "scroll") return el
        el = el.parentElement
    }
    return null
}

// Browser-only page header (renders null inside Telegram, where native chrome
// handles it). The back button is dropped in a SplitView detail pane, where the
// persistent sidebar already navigates.
const AppBar = ({ title, header = true, back = true }) => {
    const [, navigate] = useHashLocation()
    const { inDetailPane } = useSplitViewContext()
    const [scrolled, setScrolled] = useState(false)
    const barRef = useRef(null)
    const enabled = header !== false && !isTelegram()
    const showBack = back && !inDetailPane

    useEffect(() => {
        if (!enabled) return
        const scroller = findScroller(barRef.current)
        if (!scroller) return
        let raf = 0
        const onScroll = () => {
            if (raf) return
            raf = requestAnimationFrame(() => {
                raf = 0
                setScrolled(scroller.scrollTop > 2)
            })
        }
        onScroll()
        scroller.addEventListener("scroll", onScroll, { passive: true })
        return () => {
            scroller.removeEventListener("scroll", onScroll)
            if (raf) cancelAnimationFrame(raf)
        }
    }, [enabled])

    if (!enabled) return null

    return (
        <div
            ref={barRef}
            className={`${styles.bar} ${scrolled ? styles.scrolled : ""}`}
        >
            <PanelHeader
                {...(showBack && {
                    left: <ChevronLeftIcon />,
                    onLeft: () => navigate("/"),
                })}
            >
                {title}
            </PanelHeader>
        </div>
    )
}

AppBar.propTypes = {
    title: PropTypes.string,
    header: PropTypes.bool,
    back: PropTypes.bool,
}

export default AppBar
