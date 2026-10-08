import { Activity, useLayoutEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import cx from "clsx"

import { pageVariants } from "../../navigationConfig"

import * as styles from "./TabLayer.module.scss"

export default function TabLayer({
    status,
    custom,
    animateMount,
    onExited,
    children,
}) {
    const ref = useRef(null)
    const scrollTopRef = useRef(0)
    const target = status === "active" ? "animate" : "exit"
    const [settled, setSettled] = useState({ target, custom })

    if (settled.target !== target) setSettled({ target, custom })

    useLayoutEffect(() => {
        if (status === "active" && scrollTopRef.current > 0) {
            ref.current.scrollTop = scrollTopRef.current
        }
    }, [status])

    return (
        <m.div
            ref={ref}
            variants={pageVariants}
            custom={settled.custom}
            initial={animateMount ? "initial" : false}
            animate={target}
            onScroll={(event) => {
                if (status === "active") {
                    scrollTopRef.current = event.currentTarget.scrollTop
                }
            }}
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
    status: PropTypes.oneOf(["active", "exiting", "hidden"]).isRequired,
    custom: PropTypes.object.isRequired,
    animateMount: PropTypes.bool,
    onExited: PropTypes.func.isRequired,
    children: PropTypes.node,
}
