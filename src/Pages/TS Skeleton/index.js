import { useEffect } from "react"

import "./index.css"
import WebApp from "@twa-dev/sdk"

function TonSpaceSkeleton() {
    useEffect(() => {
        if (WebApp.initData) {
            WebApp.setHeaderColor("#131314")
            WebApp.setBackgroundColor("#131314")
        } else {
            document.body.style.backgroundColor = "#131314"
        }
    })

    return (
        <>
            <div className="ts_skeleton_balance"></div>
            <div className="ts_skeleton_content"></div>
        </>
    )
}

export default TonSpaceSkeleton
