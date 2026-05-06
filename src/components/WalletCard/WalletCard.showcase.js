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
        const locks = [
            [html, "overflow", "hidden"],
            [body, "overflow", "hidden"],
            [html, "touchAction", "none"],
            [body, "touchAction", "none"],
            [body, "overscrollBehavior", "none"],
        ]
        const restores = locks.map(([el, prop, val]) => {
            const prev = el.style[prop]
            el.style[prop] = val
            return [el, prop, prev]
        })
        return () => {
            for (const [el, prop, prev] of restores) el.style[prop] = prev
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
