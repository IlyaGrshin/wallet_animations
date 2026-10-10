import { useEffect } from "react"
import PropTypes from "prop-types"
import { useIsPresent } from "motion/react"
import { useHashLocation } from "wouter/use-hash-location"
import WebApp from "./webApp"

const BackButton = ({ onClick }) => {
    const [, navigate] = useHashLocation()
    const isPresent = useIsPresent()

    useEffect(() => {
        if (!isPresent) return
        const handler = onClick ?? (() => navigate("/"))
        WebApp.BackButton.onClick(handler)
        WebApp.BackButton.show()
        return () => {
            WebApp.BackButton.offClick(handler)
            WebApp.BackButton.hide()
        }
    }, [isPresent, onClick, navigate])

    return null
}

BackButton.propTypes /* remove-proptypes */ = {
    onClick: PropTypes.func,
}

export default BackButton
