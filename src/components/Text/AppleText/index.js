import PropTypes from "prop-types"

import * as styles from "./AppleText.module.scss"

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
    apple: PropTypes.shape({
        variant: PropTypes.oneOf([
            "title1",
            "title3",
            "body",
            "subheadline2",
            "footnote",
            "caption2",
        ]),
        weight: PropTypes.oneOf(["regular", "medium", "semibold", "bold"]),
        rounded: PropTypes.bool,
        caps: PropTypes.bool,
    }),
    as: PropTypes.elementType,
}

export default AppleText
