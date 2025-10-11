import { useMemo } from "react"
import { motion } from "motion/react"

import * as styles from "./NavigationPanel.module.scss"
import CollapsedView from "./CollapsedView"
import ExpandedView from "./ExpandedView"

export default function DropdownControl({
    view,
    activeSegment,
    onSegmentChange,
    onToggle,
    colorScheme,
}) {
    const content = useMemo(() => {
        switch (view) {
            case "expanded":
                return (
                    <ExpandedView
                        activeSegment={activeSegment}
                        onSegmentChange={onSegmentChange}
                    />
                )
            case "collapsed":
            default:
                return <CollapsedView activeSegment={activeSegment} />
        }
    }, [view, activeSegment, onSegmentChange])

    return (
        <motion.div
            layout
            layoutDependency={view}
            className={styles.dropdownControl}
            onClick={onToggle}
            transition={{
                layout: {
                    type: "spring",
                    bounce: 0.2,
                    duration: 0.5,
                },
            }}
            style={{ borderRadius: 26 }}
            data-expanded={view === "expanded"}
            data-color-scheme={colorScheme}
        >
            <motion.div
                className={styles.contentWrapper}
                initial={{ opacity: 0 }}
                animate={{
                    opacity: 1,
                    transition: {
                        delay: 0.1,
                        ease: "easeOut",
                        duration: 0.3,
                    },
                }}
                key={`${view}-${view === "collapsed" ? activeSegment : ""}`}
            >
                {content}
            </motion.div>
        </motion.div>
    )
}
