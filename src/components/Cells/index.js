import PropTypes from "prop-types"
import Text from "../Text"

import CellText from "./components/CellText"
import CellPart from "./components/CellPart"
import EditableCell from "./components/EditableCell"
import SwitchCell from "./components/SwitchCell"

import * as styles from "./Cell.module.scss"

const CellComponent = ({
    as: Component = "div",
    start,
    children,
    end,
    onClick,
    ...props
}) => {
    return (
        <Component className={styles.root} onClick={onClick} {...props}>
            {start && <div className={styles.start}>{start}</div>}
            <div className={styles.body}>{children}</div>
            {end && <div className={styles.end}>{end}</div>}
        </Component>
    )
}

const CellStart = ({ type, src = null, iconType = null }) => {
    let content

    switch (type) {
        case "Image":
            content = <img src={src} alt="" className={styles.image} />
            break
        case "Icon":
            content = <div className={styles.icon}>{iconType}</div>
            break
        default:
            content = null
            break
    }

    return <>{content}</>
}

const CellEnd = ({ label, caption }) => (
    <>
        <div className={styles.label}>
            <Text
                apple={{ variant: "body", weight: "regular" }}
                material={{ variant: "body", weight: "regular" }}
            >
                {label}
            </Text>
        </div>
        {caption && (
            <div className={styles.caption}>
                <Text
                    apple={{ variant: "subheadline2", weight: "regular" }}
                    material={{ variant: "subheadline2", weight: "regular" }}
                >
                    {caption}
                </Text>
            </div>
        )}
    </>
)

CellComponent.propTypes = {
    as: PropTypes.elementType,
    start: PropTypes.node,
    children: PropTypes.node,
    end: PropTypes.node,
    onClick: PropTypes.func,
}

CellStart.propTypes = {
    type: PropTypes.string,
    src: PropTypes.string,
    iconType: PropTypes.node,
}

CellEnd.propTypes = {
    label: PropTypes.string,
    caption: PropTypes.string,
}

export const Cell = Object.assign(CellComponent, {
    Start: CellStart,
    End: CellEnd,
    Part: CellPart,
    Text: CellText,
    Editable: EditableCell,
    Switch: SwitchCell,
})

export default Cell
