import React from "react"
import { Link as WouterLink, useLocation } from "wouter"
import { navigateWithTransition } from "../../utils/viewTransition"

const TransitionLink = React.forwardRef(
    ({ to, replace, onClick, children, ...props }, ref) => {
        const [, setLocation] = useLocation()

        const handleClick = async (event) => {
            if (onClick) {
                onClick(event)
            }

            if (event.defaultPrevented) {
                return
            }

            event.preventDefault()

            try {
                await navigateWithTransition(() => {
                    setLocation(to, { replace })
                })
            } catch (error) {
                console.warn("Transition failed, falling back:", error)
                setLocation(to, { replace })
            }
        }

        return (
            <WouterLink
                ref={ref}
                to={to}
                replace={replace}
                onClick={handleClick}
                {...props}
            >
                {children}
            </WouterLink>
        )
    }
)

TransitionLink.displayName = "TransitionLink"

export default TransitionLink
