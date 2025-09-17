import Text from "../Text"

import CellText from "./components/CellText"
import CellPart from "./components/CellPart"

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
            content = (
                <div
                    className={styles.image}
                    style={{ backgroundImage: `url(${src})` }}
                ></div>
            )
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
        <Text
            apple={{ variant: "body", weight: "regular" }}
            material={{ variant: "body1", weight: "regular" }}
            className={styles.label}
        >
            {label}
        </Text>
        {caption && (
            <Text
                apple={{ variant: "subheadline2", weight: "regular" }}
                material={{ variant: "subtitle2", weight: "regular" }}
                className={styles.caption}
            >
                {caption}
            </Text>
        )}
    </>
)

export const Cell = Object.assign(CellComponent, {
    Start: CellStart,
    End: CellEnd,
    Part: CellPart,
    Text: CellText,
})

export default Cell
