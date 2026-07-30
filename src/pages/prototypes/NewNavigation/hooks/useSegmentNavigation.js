import { useState, useEffect } from "react"
import WebApp from "../../../../lib/twa"

export const useSegmentNavigation = () => {
    const [activeSegment, setActiveSegment] = useState(0)

    useEffect(() => {
        if (WebApp.initData) {
            WebApp.onEvent("backButtonClicked", () => {
                WebApp.setHeaderColor("secondary_bg_color")
                WebApp.setBackgroundColor("secondary_bg_color")
            })
        }
    }, [])

    const handleSegmentChange = (index) => {
        setActiveSegment(index)

        WebApp.HapticFeedback.selectionChanged()
    }

    return { activeSegment, handleSegmentChange }
}
