import PropTypes from "prop-types"
import { LazyMotion } from "motion/react"

const loadFeatures = () => import("./features").then((module) => module.default)

const MotionProvider = ({ children }) => {
    return (
        <LazyMotion features={loadFeatures} strict>
            {children}
        </LazyMotion>
    )
}

MotionProvider.propTypes = {
    children: PropTypes.node,
}
export default MotionProvider
