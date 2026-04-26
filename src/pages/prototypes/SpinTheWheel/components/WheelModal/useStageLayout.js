import { useLayoutEffect, useMemo, useRef, useState } from "react"

import { SLOT_HEIGHT } from "../SpinReel/geometry"
import { CENTER_LIFT_PX, DEFAULT_LAYOUT } from "./animationConfig"

const sameLayout = (a, b) =>
    a.stageH === b.stageH && a.footerH === b.footerH && a.navH === b.navH

// Центр слота вписывается в свободное от nav и footer пространство
// (-SLOT_HEIGHT, чтобы это была верх­няя кромка центрального слота, а не его центр).
// CENTER_LIFT_PX компенсирует оптический сдвиг от тени footer card.
// Math.max(..., navH) — страховка для очень коротких экранов, иначе центр
// уезжает под навбар.
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
