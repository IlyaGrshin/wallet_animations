import PropTypes from "prop-types"
import { LazyMotion, domAnimation } from "motion/react"

const MotionProvider = ({ children }) => {
    return <LazyMotion features={domAnimation}>{children}</LazyMotion>
}

MotionProvider.propTypes = {
    children: PropTypes.node,
}
export default MotionProvider
