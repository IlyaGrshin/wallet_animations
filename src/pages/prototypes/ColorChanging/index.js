import { useState } from "react"

import { RegularButton } from "../../../components/Button"
import NativePageTransition from "../../../components/NativePageTransition"

import WebApp from "@twa-dev/sdk"
import { BackButton } from "@twa-dev/sdk/react"

function ColorChanging() {
    const [isSecondaryColor, setIsSecondaryColor] = useState(true)

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
        <>
            <BackButton />
            <NativePageTransition>
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
            </NativePageTransition>
        </>
    )
}

export default ColorChanging
