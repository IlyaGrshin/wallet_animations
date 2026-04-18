import * as styles from "./RouteErrorFallback.module.scss"

const handleReload = () => {
    window.location.reload()
}

const RouteErrorFallback = () => (
    <div className={styles.root}>
        <div className={styles.title}>Something went wrong</div>
        <div className={styles.description}>
            This page failed to load. It may have been updated — try reloading.
        </div>
        <button type="button" className={styles.button} onClick={handleReload}>
            Reload
        </button>
    </div>
)

export default RouteErrorFallback
