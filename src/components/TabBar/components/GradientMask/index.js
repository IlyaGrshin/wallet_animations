import React, { useId } from "react"
import * as styles from "../../TabBar.module.scss"

export default function GradientMask({
    width,
    height,
    insets = { top: 21, right: 21, bottom: 21, left: 21 },
    innerHeight = 64,
    className,
}) {
    if (!width || !height) return null

    const { top, right, bottom, left } = insets
    const overlayWidth = width + left + right
    const overlayHeight = innerHeight + top + bottom
    const innerWidth = Math.max(0, overlayWidth - left - right)
    const rx = Math.min(innerHeight / 2, innerWidth / 2, 999)

    const uid = useId()
    const gradId = `grad-${uid}`
    const maskId = `mask-${uid}`

    return (
        <svg
            width={overlayWidth}
            height={overlayHeight}
            viewBox={`0 0 ${overlayWidth} ${overlayHeight}`}
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            className={[styles.gradient, className].filter(Boolean).join(" ")}
            aria-hidden
        >
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                        offset="0%"
                        stopColor="var(--mask-color)"
                        stopOpacity="var(--mask-opacity-top)"
                    />
                    <stop
                        offset="100%"
                        stopColor="var(--mask-color)"
                        stopOpacity="var(--mask-opacity-bottom)"
                    />
                </linearGradient>
                <mask id={maskId} maskUnits="userSpaceOnUse">
                    <rect
                        x="0"
                        y="0"
                        width={overlayWidth}
                        height={overlayHeight}
                        fill="white"
                    />
                    <rect
                        x={left}
                        y={top}
                        width={innerWidth}
                        height={innerHeight}
                        rx={rx}
                        ry={rx}
                        fill="black"
                    />
                </mask>
            </defs>
            <rect
                width={overlayWidth}
                height={overlayHeight}
                fill={`url(#${gradId})`}
                mask={`url(#${maskId})`}
            />
        </svg>
    )
}
