import { useEffect, useRef } from "react"
import PropTypes from "prop-types"
import cx from "clsx"

import { haptic } from "../../lib/twa"
import { ReorderContext } from "./context"
import ReorderItem from "./ReorderItem"

import * as styles from "./ReorderList.module.scss"

const centerOf = (element) => element.offsetTop + element.offsetHeight / 2
const DEADBAND = 1

/**
 * Drag-to-reorder rows. Touch and hold a row to lift it (iOS drag, Material
 * long press), or turn on `editing` to show reorder handles that lift on touch
 * (iOS edit mode, Material drag handle). Neighbours make way as the lifted row
 * passes their centre; `onReorder` fires with the new order on every step.
 * Handles also move their row with the arrow keys.
 * @param {Array} props.values The order, one entry per `ReorderList.Item value`.
 * @param {(values: Array) => void} props.onReorder Receives the reordered array.
 * @param {boolean} [props.editing=false] Show handles instead of long press.
 * @example
 * <SectionList.Item header="Assets">
 *   <ReorderList values={ids} onReorder={setIds}>
 *     {ids.map((id) => (
 *       <ReorderList.Item key={id} value={id} label={names[id]}>
 *         <Cell><Cell.Text title={names[id]} /></Cell>
 *       </ReorderList.Item>
 *     ))}
 *   </ReorderList>
 * </SectionList.Item>
 */
const ReorderList = ({
    values,
    onReorder,
    editing = false,
    children,
    className,
}) => {
    const groupRef = useRef(null)
    const itemsRef = useRef(new Map())
    const pendingRef = useRef(false)

    useEffect(() => {
        pendingRef.current = false
    })

    const moveTo = (value, to) => {
        const from = values.indexOf(value)
        if (from === -1 || to === from || to < 0 || to >= values.length)
            return false
        const next = [...values]
        next.splice(from, 1)
        next.splice(to, 0, value)
        pendingRef.current = true
        haptic.selection()
        onReorder(next)
        return true
    }

    const context = {
        groupRef,
        editing,
        register: (value, element) => {
            itemsRef.current.set(value, element)
            return () => {
                if (itemsRef.current.get(value) === element)
                    itemsRef.current.delete(value)
            }
        },
        track: (value, offset) => {
            if (pendingRef.current) return
            const items = itemsRef.current
            const index = values.indexOf(value)
            const element = items.get(value)
            if (!element) return
            const top = element.offsetTop + offset
            const bottom = top + element.offsetHeight
            const below = items.get(values[index + 1])
            const above = items.get(values[index - 1])
            if (below && bottom >= centerOf(below) + DEADBAND)
                moveTo(value, index + 1)
            else if (above && top <= centerOf(above) - DEADBAND)
                moveTo(value, index - 1)
        },
        step: (value, by) => moveTo(value, values.indexOf(value) + by),
    }

    return (
        <ReorderContext.Provider value={context}>
            <div ref={groupRef} className={cx(styles.group, className)}>
                {children}
            </div>
        </ReorderContext.Provider>
    )
}

ReorderList.propTypes = {
    values: PropTypes.array.isRequired,
    onReorder: PropTypes.func.isRequired,
    editing: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.string,
}

ReorderList.Item = ReorderItem

export default ReorderList
