import { useRef, useState } from "react"
import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { useTransform } from "motion/react"
import cx from "clsx"

import { useResizeObserver } from "../../hooks/useResizeObserver"
import { useSkin } from "../../hooks/DeviceProvider"
import SwipeAction, { actionShape } from "./SwipeAction"
import { useSwipeCell } from "./useSwipeCell"
import { contentRadius, rawPull } from "./geometry"

import * as styles from "./SwipeCell.module.scss"

const APPLE_RADIUS = 24
const MATERIAL_RADIUS = 16

/**
 * Row with trailing swipe actions. Swiping left reveals the actions; pulling
 * further stretches the trailing one and, past the threshold (haptic), runs it
 * on release. Actions are listed leading to trailing; the last one is the
 * full-swipe action.
 * @param {Array} props.actions `{ key, label, icon, color, destructive, onClick }`.
 * A destructive full-swipe action leaves the row swiped out so the parent can
 * collapse it; its `onClick` may return (or resolve) `false` to keep the row
 * (cancelled confirm, undo). Any other action, or one that throws, springs
 * the row back.
 * @example
 * <SwipeCell actions={[{ key: "delete", label: "Delete", icon: <Trash />,
 *   color: "var(--tg-theme-destructive-text-color)", destructive: true,
 *   onClick: remove }]}>
 *   <Cell><Cell.Text title="Wallet" /></Cell>
 * </SwipeCell>
 */
const SwipeRow = ({ actions, children, className }) => {
    const rootRef = useRef(null)
    const sizeRef = useRef({ width: 0, height: 0 })
    const [width, setWidth] = useState(0)
    const count = actions.length
    const primary = actions[count - 1]

    // The observer's first callback lands before the first paint, so it is
    // the only measurement: the ref feeds per-frame transforms, the state the
    // drag constraint.
    useResizeObserver(rootRef, (entry) => {
        const [{ inlineSize, blockSize }] = entry.borderBoxSize
        sizeRef.current = { width: inlineSize, height: blockSize }
        setWidth(inlineSize)
    })

    const {
        x,
        pull,
        arm,
        revealed,
        isOpen,
        isDragging,
        isCommitting,
        commit,
        open,
        close,
        contentHandlers,
    } = useSwipeCell({
        rootRef,
        sizeRef,
        width,
        count,
        onCommit: async () => {
            // Without a callback nothing can remove the row, so it stays.
            if (!primary.onClick) return false
            const result = await primary.onClick()
            return Boolean(primary.destructive) && result !== false
        },
    })

    const { isApple } = useSkin()
    const cornerRadius = isApple ? APPLE_RADIUS : MATERIAL_RADIUS
    const clipPath = useTransform(revealed, (value) =>
        value > 0
            ? `inset(0px round ${contentRadius(value, cornerRadius)}px)`
            : "none"
    )

    const handlePress = (action, event) => {
        // A keyboard press (detail 0) keeps the row open so the focused
        // action stays visible; focus leaving the row closes it. A tap
        // closes it right away, like iOS.
        if (isCommitting) return
        const keyboard = event?.detail === 0
        if (action === primary) {
            commit({ keepOpen: keyboard })
            return
        }
        try {
            Promise.resolve(action.onClick?.()).catch(console.error)
        } catch (error) {
            console.error(error)
        } finally {
            if (!keyboard) close()
        }
    }

    return (
        <div
            ref={rootRef}
            className={cx(styles.root, className)}
            // Tabbing past the last action closes the row again.
            onBlur={(event) => {
                if (isOpen && !rootRef.current?.contains(event.relatedTarget))
                    close()
            }}
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
                        disabled={isCommitting}
                        onFocus={() => {
                            if (!isOpen && !isCommitting) open()
                        }}
                        onPress={(event) => handlePress(action, event)}
                    />
                ))}
            </div>
            <m.div
                className={styles.content}
                style={{ x, clipPath }}
                // Drag moves the raw pull; the content shows it rubber-banded.
                _dragX={pull}
                drag="x"
                dragDirectionLock
                dragConstraints={{
                    left: -rawPull(width, actions.length, width),
                    right: 0,
                }}
                dragElastic={{ left: 0, right: 0.08 }}
                dragMomentum={false}
                {...contentHandlers}
            >
                {children}
                <div
                    aria-hidden
                    className={cx(
                        styles.highlight,
                        isDragging && styles.dragging
                    )}
                />
            </m.div>
        </div>
    )
}

// No actions (e.g. all filtered out by permissions): a plain row, no gesture.
const SwipeCell = (props) =>
    props.actions.length > 0 ? <SwipeRow {...props} /> : props.children

SwipeRow.propTypes = SwipeCell.propTypes = {
    actions: PropTypes.arrayOf(actionShape).isRequired,
    children: PropTypes.node,
    className: PropTypes.string,
}

export default SwipeCell
