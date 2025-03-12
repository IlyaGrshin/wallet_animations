import React from "react"

import { RegularButton } from "../../components/Button"
import PageTransition from "../../components/PageTransition"

import WebApp from "@twa-dev/sdk"
import { BackButton } from "@twa-dev/sdk/react"

function ColorChanging() {
    const [isSecondaryColor, setIsSecondaryColor] = React.useState(true)

    const switchColors = () => {
        if (WebApp.initData) {
            if (isSecondaryColor) {
                WebApp.setHeaderColor("#131314")
                WebApp.setBackgroundColor("#131314")
            } else {
                WebApp.setHeaderColor("secondary_bg_color")
                WebApp.setBackgroundColor("secondary_bg_color")
            }
            setIsSecondaryColor(!isSecondaryColor)
            WebApp.HapticFeedback.impactOccurred("light")
        } else {
            if (isSecondaryColor) {
                document.body.style.backgroundColor = "#131314"
            } else {
                document.body.style.backgroundColor =
                    "var(--tg-theme-secondary-bg-color)"
            }
            setIsSecondaryColor(!isSecondaryColor)
        }
    }

    return (
        <PageTransition>
            <BackButton />
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <RegularButton
                    variant="filled"
                    label="Change Color"
                    onClick={switchColors}
                />
            </div>
        </PageTransition>
    )
}

export default React.memo(ColorChanging)
