import PropTypes from "prop-types"
import "./AppleText.scss"

const AppleText = ({
    as: Component = "div",
    apple: textProps,
    children,
    ...props
}) => {
    const dynamicProps = {
        ...(textProps?.variant && { variant: textProps.variant }),
        ...(textProps?.weight && { weight: textProps.weight }),
        ...(textProps.rounded && { "data-rounded": true }),
        ...(textProps.caps && { "data-caps": true }),
    }

    return (
        <Component {...dynamicProps} {...props}>
            {children}
        </Component>
    )
}

AppleText.propTypes = {
    as: PropTypes.elementType,
    apple: PropTypes.shape({
        variant: PropTypes.string,
        weight: PropTypes.string,
        rounded: PropTypes.bool,
        caps: PropTypes.bool,
    }),
    children: PropTypes.node,
}

export default AppleText
