import { createElement } from "react"
import PropTypes from "prop-types"
import { getChevronRight } from "./ChevronRight"
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

    const ChevronIconComponent =
        textProps && "chevron" in textProps
            ? getChevronRight(textProps.variant, textProps.weight)
            : null

    return (
        <Component
            {...dynamicProps}
            {...props}
            data-has-chevron={!!ChevronIconComponent}
        >
            {children}
            {ChevronIconComponent &&
                createElement(ChevronIconComponent, {
                    className: "chevron-icon",
                })}
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
        chevron: PropTypes.any,
    }),
    children: PropTypes.node,
}

export default AppleText
