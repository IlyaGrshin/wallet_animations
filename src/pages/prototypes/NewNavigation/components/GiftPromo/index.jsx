import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import cx from "clsx"
import { animate } from "motion/react"
import * as m from "motion/react-m"

import Text from "../../../../../components/Text"

import * as styles from "./GiftPromo.module.scss"

const EXPAND_DELAY = 600
const EXPANDED_FOR = 5000
const COLLAPSED_WIDTH = 44

const pillSpring = { type: "spring", visualDuration: 0.4, bounce: 0.35 }
const settlePop = {
    type: "spring",
    velocity: 2,
    stiffness: 500,
    damping: 16,
    delay: 0.2,
}
const fade = { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
const shown = { opacity: 1, filter: "blur(0px)" }
const hidden = { opacity: 0, filter: "blur(8px)" }

let playedThisLoad = false

export default function GiftPromo({ icon, label }) {
    const [expanded, setExpanded] = useState(false)
    const rootRef = useRef(null)

    const toggle = (next) => {
        setExpanded(next)
        const pill = rootRef.current?.closest("button")
        if (!pill) return
        animate(1, 1, {
            ...settlePop,
            onUpdate: (value) => {
                pill.style.scale = value
            },
        })
    }

    useEffect(() => {
        if (playedThisLoad) return
        const id = setTimeout(() => {
            playedThisLoad = true
            toggle(true)
        }, EXPAND_DELAY)
        return () => clearTimeout(id)
    }, [])

    useEffect(() => {
        if (!expanded) return
        const id = setTimeout(() => toggle(false), EXPANDED_FOR)
        return () => clearTimeout(id)
    }, [expanded])

    return (
        <m.span
            ref={rootRef}
            className={styles.root}
            initial={false}
            animate={{ width: expanded ? "auto" : COLLAPSED_WIDTH }}
            transition={pillSpring}
        >
            <m.span
                className={styles.layer}
                initial={false}
                animate={expanded ? hidden : shown}
                transition={fade}
            >
                {icon}
            </m.span>
            <m.span
                className={styles.label}
                initial={false}
                animate={expanded ? shown : hidden}
                transition={fade}
                aria-hidden={!expanded}
            >
                <span className={cx(expanded && styles.shine)}>
                    <Text apple={{ variant: "body", weight: "semibold" }}>
                        {label}
                    </Text>
                </span>
            </m.span>
        </m.span>
    )
}

GiftPromo.propTypes = {
    icon: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
}
