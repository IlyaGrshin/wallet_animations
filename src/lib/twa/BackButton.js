import { useEffect } from "react"
import PropTypes from "prop-types"
import WebApp from "./webApp"

const backButton = WebApp.BackButton

let isButtonShown = false

const BackButton = ({ onClick = () => window.history.back() }) => {
    useEffect(() => {
        backButton.show()
        isButtonShown = true
        return () => {
            isButtonShown = false
            setTimeout(() => {
                if (!isButtonShown) {
                    backButton.hide()
                }
            }, 10)
        }
    }, [])

    useEffect(() => {
        WebApp.onEvent("backButtonClicked", onClick)
        return () => {
            WebApp.offEvent("backButtonClicked", onClick)
        }
    }, [onClick])

    return null
}

BackButton.propTypes = {
    onClick: PropTypes.func,
}

export default BackButton
