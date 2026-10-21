import { linkProgram, setupGl } from "./glUtils"
import { createInstance } from "./instance"

// Simulation tuning for the "text" (text = 1) mode of the dkaraush particle
// system, matching the demo defaults at dkaraush.github.io/particles. Keys map
// 1:1 to float uniforms, shared by every instance, so they are set once.
const SIM = {
    noiseScale: 22,
    noiseSpeed: 0.6,
    forceMult: 0.6,
    velocityMult: 1,
    dampingMult: 0.9999,
    maxVelocity: 6,
    longevity: 1.4,
    noiseMovement: 4,
}
const UNIFORMS = [
    ...Object.keys(SIM),
    "time",
    "deltaTime",
    "size",
    "reset",
    "r",
    "seed",
    "color",
    "textColor",
    "fadeOut",
    "fadeOutXY",
    "text",
    "textTexture",
]

// ~60fps cap: 120Hz panels would otherwise double the GPU and blit cost.
const MIN_FRAME_MS = 1000 / 60 - 4
// Mask captures read layout; spread a mass cover (dozens of balances hiding at
// once) over frames instead of one long task.
const CAPTURE_BUDGET_MS = 4
const ATLAS_MIN_W = 1024
const ATLAS_MAX_H = 2048
// Capture slightly ahead of the viewport so scrolling reveals ready clouds.
const ROOT_MARGIN = "25% 0px"

let shared

/**
 * Shared particle renderer: ONE WebGL2 context for every ParticleEffect on the
 * page (browsers cap live contexts at ~16, so per-instance contexts break with
 * dozens of balances). Each frame packs the on-screen, animating instances
 * into slots of an off-DOM atlas canvas, simulates them there, and copies each
 * slot into the instance's own 2D canvas. Those canvases live in the page, so
 * scrolling is plain compositing with no JS. One rAF loop and one pair of
 * observers drive everything; the loop sleeps when nothing animates.
 *
 * @returns {object|null} null when WebGL2 is unavailable
 */
export function getRenderer() {
    if (shared === undefined) shared = createRenderer()
    return shared
}

function createRenderer() {
    const atlas = document.createElement("canvas")
    const gl = atlas.getContext("webgl2", {
        premultipliedAlpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power",
    })
    if (!gl) return null

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const byContent = new Map()
    const loc = {}
    let program = null
    let raf = 0
    let last = 0
    let lost = false

    const init = () => {
        program = linkProgram(gl)
        for (const name of UNIFORMS)
            loc[name] = gl.getUniformLocation(program, name)
        setupGl(gl, program, loc)
        for (const key in SIM) gl.uniform1f(loc[key], SIM[key])
    }
    init()

    const capture = (live) => {
        const deadline = performance.now() + CAPTURE_BUDGET_MS
        const measured = []
        for (const inst of live) {
            if (!inst.needsCapture()) continue
            if (measured.length && performance.now() > deadline) break
            if (inst.capture()) measured.push(inst)
        }
        // All reads happen above, all writes here: no layout thrashing.
        for (const inst of measured) inst.commit(gl)
    }

    const flush = (batch, width, height, dt) => {
        if (atlas.width < width) atlas.width = width
        if (atlas.height < height) atlas.height = height
        for (const [inst, slot] of batch)
            inst.step(gl, loc, slot, atlas.height, dt)
        for (const [inst, slot] of batch) inst.blit(atlas, slot)
    }

    // Shelf packing; overflowing ATLAS_MAX_H flushes and starts a new batch.
    const draw = (ready, dt) => {
        let width = ATLAS_MIN_W
        for (const inst of ready) width = Math.max(width, inst.w)
        let batch = []
        let x = 0
        let y = 0
        let rowH = 0
        for (const inst of ready) {
            if (x + inst.w > width) {
                x = 0
                y += rowH
                rowH = 0
            }
            if (batch.length && y + inst.h > ATLAS_MAX_H) {
                flush(batch, width, y + rowH, dt)
                batch = []
                x = y = rowH = 0
            }
            batch.push([inst, { x, y }])
            x += inst.w
            rowH = Math.max(rowH, inst.h)
        }
        if (batch.length) flush(batch, width, y + rowH, dt)
    }

    const frame = (now) => {
        raf = 0
        if (lost) return
        if (last && now - last < MIN_FRAME_MS) {
            wake()
            return
        }
        const live = []
        for (const inst of byContent.values())
            if (inst.wantsFrame()) live.push(inst)
        if (!live.length) {
            last = 0 // idle: the next wake starts with a nominal dt
            return
        }
        const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60
        last = now
        capture(live)
        gl.useProgram(program)
        draw(
            live.filter((inst) => inst.ready()),
            dt
        )
        wake()
    }

    function wake() {
        if (!raf && !lost) raf = requestAnimationFrame(frame)
    }

    const io = new IntersectionObserver(
        (entries) => {
            for (const entry of entries)
                byContent.get(entry.target)?.setOnscreen(entry.isIntersecting)
            wake()
        },
        { rootMargin: ROOT_MARGIN }
    )
    const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
            const box = entry.borderBoxSize?.[0]
            byContent
                .get(entry.target)
                ?.resized(
                    box ? box.inlineSize : entry.contentRect.width,
                    box ? box.blockSize : entry.contentRect.height
                )
        }
        wake()
    })

    atlas.addEventListener("webglcontextlost", (event) => {
        event.preventDefault() // allow webglcontextrestored
        lost = true
        cancelAnimationFrame(raf)
        raf = 0
        for (const inst of byContent.values()) inst.lose()
    })
    atlas.addEventListener("webglcontextrestored", () => {
        lost = false
        init()
        wake()
    })

    return {
        register(options) {
            const { content } = options
            const inst = createInstance(options)
            byContent.set(content, inst)
            io.observe(content)
            ro.observe(content)
            return {
                cover() {
                    inst.cover(reduced.matches)
                    wake()
                },
                reveal(origin) {
                    inst.reveal(origin, reduced.matches)
                    wake()
                },
                destroy() {
                    io.unobserve(content)
                    ro.unobserve(content)
                    if (byContent.get(content) === inst)
                        byContent.delete(content)
                    inst.destroy(lost ? null : gl)
                },
            }
        },
    }
}
