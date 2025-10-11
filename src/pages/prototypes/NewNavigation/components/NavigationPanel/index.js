import { useState, useEffect } from "react"
import { motion } from "motion/react"
import WebApp from "@twa-dev/sdk"

import { useColorScheme } from "../../../../../hooks/useColorScheme"
import { blendColors } from "../../../../../utils/common"
import * as styles from "./NavigationPanel.module.scss"
import QRCodeIcon from "../../../../../icons/28/QR Code.svg?react"
import DropdownControl from "./DropdownControl"

export default function NavigationPanel({
    avatarUrl,
    activeSegment,
    onSegmentChange,
}) {
    const [view, setView] = useState("collapsed")
    const colorScheme = useColorScheme(activeSegment === 1 ? "dark" : "light")

    const handleToggle = () => {
        const newView = view === "collapsed" ? "expanded" : "collapsed"
        setView(newView)
    }

    useEffect(() => {
        const cw_color = WebApp.themeParams.secondary_bg_color || "#EFEFF4"
        const tw_color = "#131314"

        const headerColor = activeSegment === 1 ? tw_color : cw_color
        const headerColorWithOverlay = `#${blendColors(
            headerColor,
            "#000000",
            0.12
        )}`

        if (view === "expanded") {
            WebApp.setHeaderColor(headerColorWithOverlay)
        } else {
            WebApp.setHeaderColor(headerColor)
        }
    }, [view, activeSegment])

    return (
        <div className={styles.navPanel} data-color-scheme={colorScheme}>
            <motion.div
                className={styles.overlay}
                initial={false}
                animate={{
                    opacity: view === "expanded" ? 1 : 0,
                    pointerEvents: view === "expanded" ? "auto" : "none",
                }}
                transition={{
                    duration: 0.3,
                }}
                onClick={handleToggle}
            />
            <div className={`${styles.bounds} ${styles.transparent}`}>
                <div
                    className={styles.avatar}
                    style={{ backgroundImage: `url(${avatarUrl})` }}
                ></div>
            </div>
            <div className={styles.dropdownWrapper}>
                <DropdownControl
                    view={view}
                    activeSegment={activeSegment}
                    onSegmentChange={onSegmentChange}
                    onToggle={handleToggle}
                />
            </div>
            <div className={styles.bounds}>
                <QRCodeIcon />
            </div>
        </div>
    )
}
