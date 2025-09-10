import { useState, useCallback } from "react"
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

    const setChecked = useCallback(
        (next) => {
            if (!isControlled) setUncontrolled(next)
            if (onChange) onChange(next)
        },
        [isControlled, onChange]
    )

    const toggle = useCallback(() => {
        setChecked(!checked)
    }, [checked, setChecked])

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

export default Switch
