import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { useTransform } from "motion/react"
import cx from "clsx"

import Tappable from "../Tappable"
import { layoutAction, SIZE } from "./geometry"

import * as styles from "./SwipeCell.module.scss"

const SwipeAction = ({
    action,
    slot,
    count,
    revealed,
    arm,
    sizeRef,
    onPress,
}) => {
    const layout = () => layoutAction(revealed.get(), arm.get(), slot, count)
    const isPrimary = slot === 0

    // Secondary: a circle translated into place. Primary: a full-row layer
    // clipped down to the pill, so stretching stays on clip-path, never width.
    const clipPath = useTransform(() => {
        if (!isPrimary) return "none"
        const { left, right, half } = layout()
        const { width, height } = sizeRef.current
        const vertical = Math.max(0, height / 2 - half)
        return `inset(${vertical}px ${right}px ${vertical}px ${width - left}px round ${half}px)`
    })
    const transform = useTransform(() => {
        const { center, iconCenter, scale } = layout()
        const offset = SIZE / 2 - (isPrimary ? iconCenter : center)
        return `translateX(${offset}px) scale(${scale})`
    })
    const opacity = useTransform(() => layout().opacity)

    const icon = (
        <m.span className={styles.icon} style={{ transform, opacity }}>
            {action.icon}
        </m.span>
    )

    if (isPrimary) {
        return (
            <Tappable
                as={m.button}
                type="button"
                aria-label={action.label}
                className={cx(styles.action, styles.primary)}
                style={{ clipPath, backgroundColor: action.color }}
                onClick={onPress}
            >
                {icon}
            </Tappable>
        )
    }

    return (
        <Tappable
            as={m.button}
            type="button"
            aria-label={action.label}
            className={cx(styles.action, styles.circle)}
            style={{ transform, opacity, backgroundColor: action.color }}
            onClick={onPress}
        >
            <span className={styles.icon}>{action.icon}</span>
        </Tappable>
    )
}

export const actionShape = PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.node,
    color: PropTypes.string,
    destructive: PropTypes.bool,
    onClick: PropTypes.func,
})

SwipeAction.propTypes = {
    action: actionShape.isRequired,
    slot: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    revealed: PropTypes.object.isRequired,
    arm: PropTypes.object.isRequired,
    sizeRef: PropTypes.shape({ current: PropTypes.object }).isRequired,
    onPress: PropTypes.func,
}

export default SwipeAction
