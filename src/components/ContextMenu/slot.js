import { cloneElement } from "react"
import cx from "clsx"
import { mergeRefs } from "../../utils/mergeRefs"

/**
 * Puts the gesture straight onto the child element instead of a wrapper, so
 * any tappable keeps its own layout (flex item, inline, full width...). The
 * child must forward `ref`, `className` and pointer handlers to its DOM node.
 * Handlers on the same event run the child's first, then ours.
 */
export const withGesture = (child, { ref, className, handlers }) => {
    const own = child.props
    const merged = {}
    for (const [key, handler] of Object.entries(handlers)) {
        const ownHandler = own[key]
        merged[key] = ownHandler
            ? (event) => {
                  ownHandler(event)
                  handler(event)
              }
            : handler
    }
    return cloneElement(child, {
        ...merged,
        className: cx(own.className, className),
        ref: mergeRefs(own.ref, ref),
    })
}
