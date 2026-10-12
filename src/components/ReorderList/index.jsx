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
 * Handles also move their row with the arrow keys, announcing each result.
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
    const pendingRef = useRef(null)
    const queuedRef = useRef(null)
    const statusRef = useRef(null)

    // Written straight into the live region, emptied first, so a repeated
    // message (pressing on at an end) is announced again, and announcing
    // doesn't re-render the list.
    const announce = (message) => {
        const status = statusRef.current
        if (!status) return
        status.textContent = ""
        requestAnimationFrame(() => {
            status.textContent = message
        })
    }

    const moveTo = (value, to) => {
        const from = values.indexOf(value)
        if (from === -1 || to === from || to < 0 || to >= values.length)
            return false
        const next = [...values]
        next.splice(from, 1)
        next.splice(to, 0, value)
        pendingRef.current = values
        haptic.selection()
        onReorder(next)
        return true
    }

    // While a reorder is waiting for its `values` to commit, positions can't be
    // measured against the order on screen, so the latest one is kept and
    // replayed once the commit lands: a slow parent never drops the row short
    // of where the pointer went.
    const track = (value, top) => {
        if (pendingRef.current === values) {
            queuedRef.current = { value, top }
            return
        }
        queuedRef.current = null
        const items = itemsRef.current
        const index = values.indexOf(value)
        const element = items.get(value)
        if (!element) return
        const bottom = top + element.offsetHeight
        const crossed = (at) => {
            const other = items.get(values[at])
            if (!other) return false
            return at > index
                ? bottom >= centerOf(other) + DEADBAND
                : top <= centerOf(other) - DEADBAND
        }
        let to = index
        while (crossed(to + 1)) to += 1
        if (to === index) while (crossed(to - 1)) to -= 1
        moveTo(value, to)
    }

    useEffect(() => {
        const queued = queuedRef.current
        if (queued && pendingRef.current !== values)
            track(queued.value, queued.top)
    }, [values])

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
        track,
        // Keyboard moves have no visual cue for a screen reader, so each
        // result is spoken: the new place, or that the row is already at an end.
        step: (value, by, label) => {
            const from = values.indexOf(value)
            if (from === -1) return false
            const to = Math.min(values.length - 1, Math.max(0, from + by))
            const moved = moveTo(value, to)
            announce(
                moved
                    ? `Moved ${label} to position ${to + 1} of ${values.length}`
                    : `${label} is already ${to ? "last" : "first"}`
            )
            return moved
        },
    }

    return (
        <ReorderContext.Provider value={context}>
            <div
                ref={groupRef}
                role="list"
                className={cx(styles.group, className)}
            >
                {children}
            </div>
            <div
                ref={statusRef}
                role="status"
                aria-live="polite"
                className={styles.status}
            />
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
