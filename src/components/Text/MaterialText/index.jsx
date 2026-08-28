import PropTypes from "prop-types"
import "./MaterialText.scss"

const MaterialText = ({
    as: Component = "div",
    variant,
    weight,
    rounded,
    caps,
    children,
    ...props
}) => {
    return (
        <Component
            {...(variant && { variant })}
            {...(weight && { weight })}
            {...(rounded && { "data-rounded": true })}
            {...(caps && { "data-caps": true })}
            {...props}
        >
            {children}
        </Component>
    )
}

MaterialText.propTypes = {
    as: PropTypes.elementType,
    variant: PropTypes.string,
    weight: PropTypes.string,
    rounded: PropTypes.bool,
    caps: PropTypes.bool,
    children: PropTypes.node,
}

export default MaterialText
