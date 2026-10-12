import { useEffect, useRef } from "react"
import PropTypes from "prop-types"
import { useIsPresent } from "motion/react"
import { useHashLocation } from "wouter/use-hash-location"
import WebApp from "./webApp"

// Telegram calls every registered back handler, so a page, a modal on top of
// it and a transient menu would all react to one press. Instead a single
// dispatcher calls only the most recently mounted BackButton: the topmost
// layer consumes the press, and the one below takes over once it unmounts.
const stack = []
let subscribed = false
const dispatch = () => stack[stack.length - 1]?.current()

const BackButton = ({ onClick }) => {
    const [, navigate] = useHashLocation()
    const isPresent = useIsPresent()
    // A stable stack entry: a new onClick updates it in place, so re-renders
    // never reorder the stack.
    const handler = onClick ?? (() => navigate("/"))
    const entry = useRef(handler)
    useEffect(() => {
        entry.current = handler
    })

    // A screen playing its exit animation leaves the stack at once, so the
    // one under it takes the back button while it slides away.
    useEffect(() => {
        if (!isPresent) return
        if (!subscribed) {
            WebApp.BackButton.onClick(dispatch)
            subscribed = true
        }
        stack.push(entry)
        WebApp.BackButton.show()
        return () => {
            stack.splice(stack.lastIndexOf(entry), 1)
            if (stack.length === 0) WebApp.BackButton.hide()
        }
    }, [isPresent])

    return null
}

BackButton.propTypes /* remove-proptypes */ = {
    onClick: PropTypes.func,
}

export default BackButton
