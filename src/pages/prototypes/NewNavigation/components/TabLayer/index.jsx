import { Activity, useRef, useState } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import cx from "clsx"

import { pageVariants } from "../../navigationConfig"
import useScrollRestoration from "../../../../../hooks/useScrollRestoration"

import * as styles from "./TabLayer.module.scss"

export default function TabLayer({
    retainKey,
    status,
    custom,
    animateMount,
    onExited,
    children,
}) {
    const ref = useRef(null)
    // Saved while active, restored on becoming active again — including a
    // remount after a pushed screen (an asset page) — where it was left.
    useScrollRestoration(ref, `scroll-${retainKey}`, {
        enabled: status === "active",
    })
    const target = status === "active" ? "animate" : "exit"
    const [settled, setSettled] = useState({ target, status, custom })

    if (settled.target !== target) {
        // Brought back before its exit finished: enter from where the exit
        // left it rather than snapping to the entrance pose first.
        const resume = target === "animate" && settled.status === "exiting"
        setSettled({ target, status, custom: { ...custom, resume } })
    } else if (settled.status !== status) {
        setSettled({ ...settled, status })
    }

    return (
        <m.div
            ref={ref}
            variants={pageVariants}
            custom={settled.custom}
            initial={animateMount ? "initial" : false}
            animate={target}
            onAnimationComplete={(definition) => {
                if (definition === "exit") onExited()
            }}
            className={cx(
                styles.layer,
                status === "active" && styles.active,
                status === "hidden" && styles.hidden
            )}
        >
            <Activity mode={status === "hidden" ? "hidden" : "visible"}>
                <div className={styles.body}>{children}</div>
            </Activity>
        </m.div>
    )
}

TabLayer.propTypes = {
    // Names the layer's saved scroll offset across remounts.
    retainKey: PropTypes.string.isRequired,
    status: PropTypes.oneOf(["active", "exiting", "hidden"]).isRequired,
    custom: PropTypes.object.isRequired,
    animateMount: PropTypes.bool,
    onExited: PropTypes.func.isRequired,
    children: PropTypes.node,
}
