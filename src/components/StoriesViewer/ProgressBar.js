import PropTypes from "prop-types"
import * as styles from "./ProgressBar.module.scss"

const ProgressBar = ({ count, currentIndex, isPaused, duration }) => (
    <div className={styles.root} aria-hidden="true">
        {Array.from({ length: count }, (_, i) => {
            const isCompleted = i < currentIndex
            const isActive = i === currentIndex

            return (
                <div key={i} className={styles.segment}>
                    <div
                        className={`${styles.fill} ${isCompleted ? styles.completed : ""} ${isActive ? styles.active : ""}`}
                        style={
                            isActive
                                ? {
                                      animationDuration: `${duration}ms`,
                                      animationPlayState: isPaused
                                          ? "paused"
                                          : "running",
                                  }
                                : undefined
                        }
                    />
                </div>
            )
        })}
    </div>
)

ProgressBar.propTypes = {
    count: PropTypes.number.isRequired,
    currentIndex: PropTypes.number.isRequired,
    isPaused: PropTypes.bool.isRequired,
    duration: PropTypes.number.isRequired,
}

export default ProgressBar
