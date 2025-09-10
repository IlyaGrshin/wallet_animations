import Text from "../../../Text"
import * as styles from "./CellPart.module.scss"

export const CellPart = ({
    type,
    className,
    children,
    value,
    onChange,
    inputRef,
    id,
    name = "color",
    showValue = true,
}) => {
    if (type === "Picker") {
        return (
            <div className={styles.picker}>
                <Text
                    apple={{ variant: "body", weight: "regular" }}
                    material={{ variant: "body1", weight: "regular" }}
                >
                    {children}
                </Text>
            </div>
        )
    }

    if (type === "ColorPicker") {
        const inputId = id || name
        return (
            <div className={styles.colorpicker}>
                <input
                    ref={inputRef}
                    type="color"
                    value={value}
                    onChange={onChange}
                    name={name}
                    id={inputId}
                />
                {showValue && (
                    <label htmlFor={inputId}>
                        <Text
                            apple={{ variant: "body", weight: "regular" }}
                            material={{ variant: "body1", weight: "regular" }}
                        >
                            {value}
                        </Text>
                    </label>
                )}
            </div>
        )
    }

    return (
        <div
            className={[styles[type.toLowerCase()], styles[className]]
                .filter(Boolean)
                .join(" ")}
        >
            {children}
        </div>
    )
}

export default CellPart
