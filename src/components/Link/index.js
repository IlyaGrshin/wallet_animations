import { forwardRef } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { performViewTransition } from "../../utils/viewTransition"

const TransitionLink = forwardRef(
    ({ to, onClick, children, ...props }, ref) => {
        const navigate = useNavigate()

        const handleClick = async (event) => {
            if (onClick) {
                onClick(event)
            }

            if (event.defaultPrevented) {
                return
            }

            event.preventDefault()

            try {
                await performViewTransition(() => {
                    navigate({ to })
                })
            } catch (error) {
                console.warn("Transition failed, falling back:", error)
                navigate({ to })
            }
        }

        return (
            <Link ref={ref} to={to} onClick={handleClick} {...props}>
                {children}
            </Link>
        )
    }
)

TransitionLink.displayName = "TransitionLink"

export default TransitionLink
