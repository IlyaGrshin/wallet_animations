import React from "react"
import PropTypes from "prop-types"

import styles from "./CellPart.module.scss"

export const CellPart = ({ type, className, children }) => {
    return (
        <div
            className={[className, styles[type.toLowerCase()]]
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
        "smallButton",
    ]).isRequired,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
}
