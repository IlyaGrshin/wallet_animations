import { useEffect } from "react"

import "./index.css"
import WebApp from "@twa-dev/sdk"
import PageTransition from "../../Components/PageTransition"

function TonSpaceSkeleton() {
    useEffect(() => {
        WebApp.setHeaderColor("#131314")
        WebApp.setBackgroundColor("#131314")
    })

    return (
        <PageTransition>
            <div className="ts_skeleton_balance"></div>
            <div className="ts_skeleton_content"></div>
        </PageTransition>
    )
}

export default TonSpaceSkeleton