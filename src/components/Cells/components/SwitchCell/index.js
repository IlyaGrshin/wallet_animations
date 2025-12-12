import { useState } from "react"
import PropTypes from "prop-types"
import Cell from "../../index"
import Switch from "../../../Switch"

const SwitchCell = ({
    start,
    children,
    value,
    defaultValue = false,
    onChange,
    disabled = false,
    ...props
}) => {
    const isControlled = value !== undefined
    const [uncontrolled, setUncontrolled] = useState(defaultValue)
    const checked = isControlled ? value : uncontrolled

    const setChecked = (next) => {
        if (!isControlled) setUncontrolled(next)
        if (onChange) onChange(next)
    }

    const handleClick = () => {
        if (disabled) return
        setChecked(!checked)
    }

    return (
        <Cell
            start={start}
            end={
                <Cell.Part type="Switch">
                    <Switch
                        value={checked}
                        onChange={setChecked}
                        disabled={disabled}
                    />
                </Cell.Part>
            }
            onClick={handleClick}
            {...props}
        >
            {children}
        </Cell>
    )
}

SwitchCell.propTypes = {
    start: PropTypes.node,
    children: PropTypes.node,
    value: PropTypes.bool,
    defaultValue: PropTypes.bool,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
}

export default SwitchCell
