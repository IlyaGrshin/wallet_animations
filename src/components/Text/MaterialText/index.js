import PropTypes from "prop-types"

import * as styles from "./MaterialText.module.scss"

const MaterialText = ({
    as: Component = "div",
    material: textProps,
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

MaterialText.propTypes = {
    material: PropTypes.shape({
        variant: PropTypes.oneOf([
            "headline5",
            "headline6",
            "body1",
            "subtitle1",
            "button1",
            "subtitle2",
            "caption2",
        ]),
        weight: PropTypes.oneOf(["regular", "medium"]),
        caps: PropTypes.bool,
    }),
    as: PropTypes.elementType,
}

export default MaterialText
