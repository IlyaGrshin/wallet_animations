import PropTypes from "prop-types"

const NativePageTransition = ({ children }) => {
    return <>{children}</>
}

NativePageTransition.propTypes = {
    children: PropTypes.node,
}
export default NativePageTransition
