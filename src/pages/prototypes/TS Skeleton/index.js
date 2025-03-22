import { useEffect } from "react"

import Page from "../../../components/Page"

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
        <Page headerColor="131314" backgroundColor="131314">
            <div className="ts_skeleton_balance"></div>
            <div className="ts_skeleton_content"></div>
        </Page>
    )
}

export default TonSpaceSkeleton
