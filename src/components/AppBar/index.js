import PropTypes from "prop-types"
import { useHashLocation } from "wouter/use-hash-location"

import PanelHeader from "../PanelHeader"
import { useSplitViewContext } from "../SplitView/context"
import { useScrolled } from "../../hooks/useScrolled"
import { isTelegram } from "../../lib/twa"

import * as styles from "./AppBar.module.scss"

// Browser-only page header (renders null inside Telegram, where native chrome
// handles it). The back button is dropped in a SplitView detail pane, where the
// persistent sidebar already navigates.
const AppBar = ({ title, header = true, back = true }) => {
    const [, navigate] = useHashLocation()
    const { inDetailPane } = useSplitViewContext()
    const enabled = header !== false && !isTelegram()
    const showBack = back && !inDetailPane
    const [barRef, scrolled] = useScrolled(enabled)

    if (!enabled) return null

    return (
        <div
            ref={barRef}
            className={`${styles.bar} ${scrolled ? styles.scrolled : ""}`}
        >
            <PanelHeader
                {...(showBack && {
                    left: <PanelHeader.BackIcon />,
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
