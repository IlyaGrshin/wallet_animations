import { useLayoutEffect, useMemo, useRef, useState } from "react"

import { SLOT_HEIGHT } from "../SpinReel/geometry"
import { CENTER_LIFT_PX, DEFAULT_LAYOUT } from "./animationConfig"

const sameLayout = (a, b) =>
    a.stageH === b.stageH && a.footerH === b.footerH && a.navH === b.navH

// Fit the centred slot into the space left by the nav and footer
// (-SLOT_HEIGHT picks the slot's top edge, not its centre). CENTER_LIFT_PX
// compensates for the optical shift caused by the footer card shadow.
// The Math.max(..., navH) floor protects very short screens — without it
// the centre slides under the nav bar.
function computeCenterOffset({ stageH, footerH, navH }) {
    return Math.max(
        (stageH + navH - footerH - SLOT_HEIGHT) / 2 - CENTER_LIFT_PX,
        navH
    )
}

export default function useStageLayout() {
    const stageRef = useRef(null)
    const footerRef = useRef(null)
    const navRef = useRef(null)
    const [layout, setLayout] = useState(DEFAULT_LAYOUT)

    useLayoutEffect(() => {
        let frameId = 0
        const measureNow = () => {
            const next = {
                stageH: stageRef.current?.offsetHeight ?? DEFAULT_LAYOUT.stageH,
                footerH:
                    footerRef.current?.offsetHeight ?? DEFAULT_LAYOUT.footerH,
                navH: navRef.current?.offsetHeight ?? DEFAULT_LAYOUT.navH,
            }
            setLayout((current) => (sameLayout(current, next) ? current : next))
        }
        const scheduleMeasure = () => {
            if (frameId) return
            frameId = requestAnimationFrame(() => {
                frameId = 0
                measureNow()
            })
        }
        measureNow()
        const ro = new ResizeObserver(scheduleMeasure)
        if (stageRef.current) ro.observe(stageRef.current)
        if (footerRef.current) ro.observe(footerRef.current)
        if (navRef.current) ro.observe(navRef.current)
        return () => {
            if (frameId) cancelAnimationFrame(frameId)
            ro.disconnect()
        }
    }, [])

    const centerOffset = useMemo(() => computeCenterOffset(layout), [layout])

    return { stageRef, footerRef, navRef, layout, centerOffset }
}
