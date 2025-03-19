import Text from "../../../Text"
import * as styles from "./CellText.module.scss"

const CellText = ({ type, title, description, bold }) => {
    const weight = bold ? "medium" : "regular"
    const name = `${styles.label} ${type === "Accent" ? styles.accent : ""}`

    return (
        <>
            <Text
                apple={{ variant: "body", weight: weight }}
                material={{ variant: "body1", weight: weight }}
                className={name}
            >
                {title}
            </Text>
            {description && (
                <Text
                    apple={{ variant: "subheadline2", weight: "regular" }}
                    material={{ variant: "subtitle2", weight: "regular" }}
                    className={styles.caption}
                >
                    {description}
                </Text>
            )}
        </>
    )
}

export default CellText
