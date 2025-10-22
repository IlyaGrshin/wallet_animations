import PropTypes from "prop-types"
import { forwardRef } from "react"
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
                apple={{ variant: "body", weight: "regular" }}
                material={{ variant: "body1", weight: "regular" }}
                className={[styles.root, !value && styles.empty]
                    .filter(Boolean)
                    .join(" ")}
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
                        className={[styles.icon, styles.clearButtonIcon]
                            .filter(Boolean)
                            .join(" ")}
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
