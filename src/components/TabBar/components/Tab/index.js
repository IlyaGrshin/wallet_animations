import { lazy, Suspense, useEffect, useRef } from "react"
import * as styles from "./Tab.module.scss"

const Lottie = lazy(() => import("lottie-react"))

const Tab = ({ isActive, onClick, label, icon, lottieIcon, playKey }) => {
    const showLottie = Boolean(lottieIcon)
    const internalLottieRef = useRef(null)

    useEffect(() => {
        if (!showLottie) return
        if (isActive && internalLottieRef.current?.play) {
            internalLottieRef.current.stop?.()
            internalLottieRef.current.play()
        }
    }, [isActive, playKey, showLottie])

    return (
        <div
            className={`${styles.tab} ${isActive ? styles.active : ""}`}
            onClick={onClick}
        >
            <div className={styles.icon}>
                {showLottie ? (
                    <Suspense fallback={icon || null}>
                        <Lottie
                            lottieRef={internalLottieRef}
                            animationData={lottieIcon}
                            autoplay={false}
                            loop={false}
                        />
                    </Suspense>
                ) : (
                    icon
                )}
            </div>
            <span>{label}</span>
        </div>
    )
}

export default Tab
