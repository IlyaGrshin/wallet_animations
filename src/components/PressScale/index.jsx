import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { useReducedMotion } from "motion/react"

import Tappable from "../Tappable"
import { useSkin } from "../../hooks/DeviceProvider"

const PRESS = {
    whileTap: { scale: 0.97 },
    transition: { scale: { type: "spring", stiffness: 600, damping: 35 } },
}

/**
 * A card-sized button that sinks a little while pressed, on a spring: a quick
 * tap still reads, and a release mid-way settles back from wherever it got
 * to. On iOS the scale is the whole feedback; Material keeps its ripple on
 * top. No scale under reduced motion. Extra props go to the button.
 * @example
 * <PressScale className={styles.card} onClick={open}>{content}</PressScale>
 */
export default function PressScale({ children, ...props }) {
    const { isApple } = useSkin()
    const reduceMotion = useReducedMotion()
    const Root = isApple ? m.button : Tappable

    return (
        <Root
            type="button"
            {...(!isApple && { as: m.button })}
            {...(!reduceMotion && PRESS)}
            {...props}
        >
            {children}
        </Root>
    )
}

PressScale.propTypes = {
    children: PropTypes.node,
}
