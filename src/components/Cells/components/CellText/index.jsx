import PropTypes from "prop-types"
import cx from "clsx"
import Text from "../../../Text"
import * as styles from "./CellText.module.scss"

const line = (value) =>
    typeof value === "number"
        ? { skeleton: value, children: null }
        : { children: value }

const CellText = ({ type, title, description, caption, bold }) => {
    const weight = bold ? "medium" : "regular"
    const name = cx(styles.label, type === "Accent" && styles.accent)

    return (
        <>
            <div className={name}>
                <Text variant="body" weight={weight} {...line(title)} />
            </div>
            {description && (
                <div className={caption ? styles.description : styles.caption}>
                    <Text
                        variant={caption ? "subheadline1" : "subheadline2"}
                        weight="regular"
                        {...line(description)}
                    />
                </div>
            )}
            {caption && (
                <div className={styles.caption}>
                    <Text
                        variant="subheadline2"
                        weight="regular"
                        {...line(caption)}
                    />
                </div>
            )}
        </>
    )
}

CellText.propTypes = {
    type: PropTypes.string,
    title: PropTypes.node,
    description: PropTypes.node,
    caption: PropTypes.oneOfType([PropTypes.node, PropTypes.number]),
    bold: PropTypes.bool,
}

export default CellText
