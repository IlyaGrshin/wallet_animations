import { useState, lazy, Suspense } from "react"
import * as styles from "./TabBar.module.scss"

const Lottie = lazy(() => import("lottie-react"))

const TabBar = ({ tabs, onChange, defaultIndex = 0 }) => {
    const [activeIndex, setActiveIndex] = useState(defaultIndex)

    const handleSegmentClick = (index) => {
        setActiveIndex(index)
        onChange?.(index)
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
                            <Suspense fallback={tab.icon || null}>
                                <Lottie animationData={tab.lottieIcon} />
                            </Suspense>
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
