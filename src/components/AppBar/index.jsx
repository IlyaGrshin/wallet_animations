import PropTypes from "prop-types"
import { useHashLocation } from "wouter/use-hash-location"

import PanelHeader from "../PanelHeader"
import { useSplitViewContext } from "../SplitView/context"
import { isTelegram } from "../../lib/twa"

// Browser-only page header (renders null inside Telegram, where native chrome
// handles it). The back button is dropped in a SplitView detail pane, where the
// persistent sidebar already navigates.
const AppBar = ({ title, header = true, back = true }) => {
    const [, navigate] = useHashLocation()
    const { inDetailPane } = useSplitViewContext()

    if (header === false || isTelegram()) return null

    const showBack = back && !inDetailPane

    return (
        <PanelHeader
            pin={inDetailPane ? "sticky" : "fixed"}
            {...(showBack && {
                left: <PanelHeader.BackIcon />,
                onLeft: () => navigate("/"),
            })}
        >
            {title}
        </PanelHeader>
    )
}

AppBar.propTypes = {
    title: PropTypes.string,
    header: PropTypes.bool,
    back: PropTypes.bool,
}

export default AppBar
