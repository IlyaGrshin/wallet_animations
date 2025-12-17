import PropTypes from "prop-types"
import "./MaterialText.scss"

const MaterialText = ({
    as: Component = "div",
    material: textProps,
    children,
    ...props
}) => {
    const dynamicProps = {
        ...(textProps?.variant && { variant: textProps.variant }),
        ...(textProps?.weight && { weight: textProps.weight }),
        ...(textProps?.rounded && { "data-rounded": true }),
        ...(textProps?.caps && { "data-caps": true }),
    }

    return (
        <Component {...dynamicProps} {...props}>
            {children}
        </Component>
    )
}

MaterialText.propTypes = {
    as: PropTypes.elementType,
    material: PropTypes.shape({
        variant: PropTypes.string,
        weight: PropTypes.string,
        rounded: PropTypes.bool,
        caps: PropTypes.bool,
        chevron: PropTypes.bool,
        arrow: PropTypes.shape({
            direction: PropTypes.oneOf(["up", "down"]),
        }),
    }),
    children: PropTypes.node,
}

export default MaterialText
