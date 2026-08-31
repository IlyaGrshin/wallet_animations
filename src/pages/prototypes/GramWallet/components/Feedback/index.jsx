import PropTypes from "prop-types"

import * as styles from "./Feedback.module.scss"

const Feedback = ({ children }) => (
    <div className={styles.root}>{children}</div>
)

Feedback.propTypes = {
    children: PropTypes.node,
}

export default Feedback
