import PropTypes from "prop-types"
import { motion } from "motion/react"
import { GlassContainer } from "../../../../../components/GlassEffect"
import * as styles from "./NavigationPanel.module.scss"
import CollapsedView from "./CollapsedView"
import ExpandedView from "./ExpandedView"

export default function DropdownControl({
    view,
    activeSegment,
    onSegmentChange,
    onToggle,
}) {
    let content
    switch (view) {
        case "expanded":
            content = (
                <ExpandedView
                    activeSegment={activeSegment}
                    onSegmentChange={onSegmentChange}
                />
            )
            break
        case "collapsed":
        default:
            content = <CollapsedView activeSegment={activeSegment} />
    }

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
        >
            <GlassContainer />
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

DropdownControl.propTypes = {
    view: PropTypes.string,
    activeSegment: PropTypes.number,
    onSegmentChange: PropTypes.func,
    onToggle: PropTypes.func,
}
