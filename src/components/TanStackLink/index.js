import React from "react"
import { Link as TanStackLink } from "@tanstack/react-router"
import { performViewTransition } from "../../utils/viewTransition"

const TransitionLink = React.forwardRef(
    ({ to, onClick, children, ...props }, ref) => {
        const handleClick = async (event) => {
            if (onClick) {
                onClick(event)
            }

            if (event.defaultPrevented) {
                return
            }

            // TanStack Router автоматически обработает навигацию
            // ViewTransition будет применен через роутер
        }

        return (
            <TanStackLink
                ref={ref}
                to={to}
                onClick={handleClick}
                {...props}
            >
                {children}
            </TanStackLink>
        )
    }
)

TransitionLink.displayName = "TransitionLink"

export default TransitionLink
