import { bindAttribs, createBuffers, createMaskTexture } from "./glUtils"
import { applyLayout, measureCanvas } from "./canvasLayout"
import { resolveColor } from "./color"
import { renderTextMask } from "./textMask"
import { takeStill } from "./stillFrame"

const FADE_OUT_MS = 400
const STILL_FADE_MS = 600 // crossfade from the 2D still frame
// Pre-roll ~1.5s in one frame (a reset cloud starts sparse): a still frame for
// reduced motion, or a full-density start when taking over the 2D still.
const SETTLE_STEPS = 45

/**
 * One covered element. Owns its 2D canvas (in the page, so it scrolls with the
 * content for free), its glyph mask texture and its transform-feedback buffers.
 * The shared renderer drives it: capture() measures and rasterizes (DOM reads
 * only), commit() writes layout and uploads to the GPU, step() simulates into a
 * slot of the shared WebGL atlas, and blit() copies that slot to the canvas.
 */
export function createInstance({
    canvas,
    content,
    color,
    radius,
    padding,
    maskDilation = 0.3,
}) {
    const ctx = canvas.getContext("2d")
    const maskCanvas = document.createElement("canvas")
    const maskCtx = maskCanvas.getContext("2d")

    const s = {
        layout: null,
        next: null, // measured layout waiting for commit()
        buffer: null,
        bufferIndex: 0,
        texture: null,
        color: [1, 1, 1],
        text: 1, // 1 = particles spawn on the glyph mask, 0 = block fallback
        seed: Math.random() * 10,
        time: 0,
        reset: false,
        fadeOut: false,
        fadeOutTime: 0,
        fadeOutXY: [0, 0],
        still: null,
        covered: false,
        active: false, // covering or mid-reveal: wants frames
        settle: false, // reduced motion: render one still frame, then idle
        reduced: false,
        finished: false, // reveal done: next blit clears the canvas
        capture: false, // mask/layout must be (re)captured before drawing
        onscreen: false,
    }

    const freeGpu = (gl) => {
        if (gl && s.buffer) {
            gl.deleteBuffer(s.buffer[0])
            gl.deleteBuffer(s.buffer[1])
        }
        if (gl && s.texture) gl.deleteTexture(s.texture)
        s.buffer = s.texture = null
    }

    const clear = () => {
        s.active = false
        if (s.layout) ctx.clearRect(0, 0, s.layout.w, s.layout.h)
    }

    return {
        wantsFrame: () => s.active && s.onscreen,
        needsCapture: () => s.capture,
        ready: () => !s.capture && !!s.buffer,
        get w() {
            return s.layout.w
        },
        get h() {
            return s.layout.h
        },

        setOnscreen(onscreen) {
            s.onscreen = onscreen
        },

        // Only a real size change re-captures (observers also fire on observe).
        resized(width, height) {
            const l = s.layout
            if (!s.covered || !l) return
            if (
                Math.abs(width - l.contentW) < 0.5 &&
                Math.abs(height - l.contentH) < 0.5
            ) {
                return
            }
            s.capture = s.active = true
            s.settle = s.reduced
        },

        capture() {
            const layout = measureCanvas(content, { padding, radius })
            if (!layout) return false
            maskCanvas.width = layout.w
            maskCanvas.height = layout.h
            const mask = renderTextMask(
                content,
                maskCtx,
                layout.dpr,
                layout.pad,
                maskDilation
            )
            s.text = mask.drawn > 0 ? 1 : 0
            s.color = color
                ? resolveColor(color)
                : (mask.color ?? resolveColor(getComputedStyle(content).color))
            s.next = layout
            return true
        },

        commit(gl) {
            const layout = s.next
            s.next = null
            applyLayout(canvas, layout)
            if (!s.buffer || layout.count !== s.layout?.count) {
                freeGpu(gl)
                s.buffer = createBuffers(gl, layout.count)
                s.bufferIndex = 0
            }
            s.texture ??= createMaskTexture(gl)
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, s.texture)
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                maskCanvas
            )
            gl.generateMipmap(gl.TEXTURE_2D)
            s.layout = layout
            s.capture = false
            s.reset = true
            s.still = takeStill(canvas) ?? s.still
            s.stillFade = 0
        },

        step(gl, loc, slot, atlasH, dt) {
            const { w, h, radius: r } = s.layout
            const y = atlasH - slot.y - h
            gl.viewport(slot.x, y, w, h)
            gl.scissor(slot.x, y, w, h)
            gl.uniform2f(loc.size, w, h)
            gl.uniform1f(loc.seed, s.seed)
            gl.uniform1f(loc.r, r)
            gl.uniform3f(loc.color, s.color[0], s.color[1], s.color[2])
            gl.uniform1f(loc.text, s.text)
            gl.uniform1f(loc.textColor, color ? 0 : 1)
            gl.uniform2f(loc.fadeOutXY, s.fadeOutXY[0], s.fadeOutXY[1])
            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, s.texture)

            const preroll = s.settle || (s.still && s.stillFade === 0)
            if (s.still) s.stillFade += (dt * 1000) / STILL_FADE_MS
            const steps = preroll ? SETTLE_STEPS : 1
            const stepDt = preroll ? 1 / 30 : dt
            for (let i = 0; i < steps; i++) {
                s.time += stepDt
                if (s.fadeOut) s.fadeOutTime += (stepDt * 1000) / FADE_OUT_MS
                if (s.fadeOutTime >= 1) {
                    s.active = false
                    s.finished = true
                    return
                }
                gl.clear(gl.COLOR_BUFFER_BIT)
                gl.uniform1f(loc.reset, s.reset ? 1 : 0)
                if (s.reset) {
                    s.time = 0
                    s.reset = false
                }
                gl.uniform1f(loc.time, s.time)
                gl.uniform1f(loc.deltaTime, stepDt)
                gl.uniform1f(loc.fadeOut, s.fadeOutTime)

                gl.bindBuffer(gl.ARRAY_BUFFER, s.buffer[s.bufferIndex])
                bindAttribs(gl)
                const out = s.buffer[1 - s.bufferIndex]
                gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, out)
                gl.beginTransformFeedback(gl.POINTS)
                gl.drawArrays(gl.POINTS, 0, s.layout.count)
                gl.endTransformFeedback()
                gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null)
                s.bufferIndex = 1 - s.bufferIndex
            }
            if (s.settle) {
                s.settle = false
                s.active = false // keep the still frame on the canvas
            }
        },

        blit(atlas, slot) {
            const { w, h } = s.layout
            ctx.clearRect(0, 0, w, h)
            if (s.finished) return
            if (s.still && s.stillFade >= 1) s.still = null
            ctx.globalAlpha = s.still ? s.stillFade : 1
            ctx.drawImage(atlas, slot.x, slot.y, w, h, 0, 0, w, h)
            if (s.still) {
                ctx.globalAlpha = 1 - s.stillFade
                ctx.drawImage(s.still, 0, 0, w, h)
            }
            ctx.globalAlpha = 1
        },

        cover(reduced) {
            s.covered = s.active = s.capture = true
            s.settle = s.reduced = reduced
            s.finished = s.fadeOut = false
            s.fadeOutTime = 0
        },

        // origin: pointer position relative to the content box, or null.
        reveal(origin, reduced) {
            if (!s.covered) return
            const drawn = !s.capture && !!s.buffer
            s.covered = s.capture = false
            s.still = null
            // Nothing visible to animate: off-screen, never drawn, or reduced.
            if (reduced || !s.onscreen || !drawn) {
                clear()
                return
            }
            const { pad, dpr, w, h } = s.layout
            s.active = s.fadeOut = true
            s.settle = s.finished = false
            s.fadeOutTime = 0
            s.fadeOutXY = origin
                ? [(origin.x + pad) * dpr, h - (origin.y + pad) * dpr]
                : [w / 2, h / 2]
        },

        // The shared context was lost: GPU handles are dead, recapture later.
        lose() {
            s.buffer = s.texture = null
            if (!s.covered) return
            s.capture = s.active = true
            s.settle = s.reduced
        },

        destroy(gl) {
            freeGpu(gl)
            clear()
        },
    }
}
