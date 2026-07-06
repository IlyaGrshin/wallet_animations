import PropTypes from "prop-types"
import Text from "../Text"

import * as styles from "./PanelHeader.module.scss"

// data-modal-drag marks the header as an unconditional drag handle for
// ModalView's swipe-to-dismiss; the attribute is inert outside a modal.
const PanelHeader = ({ left, onLeft, right, onRight, children }) => {
    return (
        <div
            className={`${styles.root} ${styles.modalHeight}`}
            data-modal-drag=""
        >
            <div className={styles.body}>
                <div className={styles.left}>
                    {left && (
                        <button
                            type="button"
                            className={styles.action}
                            onClick={onLeft}
                        >
                            <Text variant="body">{left}</Text>
                        </button>
                    )}
                </div>
                <div className={styles.right}>
                    {right && (
                        <button
                            type="button"
                            className={styles.action}
                            onClick={onRight}
                        >
                            <Text
                                variant="body"
                                apple={{ weight: "semibold" }}
                                material={{ weight: "medium" }}
                            >
                                {right}
                            </Text>
                        </button>
                    )}
                </div>
            </div>
            <div className={styles.middle}>
                <Text
                    apple={{ variant: "body", weight: "semibold" }}
                    material={{ variant: "title2" }}
                >
                    {children}
                </Text>
            </div>
        </div>
    )
}

PanelHeader.propTypes = {
    left: PropTypes.string,
    onLeft: PropTypes.func,
    right: PropTypes.string,
    onRight: PropTypes.func,
    children: PropTypes.node,
}
export default PanelHeader
