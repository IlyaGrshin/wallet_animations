import { useEffect, useState } from "react"
import WalletCard from "."
import Page from "../Page"
import { RegularButton } from "../Button"
import WebApp, { BackButton, getUser, isTelegram } from "../../lib/twa"

const tgUser = getUser()
const tgName = tgUser
    ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ")
    : ""
const inTelegram = isTelegram()

const wrapperStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    padding: "24px 12px",
}

function startTelegramSensor() {
    const tgOrient = WebApp?.DeviceOrientation
    if (tgOrient && typeof tgOrient.start === "function") {
        tgOrient.start({ refresh_rate: 20 })
        return "started"
    }
    return "no DeviceOrientation"
}

const WalletCardShowcase = () => {
    const [state, setState] = useState("idle")

    useEffect(() => {
        const html = document.documentElement
        const body = document.body
        const prev = {
            htmlOverflow: html.style.overflow,
            bodyOverflow: body.style.overflow,
            htmlTouchAction: html.style.touchAction,
            bodyTouchAction: body.style.touchAction,
            bodyOverscroll: body.style.overscrollBehavior,
        }
        html.style.overflow = "hidden"
        body.style.overflow = "hidden"
        html.style.touchAction = "none"
        body.style.touchAction = "none"
        body.style.overscrollBehavior = "none"
        return () => {
            html.style.overflow = prev.htmlOverflow
            body.style.overflow = prev.bodyOverflow
            html.style.touchAction = prev.htmlTouchAction
            body.style.touchAction = prev.bodyTouchAction
            body.style.overscrollBehavior = prev.bodyOverscroll
        }
    }, [])

    const onStart = () => {
        try {
            setState(startTelegramSensor())
        } catch (err) {
            setState(`error: ${err?.message ?? err}`)
        }
    }

    return (
        <>
            <BackButton />
            <Page>
                <div style={wrapperStyle}>
                    <WalletCard name={tgName || undefined} />
                    {inTelegram && (
                        <RegularButton
                            variant="filled"
                            label={`Start Accelerometer · ${state}`}
                            onClick={onStart}
                        />
                    )}
                </div>
            </Page>
        </>
    )
}

export default WalletCardShowcase
