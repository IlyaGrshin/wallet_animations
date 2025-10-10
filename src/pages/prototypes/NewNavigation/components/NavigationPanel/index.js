import * as styles from "./NavigationPanel.module.scss"
import SegmentedControl from "../../../../../components/SegmentedControl"
import QRCodeIcon from "../../../../../icons/28/QR Code.svg?react"

export default function NavigationPanel({
    avatarUrl,
    activeSegment,
    onSegmentChange,
}) {
    return (
        <div className={styles.navPanel}>
            <div className={`${styles.bounds} ${styles.transparent}`}>
                <div
                    className={styles.avatar}
                    style={{ backgroundImage: `url(${avatarUrl})` }}
                ></div>
            </div>
            <SegmentedControl
                segments={["Crypto", "TON"]}
                onChange={onSegmentChange}
                colorScheme={activeSegment === 1 ? "dark" : "light"}
                type="circled"
                style={{ width: "152px" }}
            />
            <div
                className={styles.bounds}
                data-color-scheme={activeSegment === 1 ? "dark" : "light"}
            >
                <QRCodeIcon />
            </div>
        </div>
    )
}
