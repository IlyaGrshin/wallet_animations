import { useState } from "react"
import * as styles from "./TabBar.module.scss"

import Lottie from "lottie-react"

const TabBar = ({ tabs, onChange, defaultIndex = 0 }) => {
    const [activeIndex, setActiveIndex] = useState(defaultIndex)

    const handleSegmentClick = (index) => {
        setActiveIndex(index)
        if (onChange) onChange(index)
    }

    return (
        <div className={styles.root}>
            {tabs.map((tab, index) => (
                <div
                    key={index}
                    className={`${styles.tab} ${index === activeIndex ? styles.active : ""}`}
                    onClick={() => handleSegmentClick(index)}
                >
                    <div className={styles.icon}>
                        {tab.lottieIcon ? (
                            <Lottie animationData={tab.lottieIcon} />
                        ) : (
                            tab.icon
                        )}
                    </div>
                    <span>{tab.label}</span>
                </div>
            ))}
        </div>
    )
}

export default TabBar
