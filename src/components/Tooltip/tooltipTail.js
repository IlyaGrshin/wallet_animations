import { detectOverflow } from "@floating-ui/react"

import { clamp } from "../../utils/number"
import { buildClipPath } from "./tooltipPath"

export const GAP = 8
export const VIEWPORT_PADDING = 8

const SIDES = ["top", "bottom", "left", "right"]

const pickBest = (keys, spaces) =>
    keys.reduce(
        (best, k) => (best === null || spaces[k] > spaces[best] ? k : best),
        null
    )

const choosePlacement = (spaces, fits) => {
    const hAsym = fits.left !== fits.right
    const maxV = Math.max(spaces.top, spaces.bottom)
    const minV = Math.min(spaces.top, spaces.bottom)
    // Trigger sits between the vertical edges, not pinned near one.
    const vBalanced = maxV > 0 && (maxV - minV) / maxV < 0.4

    // Flip sideways only for genuinely edge-anchored triggers.
    if (hAsym && vBalanced) return fits.left ? "left" : "right"

    if (fits.bottom && fits.top) {
        return spaces.bottom >= spaces.top ? "bottom" : "top"
    }
    if (fits.bottom) return "bottom"
    if (fits.top) return "top"

    if (fits.right && fits.left) {
        return spaces.right >= spaces.left ? "right" : "left"
    }
    if (fits.right) return "right"
    if (fits.left) return "left"

    return pickBest(["bottom", "top", "right", "left"], spaces)
}

/**
 * Picks the side for `placement="auto"`: prefers the roomier vertical side but
 * flips sideways for triggers pinned against a horizontal edge. Resets the
 * chain once, so `flip` still guards the choice afterwards.
 */
export const tailPlacement = (preferred) => ({
    name: "tailPlacement",
    options: preferred,
    fn({ rects, elements, placement }) {
        if (SIDES.includes(preferred)) return {}

        const trigger = elements.reference.getBoundingClientRect()
        const { innerWidth, innerHeight } = window
        const spaces = {
            top: trigger.top,
            bottom: innerHeight - trigger.bottom,
            left: trigger.left,
            right: innerWidth - trigger.right,
        }
        const neededV = rects.floating.height + GAP + VIEWPORT_PADDING
        const neededH = rects.floating.width + GAP + VIEWPORT_PADDING
        const fits = {
            top: spaces.top >= neededV,
            bottom: spaces.bottom >= neededV,
            left: spaces.left >= neededH,
            right: spaces.right >= neededH,
        }

        const next = choosePlacement(spaces, fits)
        return next === placement ? {} : { reset: { placement: next } }
    },
})

/**
 * Aligns the pointing tail with the trigger centre. When the centre lands too
 * close to a corner the shell is pulled onto that corner and the tail is drawn
 * as a shorter half-tail instead of a centred one.
 */
export const tail = ({ vBreadth, hBreadth, protrusion }) => ({
    name: "tail",
    options: [vBreadth, hBreadth, protrusion],
    async fn(state) {
        const { x, y, placement, rects } = state
        const side = placement.split("-")[0]
        const horizontal = side === "left" || side === "right"
        const breadth = horizontal ? hBreadth : vBreadth
        const crossSize = horizontal
            ? rects.floating.height
            : rects.floating.width
        const coord = horizontal ? y : x
        const center = horizontal
            ? rects.reference.y + rects.reference.height / 2
            : rects.reference.x + rects.reference.width / 2

        const rawApex = center - coord
        let shape = "full"
        if (rawApex < breadth / 2) shape = "half-start"
        else if (rawApex > crossSize - breadth / 2) shape = "half-end"

        let next = coord
        if (shape !== "full") {
            const overflow = await detectOverflow(state, {
                padding: VIEWPORT_PADDING,
            })
            const startKey = horizontal ? "top" : "left"
            const endKey = horizontal ? "bottom" : "right"
            const wanted = shape === "half-start" ? center : center - crossSize
            next =
                coord +
                clamp(
                    wanted - coord,
                    -Math.max(0, -overflow[startKey]),
                    Math.max(0, -overflow[endKey])
                )
        }

        const apex = clamp(center - next, 0, crossSize)
        const alongCross = shape === "full" ? Math.round(apex - breadth / 2) : 0
        const originPercent = `${clamp((apex / crossSize) * 100, 0, 100)}%`

        return {
            [horizontal ? "y" : "x"]: next,
            data: {
                side,
                shape,
                breadth,
                width: rects.floating.width,
                height: rects.floating.height,
                protrusion:
                    shape === "full"
                        ? protrusion
                        : Math.round(protrusion * 0.8),
                tailOffsetX: horizontal ? 0 : alongCross,
                tailOffsetY: horizontal ? alongCross : 0,
                originX: horizontal
                    ? side === "left"
                        ? "100%"
                        : "0%"
                    : originPercent,
                originY: horizontal
                    ? originPercent
                    : side === "top"
                      ? "100%"
                      : "0%",
            },
        }
    },
})

// Padding carves room for the tail inside the shell, the clip path draws it.
export const tailShellStyle = (data) => {
    if (!data) return undefined
    const { side, protrusion } = data
    return {
        paddingTop: side === "bottom" ? protrusion : 0,
        paddingBottom: side === "top" ? protrusion : 0,
        paddingLeft: side === "right" ? protrusion : 0,
        paddingRight: side === "left" ? protrusion : 0,
        transformOrigin: `${data.originX} ${data.originY}`,
        clipPath: buildClipPath({
            width: data.width,
            height: data.height,
            tailOffsetX: data.tailOffsetX,
            tailOffsetY: data.tailOffsetY,
            tailBreadth: data.breadth,
            tailProtrusion: data.protrusion,
            placement: side,
            shape: data.shape,
        }),
    }
}
