import { useState, useRef, useEffect, lazy, Suspense } from "react"
import * as styles from "./TabBar.module.scss"

const Lottie = lazy(() => import("lottie-react"))

const TabBar = ({ tabs, onChange, defaultIndex = 0 }) => {
    const [activeIndex, setActiveIndex] = useState(defaultIndex)
    const lottieRefs = useRef([])
    const userInteractedRef = useRef(false)
    const [replayNonce, setReplayNonce] = useState(0)

    const handleSegmentClick = (index) => {
        userInteractedRef.current = true
        if (index === activeIndex) {
            setReplayNonce((n) => n + 1)
        } else {
            setActiveIndex(index)
            onChange?.(index)
        }
    }

    if (lottieRefs.current.length < tabs.length) {
        for (let i = 0; i < tabs.length; i++) {
            if (!lottieRefs.current[i]) {
                lottieRefs.current[i] = { current: null }
            }
        }
    }

    useEffect(() => {
        if (!userInteractedRef.current) return
        const refObj = lottieRefs.current[activeIndex]
        const anim = refObj?.current
        if (anim?.play) {
            anim.stop?.()
            anim.play()
        }
    }, [activeIndex, replayNonce])

    return (
        <div className={styles.root}>
            {tabs.map((tab, index) => {
                const isActive = index === activeIndex
                const showLottie = Boolean(tab.lottieIcon)
                return (
                    <div
                        key={index}
                        className={`${styles.tab} ${isActive ? styles.active : ""}`}
                        onClick={() => handleSegmentClick(index)}
                    >
                        <div className={styles.icon}>
                            {showLottie ? (
                                <Suspense fallback={tab.icon || null}>
                                    <Lottie
                                        lottieRef={lottieRefs.current[index]}
                                        animationData={tab.lottieIcon}
                                        autoplay={false}
                                        loop={false}
                                    />
                                </Suspense>
                            ) : (
                                tab.icon
                            )}
                        </div>
                        <span>{tab.label}</span>
                    </div>
                )
            })}
        </div>
    )
}

export default TabBar
