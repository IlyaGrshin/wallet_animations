import React, { useEffect } from "react"
import { useHashLocation } from "wouter/use-hash-location"
import { useApple } from "../DeviceProvider"

import * as styles from "./useTransitionHashLocation.module.scss"

export const useTransitionHashLocation = () => {
    const [location, setLocation] = useHashLocation()
    const [isPending, setPending] = React.useState(false)
    const isApple = useApple

    useEffect(() => {
        document.documentElement.style.setProperty(
            "--blur-value",
            isApple ? "2px" : "0px"
        )
    }, [isApple])

    const navigate = (to) => {
        if (location === to) return

        if (!document.startViewTransition) {
            setLocation(to)
            return
        }

        setPending(true)

        try {
            const transition = document.startViewTransition(() => {
                setLocation(to)
                return new Promise((resolve) => setTimeout(resolve, 0))
            })

            transition.finished
                .catch(
                    (error) =>
                        error.name !== "AbortError" &&
                        console.warn("View transition error:", error)
                )
                .finally(() => setPending(false))
        } catch (error) {
            console.warn("Failed to start view transition:", error)
            setLocation(to)
            setPending(false)
        }
    }

    return [location, navigate, isPending, setLocation, isApple]
}
