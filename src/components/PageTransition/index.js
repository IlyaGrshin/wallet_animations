import { useState, useEffect, useTransition, useRef } from "react"
import { useApple } from "../../hooks/DeviceProvider"

export let pageTransitionDuration = 0.2

if (typeof window !== "undefined") {
    window.pageTransitionDuration = pageTransitionDuration
}

const PageTransition = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false)
    const [isPending, startTransition] = useTransition()
    const currentTransitionRef = useRef(null)
    const blurValue = useApple ? "2px" : "0px"

    useEffect(() => {
        // Check if view transitions are supported and working properly
        const supportsViewTransition =
            (typeof document !== "undefined" &&
                document.startViewTransition &&
                !window.navigator.userAgent.includes("Safari")) ||
            window.navigator.userAgent.includes("Chrome")

        if (supportsViewTransition) {
            try {
                currentTransitionRef.current = document.startViewTransition(
                    () => {
                        startTransition(() => {
                            setIsVisible(true)
                        })
                    }
                )
            } catch (error) {
                // Fallback if view transition fails
                startTransition(() => {
                    setIsVisible(true)
                })
            }
        } else {
            startTransition(() => {
                setIsVisible(true)
            })
        }

        // Cleanup function
        return () => {
            if (
                currentTransitionRef.current &&
                currentTransitionRef.current.finished
            ) {
                currentTransitionRef.current.finished.catch(() => {
                    // Ignore transition errors on cleanup
                })
            }
            currentTransitionRef.current = null
        }
    }, [])

    const handleExit = () => {
        const supportsViewTransition =
            (typeof document !== "undefined" &&
                document.startViewTransition &&
                !window.navigator.userAgent.includes("Safari")) ||
            window.navigator.userAgent.includes("Chrome")

        if (supportsViewTransition) {
            try {
                currentTransitionRef.current = document.startViewTransition(
                    () => {
                        startTransition(() => {
                            setIsVisible(false)
                        })
                    }
                )
            } catch (error) {
                startTransition(() => {
                    setIsVisible(false)
                })
            }
        } else {
            startTransition(() => {
                setIsVisible(false)
            })
        }
    }

    return (
        <div
            style={{
                viewTransitionName: "page-transition",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "scale(1)" : "scale(1.04)",
                filter: isVisible ? "blur(0px)" : `blur(${blurValue})`,
                transition: `all ${pageTransitionDuration}s cubic-bezier(0.26, 0.08, 0.25, 1)`,
            }}
        >
            {children}
        </div>
    )
}

export default PageTransition
