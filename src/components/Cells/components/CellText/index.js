import PropTypes from "prop-types"
import Text from "../../../Text"
import * as styles from "./CellText.module.scss"

const CellText = ({ type, title, description, bold }) => {
    const weight = bold ? "medium" : "regular"
    const name = `${styles.label} ${type === "Accent" ? styles.accent : ""}`

    return (
        <>
            <div className={name}>
                <Text
                    apple={{ variant: "body", weight: weight }}
                    material={{ variant: "body1", weight: weight }}
                >
                    {title}
                </Text>
            </div>
            {description && (
                <div className={styles.caption}>
                    <Text
                        apple={{ variant: "subheadline2", weight: "regular" }}
                        material={{ variant: "subtitle2", weight: "regular" }}
                    >
                        {description}
                    </Text>
                </div>
            )}
        </>
    )
}

CellText.propTypes = {
    type: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    bold: PropTypes.bool,
}

export default CellText
