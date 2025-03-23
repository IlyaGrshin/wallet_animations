import React from "react"
import Text from "../../../Text"

import PropTypes from "prop-types"

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

CellPart.propTypes = {
    type: PropTypes.oneOf([
        "avatar",
        "switch",
        "checkbox",
        "radio",
        "icon",
        "roundedIcon",
        "squareIcon",
        "tabs",
        "segmentedControl",
        "picker",
        "colorpicker",
        "smallButton",
    ]).isRequired,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
}

export default CellPart
