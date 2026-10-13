import { useEffect } from "react"
import PropTypes from "prop-types"
import { useIsPresent } from "motion/react"
import { usePlatform } from "./context"

// Holds the host back button while mounted and present, so an exiting screen
// releases it as soon as its exit animation starts.
const BackButton = ({ onClick }) => {
    const { showBackButton } = usePlatform()
    const isPresent = useIsPresent()

    useEffect(() => {
        if (!isPresent) return
        return showBackButton(onClick)
    }, [isPresent, onClick, showBackButton])

    return null
}

BackButton.propTypes /* remove-proptypes */ = {
    onClick: PropTypes.func.isRequired,
}

export default BackButton
