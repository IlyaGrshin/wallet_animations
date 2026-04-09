import { createElement, Suspense } from "react"
import PropTypes from "prop-types"
import { getChevronRight } from "./ChevronRight"
import { getArrow } from "./Arrow"
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
        ...(textProps?.rounded && { "data-rounded": true }),
        ...(textProps?.caps && { "data-caps": true }),
    }

    const ChevronIconComponent =
        textProps && "chevron" in textProps
            ? getChevronRight(textProps.variant, textProps.weight)
            : null

    const ArrowIconComponent = textProps?.arrow?.direction
        ? getArrow(
              textProps.arrow.direction,
              textProps.variant,
              textProps.weight
          )
        : null

    return (
        <Component
            {...dynamicProps}
            {...props}
            data-has-chevron={!!ChevronIconComponent}
            data-has-arrow={!!ArrowIconComponent}
        >
            {ArrowIconComponent && (
                <Suspense>
                    {createElement(ArrowIconComponent, {
                        className: "arrow-icon",
                        fill: "currentColor",
                    })}
                </Suspense>
            )}
            {children}
            {ChevronIconComponent && (
                <Suspense>
                    {createElement(ChevronIconComponent, {
                        className: "chevron-icon",
                        fill: "currentColor",
                    })}
                </Suspense>
            )}
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
        arrow: PropTypes.shape({
            direction: PropTypes.oneOf(["up", "down"]),
        }),
    }),
    children: PropTypes.node,
}

export default AppleText
