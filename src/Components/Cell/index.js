import Text from "../Text"
import * as styles from "./Cell.module.scss"

const Cell = ({
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

Cell.Part = ({ type, children }) => {
    switch (type) {
        // case "Avatar":
        //     return <div className={styles.avatar}>{children}</div>
        case "Chevron":
            return <div className={styles.chevron}>{children}</div>
        case "Label":
            return <div className={styles.label}>{children}</div>
        // case "Label&Chevron":
        //     return <div className={styles.labelChevron}>{children}</div>
        // case "Counter&Chevron":
        //     return <div className={styles.counterChevron}>{children}</div>
        // case "Label&Icon":
        //     return <div className={styles.labelIcon}>{children}</div>
        case "Dropdown":
            return <div className={styles.dropdown}>{children}</div>
        // case "Checkmark":
        //     return <div className={styles.checkmark}>{children}</div>
        // case "Switch":
        //     return <div className={styles.switch}>{children}</div>
        // case "Picker":
        //     return <div className={styles.picker}>{children}</div>
        case "Icon":
            return <div className={styles.icon}>{children}</div>
        // case "SegmentedControl":
        //     return <div className={styles.segmentedControl}>{children}</div>
        // case "Checkbox":
        //     return <div className={styles.checkbox}>{children}</div>
        // case "Button":
        //     return <div className={styles.button}>{children}</div>
        default:
            return <></>
    }
}

Cell.Start = ({ type, src = null, iconType = null }) => {
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

Cell.Text = ({ type, title, description, bold }) => {
    let name
    let weight = bold ? "medium" : "regular"

    switch (type) {
        case "Regular":
            name = `${styles.label}`
            break
        case "Accent":
            name = `${styles.label} ${styles.accent}`
            break
        default:
            name = `${styles.label}`
            break
    }

    return (
        <>
            <Text
                apple={{
                    variant: "body",
                    weight: weight,
                }}
                material={{
                    variant: "body1",
                    weight: weight,
                }}
                className={name}
            >
                {title}
            </Text>
            {description && (
                <Text
                    apple={{
                        variant: "subheadline2",
                        weight: "regular",
                    }}
                    material={{
                        variant: "subtitle2",
                        weight: "regular",
                    }}
                    className={styles.caption}
                >
                    {description}
                </Text>
            )}
        </>
    )
}

Cell.End = ({ label, caption }) => {
    return (
        <>
            <Text
                apple={{
                    variant: "body",
                    weight: "regular",
                }}
                material={{
                    variant: "body1",
                    weight: "regular",
                }}
                className={styles.label}
            >
                {label}
            </Text>
            {caption && (
                <Text
                    apple={{
                        variant: "subheadline2",
                        weight: "regular",
                    }}
                    material={{
                        variant: "subtitle2",
                        weight: "regular",
                    }}
                    className={styles.caption}
                >
                    {caption}
                </Text>
            )}
        </>
    )
}

export default Cell
