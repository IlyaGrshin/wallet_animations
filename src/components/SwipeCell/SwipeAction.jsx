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
    disabled,
    onFocus,
    onPress,
}) => {
    const isPrimary = slot === 0
    // One layout pass per frame; the styles below only read from it.
    const layout = useTransform(() =>
        layoutAction(
            revealed.get(),
            arm.get(),
            slot,
            count,
            sizeRef.current.width
        )
    )

    // Secondary: a circle translated into place. Primary: a full-row layer
    // clipped down to the pill, so stretching stays on clip-path, never width.
    const clipPath = useTransform(layout, ({ left, right, half }) => {
        if (!isPrimary) return "none"
        const { width, height } = sizeRef.current
        const vertical = Math.max(0, height / 2 - half)
        return `inset(${vertical}px ${right}px ${vertical}px ${width - left}px round ${half}px)`
    })
    const transform = useTransform(layout, ({ center, iconCenter, scale }) => {
        const offset = SIZE / 2 - (isPrimary ? iconCenter : center)
        return `translateX(${offset}px) scale(${scale})`
    })
    const opacity = useTransform(layout, (l) => l.opacity)

    // The primary moves only its icon inside the clipped pill; a secondary
    // moves the whole circle.
    const moving = { transform, opacity }

    return (
        <Tappable
            as={m.button}
            type="button"
            aria-label={action.label}
            aria-disabled={disabled || undefined}
            // Keyboard path: focusing an action reveals the row, so focus never
            // lands on a control hidden behind the content.
            onFocus={onFocus}
            className={cx(
                styles.action,
                isPrimary ? styles.primary : styles.circle
            )}
            style={{
                backgroundColor: action.color,
                ...(isPrimary ? { clipPath } : moving),
            }}
            onClick={disabled ? undefined : onPress}
        >
            <m.span
                className={styles.icon}
                style={isPrimary ? moving : undefined}
            >
                {action.icon}
            </m.span>
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
    disabled: PropTypes.bool,
    onFocus: PropTypes.func,
    onPress: PropTypes.func,
}

export default SwipeAction
