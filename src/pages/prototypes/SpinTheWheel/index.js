import { useState } from "react"
import { useHashLocation } from "wouter/use-hash-location"

import Page from "@components/Page"
import { BackButton } from "@lib/twa"

import WheelModal from "./components/WheelModal"

const EXIT_DURATION_MS = 240

function SpinTheWheel() {
    const [, navigate] = useHashLocation()
    const [isOpen, setIsOpen] = useState(true)

    const close = () => {
        setIsOpen(false)
        setTimeout(() => navigate("/"), EXIT_DURATION_MS)
    }

    return (
        <Page mode="primary">
            <BackButton onClick={close} />
            <WheelModal isOpen={isOpen} onClose={close} />
        </Page>
    )
}

export default SpinTheWheel
