import { useState } from "react"
import PropTypes from "prop-types"
import * as styles from "./Switch.module.scss"

function Switch({
    value,
    defaultValue = false,
    onChange,
    disabled = false,
    className,
}) {
    const isControlled = value !== undefined
    const [uncontrolled, setUncontrolled] = useState(defaultValue)
    const checked = isControlled ? value : uncontrolled

    const emitChange = (next) => {
        if (onChange) onChange(next)
    }

    const setChecked = (next) => {
        if (!isControlled) setUncontrolled(next)
        emitChange(next)
    }

    const toggle = () => {
        if (isControlled) {
            emitChange(!checked)
            return
        }

        setUncontrolled((prev) => {
            const next = !prev
            emitChange(next)
            return next
        })
    }

    const handleClick = (e) => {
        e.stopPropagation()
        if (disabled) return
        toggle()
    }

    const cx = className ? `${styles.root} ${className}` : styles.root

    return (
        <div
            className={cx}
            data-state={checked}
            data-disabled={disabled || undefined}
            onClick={handleClick}
            role="switch"
            aria-checked={checked}
            aria-disabled={disabled || undefined}
        ></div>
    )
}

Switch.propTypes = {
    value: PropTypes.bool,
    defaultValue: PropTypes.bool,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    className: PropTypes.string,
}
export default Switch
