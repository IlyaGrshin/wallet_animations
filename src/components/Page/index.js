import { useEffect } from "react"
import WebApp from "@twa-dev/sdk"

const { setHeaderColor, setBackgroundColor } = WebApp

const Page = ({
    children,
    mode = "secondary",
    headerColor,
    backgroundColor,
    expandOnMount,
}) => {
    const tgColorMapping = {
        primary: "bg_color",
        secondary: "secondary_bg_color",
    }

    const CSSColorMapping = {
        primary: "--tg-theme-bg-color",
        secondary: "--tg-theme-secondary-bg-color",
    }

    const tgHeaderColor = headerColor ? `#${headerColor}` : tgColorMapping[mode]
    const tgBackgroundColor = backgroundColor
        ? `#${backgroundColor}`
        : tgColorMapping[mode]
    const CSSBackgroundColor = backgroundColor
        ? `#${backgroundColor}`
        : `var(${CSSColorMapping[mode]})`

    useEffect(() => {
        if (expandOnMount) {
            WebApp.expand()
        }
    }, [expandOnMount])

    useEffect(() => {
        if (WebApp.initData) {
            setBackgroundColor(tgBackgroundColor)
            setHeaderColor(tgHeaderColor)
        } else {
            document.body.style.backgroundColor = CSSBackgroundColor
        }
    }, [tgBackgroundColor, tgHeaderColor])

    return <>{children}</>
}

export default Page
