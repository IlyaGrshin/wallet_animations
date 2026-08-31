import { forwardRef } from "react"
import PropTypes from "prop-types"
import cx from "clsx"

import Text from "../../../Text"
import ClearAppleSVG from "../../../../images/clear_apple.svg?react"
import * as styles from "./EditableCell.module.scss"

const EditableCell = forwardRef(
    ({ label, value, onChange, onClear, ...rest }, ref) => {
        const handleChange = (e) => {
            onChange(e.target.value)
        }

        return (
            <Text
                variant="body"
                weight="regular"
                className={cx(styles.root, !value && styles.empty)}
            >
                <input
                    aria-label={label}
                    onChange={handleChange}
                    type="text"
                    className={styles.input}
                    placeholder={label}
                    value={value}
                    readOnly={!onChange}
                    ref={ref}
                    {...rest}
                />
                {onClear && (
                    <button
                        type="button"
                        className={cx(styles.icon, styles.clearButtonIcon)}
                        onClick={onClear}
                    >
                        <ClearAppleSVG />
                    </button>
                )}
            </Text>
        )
    }
)

EditableCell.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    onClear: PropTypes.func,
}

export default EditableCell
