import { createElement, Suspense } from "react"
import PropTypes from "prop-types"
import { getChevronRight } from "./ChevronRight"
import { getArrow } from "./Arrow"
import "./AppleText.scss"

const AppleText = ({
    as: Component = "div",
    variant,
    weight,
    rounded,
    caps,
    chevron,
    arrow,
    children,
    ...props
}) => {
    const ChevronIconComponent = chevron
        ? getChevronRight(variant, weight)
        : null
    const ArrowIconComponent = arrow?.direction
        ? getArrow(arrow.direction, variant, weight)
        : null

    return (
        <Component
            {...(variant && { variant })}
            {...(weight && { weight })}
            {...(rounded && { "data-rounded": true })}
            {...(caps && { "data-caps": true })}
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
    variant: PropTypes.string,
    weight: PropTypes.string,
    rounded: PropTypes.bool,
    caps: PropTypes.bool,
    chevron: PropTypes.bool,
    arrow: PropTypes.shape({
        direction: PropTypes.oneOf(["up", "down"]),
    }),
    children: PropTypes.node,
}

export default AppleText
