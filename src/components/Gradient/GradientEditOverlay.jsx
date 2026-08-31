import { useState } from "react"
import PropTypes from "prop-types"

import { SOLID_STOP } from "./"
import * as styles from "./Gradient.showcase.module.scss"

// viewBox the Gradient draws into (see index.js).
const VB_W = 402
const VB_H = 530
// Snap distance (viewBox units) for aligning to a centre line / equalising radii.
const SNAP = 10
// Radius bounds so a handle can't collapse or fly far off-frame.
const R_MIN = 24
const R_MAX = 3000

const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
const snap = (v, target) => (Math.abs(v - target) < SNAP ? target : v)

// Map pointer px to viewBox units against the frame rect (Gradient uses
// preserveAspectRatio="none", so each axis maps independently).
const toVb = (e, rect) => ({
    x: clamp(((e.clientX - rect.left) / rect.width) * VB_W, 0, VB_W),
    y: clamp(((e.clientY - rect.top) / rect.height) * VB_H, 0, VB_H),
})

// Figma-style handles over the preview frame: center + width + height. The two
// axis handles sit on the visible inner-colour boundary (SOLID_STOP of the
// radius) so they stay on-frame and readable.
const GradientEditOverlay = ({
    frameRef,
    center,
    radius,
    fade,
    setCenter,
    setRadius,
    setFade,
}) => {
    const [guide, setGuide] = useState({ vx: null, hy: null })

    // Drive the given update from window pointer events until release. The frame
    // rect is captured once at press (stable during a drag), so this helper
    // never touches the ref.
    const bindDrag = (rect, moveFn) => {
        const onMove = (ev) => moveFn(toVb(ev, rect))
        const onUp = () => {
            setGuide({ vx: null, hy: null })
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("pointerup", onUp)
        }
        window.addEventListener("pointermove", onMove)
        window.addEventListener("pointerup", onUp)
    }

    const moveCenter = (p) => {
        const x = snap(p.x, VB_W / 2)
        const y = snap(p.y, VB_H / 2)
        setGuide({ vx: x === VB_W / 2 ? x : null, hy: y === VB_H / 2 ? y : null })
        setCenter({ x: Math.round(x), y: Math.round(y) })
    }
    const moveWidth = (p) => {
        const rx = clamp((p.x - center.x) / SOLID_STOP, R_MIN, R_MAX)
        // Snap to the vertical radius to make a perfect circle.
        setRadius({ x: Math.round(snap(rx, radius.y)), y: radius.y })
    }
    const moveHeight = (p) => {
        const ry = clamp((p.y - center.y) / SOLID_STOP, R_MIN, R_MAX)
        setRadius({ x: radius.x, y: Math.round(snap(ry, radius.x)) })
    }
    const moveFadeStart = (p) =>
        setFade((f) => ({ ...f, start: Math.round(clamp(p.y, 0, f.end - 1)) }))
    const moveFadeEnd = (p) =>
        setFade((f) => ({ ...f, end: Math.round(clamp(p.y, f.start + 1, VB_H)) }))

    const left = (x) => `${(x / VB_W) * 100}%`
    const top = (y) => `${(y / VB_H) * 100}%`
    const widthX = center.x + radius.x * SOLID_STOP
    const heightY = center.y + radius.y * SOLID_STOP

    return (
        <div className={styles.overlay}>
            {guide.vx != null && (
                <div className={styles.guideV} style={{ left: left(guide.vx) }} />
            )}
            {guide.hy != null && (
                <div className={styles.guideH} style={{ top: top(guide.hy) }} />
            )}

            {[fade.start, fade.end].map((y, i) => (
                <div
                    key={i}
                    className={styles.fadeLine}
                    style={{ top: top(y) }}
                    onPointerDown={(e) => {
                        e.preventDefault()
                        bindDrag(
                            frameRef.current.getBoundingClientRect(),
                            i === 0 ? moveFadeStart : moveFadeEnd
                        )
                    }}
                >
                    <span className={styles.fadeLabel}>
                        {i === 0 ? "fade start" : "fade end"} {Math.round(y)}
                    </span>
                </div>
            ))}

            <div
                className={styles.axisHandle}
                style={{ left: left(widthX), top: top(center.y) }}
                onPointerDown={(e) => {
                    e.preventDefault()
                    bindDrag(frameRef.current.getBoundingClientRect(), moveWidth)
                }}
            />
            <div
                className={styles.axisHandle}
                style={{ left: left(center.x), top: top(heightY) }}
                onPointerDown={(e) => {
                    e.preventDefault()
                    bindDrag(frameRef.current.getBoundingClientRect(), moveHeight)
                }}
            />
            <div
                className={styles.centerHandle}
                style={{ left: left(center.x), top: top(center.y) }}
                onPointerDown={(e) => {
                    e.preventDefault()
                    bindDrag(frameRef.current.getBoundingClientRect(), moveCenter)
                }}
            />
        </div>
    )
}

GradientEditOverlay.propTypes = {
    frameRef: PropTypes.object.isRequired,
    center: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number })
        .isRequired,
    radius: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number })
        .isRequired,
    fade: PropTypes.shape({ start: PropTypes.number, end: PropTypes.number })
        .isRequired,
    setCenter: PropTypes.func.isRequired,
    setRadius: PropTypes.func.isRequired,
    setFade: PropTypes.func.isRequired,
}

export default GradientEditOverlay
