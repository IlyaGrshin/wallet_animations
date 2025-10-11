import { useMemo, useRef } from "react"
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
    const isFirstRender = useRef(true)

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

    const handleClick = () => {
        onToggle()
        isFirstRender.current = false
    }

    return (
        <motion.div
            layout
            layoutDependency={view}
            className={styles.dropdownControl}
            onClick={handleClick}
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
                transition={{
                    ease: "easeOut",
                    duration: 0.5,
                }}
                initial={
                    isFirstRender.current
                        ? false
                        : {
                              opacity: 0,
                              // filter: "blur(5px)",
                          }
                }
                animate={{
                    opacity: 1,
                    // filter: "blur(0px)",
                    transition: {
                        delay: isFirstRender.current ? 0 : 0.1,
                    },
                }}
                key={`${view}-${view === "collapsed" ? activeSegment : ""}`}
            >
                {content}
            </motion.div>
        </motion.div>
    )
}
