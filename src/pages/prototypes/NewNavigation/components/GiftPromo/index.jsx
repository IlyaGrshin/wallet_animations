import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import cx from "clsx"
import { animate, useReducedMotion } from "motion/react"
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
const instant = { duration: 0 }
const reducedFade = { duration: 0.15, ease: "easeOut" }
const reducedShown = { opacity: 1 }
const reducedHidden = { opacity: 0 }

let playedThisLoad = false

export default function GiftPromo({ icon, label }) {
    const [expanded, setExpanded] = useState(false)
    const [wide, setWide] = useState(false)
    const rootRef = useRef(null)
    const reduceMotion = useReducedMotion()
    const visible = reduceMotion ? reducedShown : shown
    const invisible = reduceMotion ? reducedHidden : hidden
    const swapFade = reduceMotion ? reducedFade : fade

    const toggle = (next) => {
        setExpanded(next)
        if (next) setWide(true)
        const pill = rootRef.current?.closest("button")
        if (!pill || reduceMotion) return
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
            transition={reduceMotion ? instant : pillSpring}
            onAnimationComplete={() => {
                if (!expanded) setWide(false)
            }}
            data-header-wide={wide || undefined}
        >
            <m.span
                className={styles.layer}
                initial={false}
                animate={expanded ? invisible : visible}
                transition={swapFade}
            >
                {icon}
            </m.span>
            <m.span
                className={styles.label}
                initial={false}
                animate={expanded ? visible : invisible}
                transition={swapFade}
                aria-hidden={!expanded}
            >
                <span className={cx(expanded && !reduceMotion && styles.shine)}>
                    <Text
                        apple={{ variant: "body", weight: "semibold" }}
                        material={{ variant: "body", weight: "medium" }}
                    >
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
