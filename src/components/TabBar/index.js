import { useState, useRef, useEffect, lazy, Suspense } from "react"
import { motion } from "motion/react"
import { useApple26 } from "../../hooks/DeviceProvider"
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

    // Press animation handled by whileTap with spring transition

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
        <motion.div
            className={styles.root}
            whileTap={{ scale: 1.02 }}
            transition={{
                scale: { type: "spring", stiffness: 800, damping: 40 },
            }}
        >
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
            {useApple26 && <div className={styles.gradient}></div>}
        </motion.div>
    )
}

export default TabBar
