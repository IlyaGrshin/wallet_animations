import Text from "../../../Text"
import * as styles from "./CellPart.module.scss"

export const CellPart = ({ type, className, children }) => {
    if (type === "Picker") {
        return (
            <div className={styles.picker}>
                <Text
                    apple={{
                        variant: "body",
                        weight: "regular",
                    }}
                    material={{
                        variant: "body1",
                        weight: "regular",
                    }}
                >
                    {children}
                </Text>
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
