import { useLayoutEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import cx from "clsx"

import { useSkin } from "../../hooks/DeviceProvider"
import { useResizeObserver } from "../../hooks/useResizeObserver"
import SwipeAction, { actionShape } from "./SwipeAction"
import { useSwipeCell } from "./useSwipeCell"

import * as styles from "./SwipeCell.module.scss"

/**
 * Row with trailing swipe actions. Swiping left reveals the actions; pulling
 * further stretches the trailing one and, past the threshold (haptic), runs it
 * on release. Actions are listed leading to trailing; the last one is the
 * full-swipe action.
 * @param {Array} props.actions `{ key, label, icon, color, destructive, onClick }`.
 * A destructive full-swipe action leaves the row swiped out so the parent can
 * collapse it; any other action springs the row back after `onClick`.
 * @example
 * <SwipeCell actions={[{ key: "delete", label: "Delete", icon: <Trash />,
 *   color: "var(--tg-theme-destructive-text-color)", destructive: true,
 *   onClick: remove }]}>
 *   <Cell><Cell.Text title="Wallet" /></Cell>
 * </SwipeCell>
 */
const SwipeCell = ({ actions, children, className }) => {
    const { isApple } = useSkin()
    const rootRef = useRef(null)
    const sizeRef = useRef({ width: 0, height: 0 })
    const [width, setWidth] = useState(0)
    const count = actions.length
    const primary = actions[count - 1]

    const measure = () => {
        const el = rootRef.current
        if (!el) return
        sizeRef.current = { width: el.offsetWidth, height: el.offsetHeight }
        setWidth(el.offsetWidth)
    }
    useLayoutEffect(measure, [])
    useResizeObserver(rootRef, measure)

    const { x, arm, revealed, commit, close, contentHandlers } = useSwipeCell({
        rootRef,
        sizeRef,
        count,
        onCommit: async () => {
            await primary.onClick?.()
            return !primary.destructive
        },
    })

    const handlePress = (action) => {
        if (action === primary) {
            commit()
            return
        }
        action.onClick?.()
        close()
    }

    return (
        <div
            ref={rootRef}
            className={cx(
                styles.root,
                isApple ? styles.apple : styles.material,
                className
            )}
        >
            <div className={styles.actions}>
                {actions.map((action, index) => (
                    <SwipeAction
                        key={action.key}
                        action={action}
                        slot={count - 1 - index}
                        count={count}
                        revealed={revealed}
                        arm={arm}
                        sizeRef={sizeRef}
                        isApple={isApple}
                        onPress={() => handlePress(action)}
                    />
                ))}
            </div>
            <m.div
                className={styles.content}
                style={{ x }}
                drag="x"
                dragDirectionLock
                dragConstraints={{ left: -width, right: 0 }}
                dragElastic={{ left: 0, right: 0.08 }}
                dragMomentum={false}
                {...contentHandlers}
            >
                {children}
            </m.div>
        </div>
    )
}

SwipeCell.propTypes = {
    actions: PropTypes.arrayOf(actionShape).isRequired,
    children: PropTypes.node,
    className: PropTypes.string,
}

export default SwipeCell
