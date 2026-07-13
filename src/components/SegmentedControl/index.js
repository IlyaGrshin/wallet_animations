import { useState } from "react"
import PropTypes from "prop-types"
import { useColorScheme } from "../../hooks/useColorScheme"
import Text from "../Text"

import * as styles from "./SegmentedControl.module.scss"

/**
 * Segmented picker with an animated active indicator. Uncontrolled — tracks
 * its own index from `defaultIndex`; onChange receives the selected index.
 * @param {Array<import("react").ReactNode>} props.segments Labels, one per segment.
 * @param {number} [props.defaultIndex=0]
 * @param {"circled"} [props.type] Pill (circled) vs default track.
 * @param {(index: number) => void} [props.onChange]
 * @example
 * <SegmentedControl segments={["Day", "Week", "Month"]} onChange={setRange} />
 */
const SegmentedControl = ({
    segments,
    onChange,
    defaultIndex = 0,
    colorScheme: forceColorScheme,
    type,
    ...props
}) => {
    const [activeIndex, setActiveIndex] = useState(defaultIndex)
    const colorScheme = useColorScheme(forceColorScheme)

    const handleSegmentClick = (index) => {
        setActiveIndex(index)
        if (onChange) onChange(index)
    }

    const controlType =
        type === "circled" ? `${styles.root} ${styles.circled}` : styles.root

    return (
        <div className={controlType} data-color-scheme={colorScheme} {...props}>
            {segments.map((segment, index) => (
                <button
                    key={index}
                    className={`${styles.segment} ${index === activeIndex ? styles.active : ""}`}
                    onClick={() => handleSegmentClick(index)}
                >
                    <Text
                        apple={{
                            variant: "footnote",
                            weight: "semibold",
                        }}
                        material={{
                            variant: "subheadline2",
                            weight: "medium",
                        }}
                    >
                        {segment}
                    </Text>
                </button>
            ))}
            <div
                className={styles.activeIndicator}
                style={{
                    width: `calc(${100 / segments.length}% - 4px)`,
                    transform: `translateX(calc(${activeIndex} * (100% + 4px)))`,
                    marginLeft: "2px",
                    marginRight: "2px",
                }}
            />
        </div>
    )
}

SegmentedControl.propTypes = {
    segments: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    defaultIndex: PropTypes.number,
    colorScheme: PropTypes.string,
    type: PropTypes.string,
}
export default SegmentedControl
