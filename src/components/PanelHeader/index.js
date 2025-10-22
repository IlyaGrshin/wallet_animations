import PropTypes from "prop-types"
import Text from "../Text"

import * as styles from "./PanelHeader.module.scss"

const PanelHeader = ({ children }) => {
    return (
        <div className={`${styles.root} ${styles.modalHeight}`}>
            <div className={styles.body}>
                <div className={styles.left}>
                    <Text
                        apple={{
                            variant: "body",
                        }}
                        material={{
                            variant: "body1",
                        }}
                    >
                        Close
                    </Text>
                </div>
                <div className={styles.right}>
                    <Text
                        apple={{
                            variant: "body",
                            weight: "semibold",
                        }}
                        material={{
                            variant: "body1",
                            weight: "medium",
                        }}
                    >
                        Done
                    </Text>
                </div>
            </div>
            <div className={styles.middle}>
                <Text
                    apple={{
                        variant: "body",
                        weight: "semibold",
                    }}
                    material={{
                        variant: "headline6",
                    }}
                >
                    {children}
                </Text>
            </div>
        </div>
    )
}

PanelHeader.propTypes = {
    children: PropTypes.node,
}
export default PanelHeader
