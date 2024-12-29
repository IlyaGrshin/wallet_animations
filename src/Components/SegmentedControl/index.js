import React, { useState, useMemo } from "react"
import Text from "../Text"

import "./index.css"

const SegmentedControl = ({
    segments,
    onChange,
    defaultIndex = 0,
    colorScheme = "light",
    type,
    ...props
}) => {
    const [activeIndex, setActiveIndex] = useState(defaultIndex)

    const handleSegmentClick = (index) => {
        setActiveIndex(index)
        if (onChange) onChange(index)
    }

    const controlType = useMemo(() => {
        switch (type) {
            case "mainPage":
                return "segmentedControl mainPage"
            default:
                return "segmentedControl"
        }
    }, [type])

    return (
        <div className={controlType} data-color-scheme={colorScheme} {...props}>
            {segments.map((segment, index) => (
                <button
                    key={index}
                    className={`segment ${index === activeIndex ? "active" : ""}`}
                    onClick={() => handleSegmentClick(index)}
                >
                    <Text
                        apple={{
                            variant: "footnote",
                            weight: "semibold",
                        }}
                        material={{
                            variant: "subtitle2",
                            weight: "medium",
                        }}
                    >
                        {segment}
                    </Text>
                </button>
            ))}
            <div
                className="activeIndicator"
                style={{
                    width: `calc(${100 / segments.length}% - 4px)`,
                    left: `calc(${(100 / segments.length) * activeIndex}%)`,
                    marginLeft: "2px",
                    marginRight: "2px",
                }}
            />
        </div>
    )
}

export default SegmentedControl
