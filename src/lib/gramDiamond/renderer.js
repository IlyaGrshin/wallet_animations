// Port of DiamondRenderer.swift + the gesture handling from GramDiamondView/DiamondPressRecognizer.
// A transparent <canvas> that draws the stone, its surface sparkles and the background stars.

import {
    buildDiamond,
    rotation,
    transpose,
    projection,
    horizontalScale,
    transform,
} from "./geometry.js"
import {
    DiamondMotion,
    Entrance,
    STAR_BURST_LIFETIME,
    Appearance,
    lightState,
    sparkleState,
    mainPlacement,
} from "./animation.js"
import * as shaders from "./shaders.js"

export { Appearance }

/** Mirrors `DiamondStyle`; only the options that matter on the web. */
export const defaultStyle = Object.freeze({
    appearance: Appearance.blue,
    /** 'entrance' (fast first spin that settles) or 'continuous'. */
    animationMode: "entrance",
    /** Radians per second; one turn in about 10.5 s, like Telegram. */
    rotationSpeed: ((2 * Math.PI) / 18) * 1.70775,
    isRotating: true,
    sparkles: true,
    backgroundStars: true,
    steadyStars: true,
    entranceStars: true,
    widthCompensation: true,
    refraction: 0.72,
    brightness: 1,
    zoom: 0.72,
    /** Fixed stone width in CSS pixels; 0 uses `zoom` and the canvas size. */
    widthPoints: 0,
    /** 'standard': drag to rotate, tap a side to nudge. 'pressToGrow': touch grows it, release spins it. */
    interaction: "pressToGrow",
    dragGrow: 1.3,
    growShift: 0,
    /** Horizontal point that stays put while the stone grows: -1 left edge, 0 center, 1 right edge. */
    growAnchorX: 0,
    growDamping: 0.42,
    releaseDecay: 1.1,
    releaseTilt: 0,
    tilt: 0,
    /** Touchable circle around the center in CSS pixels; 0 = whole canvas. */
    hitDiameter: 0,
    maxReleaseSpin: 16,
    tapSpinStep: 5,
    tapsToTopSpin: 4,
    topSpinCoast: 2.5,
    starOpacity: 1,
    starZoom: 1,
    starEmission: 1,
    starBrightness: 1,
    burstSize: 1,
    floatAmplitude: 0,
    floatPeriod: 3,
    /** Only affects star colors. */
    lightBackground: false,
})

function compile(gl, type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader)
        gl.deleteShader(shader)
        throw new Error(`Shader compile failed:\n${log}`)
    }
    return shader
}

function program(gl, vertex, fragment) {
    const p = gl.createProgram()
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vertex))
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fragment))
    gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS))
        throw new Error(`Program link failed:\n${gl.getProgramInfoLog(p)}`)
    // Cache uniform locations by name, including struct members ("u.model").
    const locations = {}
    const count = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS)
    for (let i = 0; i < count; i++) {
        const name = gl.getActiveUniform(p, i).name.replace(/\[0\]$/, "")
        locations[name] = gl.getUniformLocation(p, name)
    }
    return { program: p, locations }
}

function setUniforms(gl, prog, values) {
    for (const [name, value] of Object.entries(values)) {
        const location = prog.locations[name]
        if (location == null) continue // optimized out
        if (typeof value === "number") {
            if (INTEGER_UNIFORMS.has(name)) gl.uniform1i(location, value)
            else gl.uniform1f(location, value)
        } else if (value.length === 16)
            gl.uniformMatrix4fv(location, false, value)
        else if (value.length === 4) gl.uniform4fv(location, value)
        else gl.uniform4fv(location, value) // vec4 arrays
    }
}

const INTEGER_UNIFORMS = new Set(["instanceOffset", "lensTexture"])

/** a * b for column-major 4x4 matrices. */
function multiply(a, b) {
    const r = new Float32Array(16)
    for (let c = 0; c < 4; c++) {
        for (let row = 0; row < 4; row++) {
            let sum = 0
            for (let k = 0; k < 4; k++) sum += a[k * 4 + row] * b[c * 4 + k]
            r[c * 4 + row] = sum
        }
    }
    return r
}

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x))
const now = () => performance.now() / 1000

export class GramDiamond {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {Partial<typeof defaultStyle>} style
     * @param {{ onBurst?: () => void, onPressChanged?: (pressed: boolean) => void }} callbacks
     * @param {{ input?: HTMLElement }} options input: element that receives the gestures instead of the canvas
     */
    constructor(canvas, style = {}, callbacks = {}, options = {}) {
        this.canvas = canvas
        this.input = options.input ?? canvas
        this.raised = false
        this.callbacks = callbacks
        const gl = canvas.getContext("webgl2", {
            alpha: true,
            premultipliedAlpha: true,
            antialias: true,
            depth: true,
        })
        if (!gl) throw new Error("WebGL 2 is not available")
        this.gl = gl
        this.data = buildDiamond()
        this.reduceMotion =
            window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
            false

        this.stone = program(gl, shaders.diamondVertex, shaders.diamondFragment)
        this.sparkle = program(
            gl,
            shaders.sparkleVertex,
            shaders.sparkleFragment
        )
        this.stars = program(gl, shaders.starVertex, shaders.starFragment)

        this.stoneVAO = gl.createVertexArray()
        gl.bindVertexArray(this.stoneVAO)
        const vb = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vb)
        gl.bufferData(gl.ARRAY_BUFFER, this.data.vertices, gl.STATIC_DRAW)
        for (let i = 0; i < 3; i++) {
            gl.enableVertexAttribArray(i)
            gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 36, i * 12)
        }
        const sparkleVAO = (array) => {
            const vao = gl.createVertexArray()
            gl.bindVertexArray(vao)
            const b = gl.createBuffer()
            gl.bindBuffer(gl.ARRAY_BUFFER, b)
            gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW)
            gl.enableVertexAttribArray(0)
            gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 20, 0)
            gl.enableVertexAttribArray(1)
            gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 20, 16)
            return { vao, count: array.length / 5 }
        }
        this.mainSparkles = sparkleVAO(this.data.mainSparkles)
        this.smallSparkles = sparkleVAO(this.data.smallSparkles)
        this.emptyVAO = gl.createVertexArray()
        gl.bindVertexArray(null)

        // Refraction backdrop; a transparent pixel until a source is set.
        this.lensTexture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, this.lensTexture)
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array(4)
        )
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.useProgram(this.stone.program)
        setUniforms(gl, this.stone, { lensTexture: 0 })
        this.refractionSource = null
        /** How much of the backdrop shows through the stone, 0...1. */
        this.refractionStrength = 1

        this.motion = new DiamondMotion()
        this.style = { ...defaultStyle }
        this.setStyle(style)
        this.resetAnimation()
        this.appliedPixelRatio = 0
        this.lastTime = null
        this.tapStreak = 0
        this.lastTapTime = 0

        this.attachPointer()
        this.frame = this.frame.bind(this)
        this.running = true
        requestAnimationFrame(this.frame)
    }

    setStyle(changes) {
        const old = this.style
        this.style = { ...old, ...changes }
        const s = this.style
        this.motion.releaseDecay = s.releaseDecay
        this.motion.releaseTilt = s.releaseTilt
        this.motion.tilt = s.tilt
        if (!s.backgroundStars) this.starBursts = []
        if (old.animationMode !== s.animationMode) this.resetAnimation()
    }

    /** Replays the entrance spin (and its star burst). */
    resetAnimation() {
        const s = this.style
        this.motion = new DiamondMotion()
        this.motion.releaseDecay = s.releaseDecay
        this.motion.releaseTilt = s.releaseTilt
        this.motion.tilt = s.tilt
        this.grow = 1
        this.growVelocity = 0
        this.elapsed = 0
        this.lastTime = null
        this.starBursts =
            s.backgroundStars &&
            s.entranceStars &&
            s.animationMode === "entrance"
                ? [{ startTime: 0, seed: 0 }]
                : []
        this.nextBurstSeed = 1
    }

    /**
     * What lies behind the stone, refracted through its facets (DiamondRefractionSource).
     * @param {null | {
     *   image: TexImageSource,          // e.g. a 2D canvas; top row first
     *   rect: {x: number, y: number, width: number, height: number}, // CSS px, relative to the canvas center, y down
     *   mode?: 'color' | 'mask',        // color: premultiplied RGBA content; mask: red channel is a glyph mask
     *   backgroundColor?: [number, number, number], // color mode: the color the content sits on (sRGB 0...1);
     *                                   // the stone takes its hue, keeping its own shading
     *   uv?: [number, number, number, number], // texture region (x, y, width, height), default the whole texture
     * }} source Call again after redrawing the image to re-upload it.
     */
    setRefractionSource(source) {
        this.refractionSource = source
        if (!source) return
        const gl = this.gl
        gl.bindTexture(gl.TEXTURE_2D, this.lensTexture)
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
        gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE)
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            source.image
        )
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    }

    /** Lens uniforms: the stone's screen-space convex hull, center and radius (DiamondRenderer.lens). */
    lensUniforms(u, width, height) {
        const off = { "lens.parameters": [0, 0, 0, -1] }
        const source = this.refractionSource
        const strength = this.refractionStrength
        if (
            !source ||
            strength <= 0.001 ||
            source.rect.width <= 0 ||
            source.rect.height <= 0
        )
            return off
        const ppp = this.pixelRatio
        const half = [width / (2 * ppp), height / (2 * ppp)]
        const m = multiply(u["u.projection"], u["u.model"])
        const project = (v) => {
            const p = transform(m, v)
            return [
                (p[0] / p[3]) * half[0] * 0.96,
                (-p[1] / p[3]) * half[1] * 0.96,
            ]
        }
        const points = this.data.lensVertices.map(project)
        // Bend around the stone's projected origin and farthest vertex: unlike the hull's centroid,
        // they change smoothly as it turns, so the distortion doesn't jitter.
        const center = project([0, 0, 0, 1])
        const radius = points.reduce(
            (r, p) =>
                Math.max(r, Math.hypot(p[0] - center[0], p[1] - center[1])),
            0
        )
        points.sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]))
        const cross = (o, a, b) =>
            (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
        const lower = [],
            upper = []
        for (const p of points) {
            while (
                lower.length >= 2 &&
                cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
            )
                lower.pop()
            lower.push(p)
        }
        for (let i = points.length - 1; i >= 0; i--) {
            const p = points[i]
            while (
                upper.length >= 2 &&
                cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
            )
                upper.pop()
            upper.push(p)
        }
        let hull = [...lower.slice(0, -1), ...upper.slice(0, -1)]
        if (hull.length < 3) return off
        if (hull.length > 128)
            hull = [...Array(128).keys()].map(
                (i) => hull[Math.floor((i * hull.length) / 128)]
            )
        const edges = new Float32Array(128 * 4)
        hull.forEach((a, i) => {
            const b = hull[(i + 1) % hull.length]
            const d = [b[0] - a[0], b[1] - a[1]]
            const l = Math.max(Math.hypot(d[0], d[1]), 0.0001)
            const n = [-d[1] / l, d[0] / l]
            edges.set([n[0], n[1], -(n[0] * a[0] + n[1] * a[1]), 0], i * 4)
        })
        const r = source.rect
        const mode =
            source.mode === "mask" ? (this.style.lightBackground ? 1 : 0) : 2
        return {
            "lens.rect": [r.x, r.y, r.width, r.height],
            "lens.uv": source.uv ?? [0, 0, 1, 1],
            "lens.viewport": [width * 0.5, height * 0.5, ppp, hull.length],
            "lens.parameters": [
                Math.min(1, strength),
                this.motion.yaw,
                radius,
                mode,
            ],
            "lens.center": [center[0], center[1], 0, 0],
            "lens.tint": source.backgroundColor
                ? [...source.backgroundColor, 1]
                : [0, 0, 0, 0],
            lensEdges: edges,
        }
    }

    destroy() {
        this.running = false
        this.detachPointer?.()
        const gl = this.gl
        setTimeout(() => {
            if (!this.canvas.isConnected)
                gl.getExtension("WEBGL_lose_context")?.loseContext()
        })
    }

    pause() {
        this.running = false
    }

    resume() {
        if (this.running) return
        this.running = true
        this.lastTime = null
        requestAnimationFrame(this.frame)
    }

    // MARK: - Simulation

    get heldProgress() {
        const s = this.style
        return s.dragGrow > 1
            ? clamp((this.grow - 1) / (s.dragGrow - 1), 0, 1)
            : this.motion.isDragging
              ? 1
              : 0
    }

    get speed() {
        return this.style.isRotating ? this.style.rotationSpeed : 0
    }

    updateMotion(time) {
        const dt =
            this.lastTime == null ? 0 : clamp(time - this.lastTime, 0, 0.05)
        this.lastTime = time
        if (!this.reduceMotion) this.elapsed += dt
        this.starBursts = this.starBursts.filter(
            (b) => this.elapsed - b.startTime < STAR_BURST_LIFETIME
        )
        const s = this.style
        this.motion.step(
            dt,
            this.speed,
            this.reduceMotion,
            s.animationMode,
            this.elapsed
        )
        if (this.reduceMotion) {
            this.grow = 1
            this.growVelocity = 0
        } else if (
            s.dragGrow !== 1 ||
            this.grow !== 1 ||
            this.growVelocity !== 0
        ) {
            // Spring toward the held size, with a slight bounce.
            const target = this.motion.isDragging ? s.dragGrow : 1
            let remaining = dt
            while (remaining > 0) {
                const step = Math.min(remaining, 1 / 240)
                this.growVelocity +=
                    ((target - this.grow) * 196 -
                        2 * s.growDamping * 14 * this.growVelocity) *
                    step
                this.grow += this.growVelocity * step
                remaining = Math.max(0, remaining - step)
            }
            if (
                Math.abs(this.grow - target) < 0.0001 &&
                Math.abs(this.growVelocity) < 0.0001
            ) {
                this.grow = target
                this.growVelocity = 0
            }
        }
        const raised =
            this.motion.isDragging || this.grow !== 1 || this.growVelocity !== 0
        if (raised !== this.raised) {
            this.raised = raised
            this.callbacks.onRaisedChanged?.(raised)
        }
    }

    addStarBurst() {
        if (!this.style.backgroundStars) return
        if (this.starBursts.length >= 3) this.starBursts.shift()
        this.starBursts.push({
            startTime: this.elapsed,
            seed: this.nextBurstSeed,
        })
        this.nextBurstSeed = (this.nextBurstSeed + 1) % 65536
        this.callbacks.onBurst?.()
    }

    /** Standard mode: a tap left/right of center. Returns null (ignored), false (nudge) or true (burst). */
    tap(horizontalOffset, time) {
        if (
            this.reduceMotion ||
            this.motion.isDragging ||
            Math.abs(horizontalOffset) <= 20 ||
            Math.abs(horizontalOffset) > 180
        )
            return null
        this.updateMotion(time)
        const burst = this.motion.tap(
            horizontalOffset < 0 ? -1 : 1,
            this.speed,
            this.style.animationMode,
            this.elapsed
        )
        if (burst) this.addStarBurst()
        return burst
    }

    endDrag(velocityX, time) {
        this.motion.step(
            0,
            this.style.rotationSpeed,
            this.reduceMotion,
            this.style.animationMode,
            this.elapsed
        )
        this.motion.end(time)
        if (Math.abs(velocityX) <= 600 || this.reduceMotion) return false
        this.motion.fling(velocityX < 0 ? -1 : 1)
        this.addStarBurst()
        return true
    }

    release(velocityX, scale, time) {
        this.motion.step(
            0,
            this.style.rotationSpeed,
            this.reduceMotion,
            this.style.animationMode,
            this.elapsed
        )
        const velocity = (velocityX * Math.PI) / Math.max(scale, 100)
        const limit = Math.max(0, this.style.maxReleaseSpin)
        this.motion.end(time, {
            releaseVelocity: this.reduceMotion
                ? 0
                : clamp(velocity, -limit, limit),
        })
    }

    /** pressToGrow: a quick tap (<0.25 s, <10 px) speeds the spin up; anything else lets go with the swipe's velocity. */
    endPress(duration, translation, locationX, width, velocityX, scale, time) {
        if (
            duration < 0.25 &&
            Math.hypot(translation[0], translation[1]) < 10
        ) {
            return this.tapSpin(locationX < width / 2 ? -1 : 1, time)
        }
        this.release(velocityX, scale, time)
        return false
    }

    tapSpin(direction, time) {
        this.release(0, 100, time)
        if (this.reduceMotion) return false
        const s = this.style
        const current = this.motion.spinAtPress
        const sign = Math.abs(current) > 0.5 ? Math.sign(current) : direction
        const top = Math.max(0, s.maxReleaseSpin)
        // Taps under a second apart form a streak; its n-th tap spins at least n/tapsToTopSpin of top speed.
        this.tapStreak = time - this.lastTapTime < 1 ? this.tapStreak + 1 : 1
        this.lastTapTime = time
        const streakSpeed =
            (top * this.tapStreak) / Math.max(1, s.tapsToTopSpin)
        const speed = Math.min(
            top,
            Math.max(Math.abs(current) + s.tapSpinStep, streakSpeed)
        )
        const reachedTop = speed >= top * 0.95
        if (reachedTop) this.tapStreak = 0
        this.motion.setSpin(
            sign * speed,
            reachedTop ? s.topSpinCoast : Math.max(s.releaseDecay, 0.05)
        )
        if (reachedTop) this.addStarBurst()
        return reachedTop
    }

    // MARK: - Pointer input

    attachPointer() {
        const canvas = this.canvas
        const input = this.input
        input.style.touchAction = "none"
        let press = null // { id, start, startX, startY, lastX, lastY, samples }
        const local = (e) => {
            const r = canvas.getBoundingClientRect()
            return [e.clientX - r.left, e.clientY - r.top, r.width, r.height]
        }
        const inHitArea = (x, y, w, h) => {
            const d = this.style.hitDiameter
            return d <= 0 || Math.hypot(x - w / 2, y - h / 2) <= d / 2
        }
        const velocity = (p, t) => {
            p.samples = p.samples.filter((s) => t - s.t <= 0.1)
            const first = p.samples[0]
            return first && t - first.t > 0.001
                ? (p.lastX - first.x) / (t - first.t)
                : 0
        }

        const down = (e) => {
            if (press || e.button > 0) return
            const [x, y, w, h] = local(e)
            if (!inHitArea(x, y, w, h)) return
            const t = now()
            press = {
                id: e.pointerId,
                start: t,
                startX: x,
                startY: y,
                lastX: x,
                lastY: y,
                samples: [{ x, t }],
                moved: false,
            }
            try {
                input.setPointerCapture(e.pointerId)
            } catch {
                /* synthetic pointers have nothing to capture */
            }
            this.updateMotion(t)
            if (this.style.interaction === "pressToGrow") {
                this.motion.begin(t)
                this.callbacks.onPressChanged?.(true)
            }
            e.preventDefault()
        }
        const move = (e) => {
            if (!press || e.pointerId !== press.id) return
            const [x, y, w, h] = local(e)
            const t = now()
            const dx = x - press.lastX,
                dy = y - press.lastY
            press.lastX = x
            press.lastY = y
            press.samples.push({ x, t })
            velocity(press, t)
            this.updateMotion(t)
            if (this.style.interaction === "standard") {
                // DragGesture(minimumDistance: 5)
                if (
                    !press.moved &&
                    Math.hypot(x - press.startX, y - press.startY) < 5
                )
                    return
                if (!press.moved) {
                    press.moved = true
                    this.motion.begin(t)
                }
            }
            this.motion.drag(dx, dy, Math.min(w, h), t)
        }
        const up = (e) => {
            if (!press || e.pointerId !== press.id) return
            const [x, y, w, h] = local(e)
            const t = now()
            // A finger that stopped before lifting has no release velocity.
            const stopped = t - press.samples[press.samples.length - 1].t > 0.05
            move(e)
            const vx = stopped ? 0 : velocity(press, t)
            this.updateMotion(t)
            if (this.style.interaction === "pressToGrow") {
                this.endPress(
                    t - press.start,
                    [x - press.startX, y - press.startY],
                    x,
                    w,
                    vx,
                    Math.min(w, h),
                    t
                )
                this.callbacks.onPressChanged?.(false)
            } else if (press.moved) {
                this.endDrag(vx, t)
            } else {
                this.tap(x - w / 2, t)
            }
            press = null
        }
        const cancel = (e) => {
            if (!press || e.pointerId !== press.id) return
            const t = now()
            if (this.motion.isDragging) this.release(velocity(press, t), 100, t)
            this.callbacks.onPressChanged?.(false)
            press = null
        }
        input.addEventListener("pointerdown", down)
        input.addEventListener("pointermove", move)
        input.addEventListener("pointerup", up)
        input.addEventListener("pointercancel", cancel)
        this.detachPointer = () => {
            input.removeEventListener("pointerdown", down)
            input.removeEventListener("pointermove", move)
            input.removeEventListener("pointerup", up)
            input.removeEventListener("pointercancel", cancel)
        }
    }

    // MARK: - Drawing

    resize() {
        const css = this.canvas.clientWidth
        const screen = css ? this.canvas.getBoundingClientRect().width / css : 1
        this.screenScale = Math.max(
            this.screenScale ?? 1,
            Math.min(Math.ceil(screen * 4) / 4, 6)
        )
        const ratio =
            Math.min(window.devicePixelRatio || 1, 3) * this.screenScale
        const w = Math.max(1, Math.round(this.canvas.clientWidth * ratio))
        const h = Math.max(1, Math.round(this.canvas.clientHeight * ratio))
        if (this.canvas.width !== w || this.canvas.height !== h) {
            this.canvas.width = w
            this.canvas.height = h
        }
        this.pixelRatio = ratio
    }

    uniforms(width, height, time) {
        const s = this.style,
            m = this.motion
        const grow = this.grow
        const model = rotation(m.pitch, m.yaw)
        const hScale = s.widthCompensation
            ? horizontalScale(this.data.widths, m.yaw, m.pitch)
            : 1
        let zoom
        const aspect = width / Math.max(height, 1)
        if (s.widthPoints > 0) {
            const base =
                (s.widthPoints * this.pixelRatio * 1.52 * Math.max(aspect, 1)) /
                width
            zoom = clamp(m.zoom * base * grow, 0.05, 2.4)
        } else if (s.dragGrow !== 1 || grow !== 1) {
            zoom = clamp(m.zoom * s.zoom * grow, 0.05, 2.4)
        } else {
            zoom = clamp(m.zoom * s.zoom, 0.6, 1.6)
        }
        const proj = projection(aspect, zoom)
        proj[0] *= hScale
        let shift = s.growShift * (grow - 1)
        if (s.floatAmplitude !== 0 && s.floatPeriod > 0 && !this.reduceMotion) {
            // Idle float, faded out as the stone grows while held.
            shift +=
                s.floatAmplitude *
                Math.sin((2 * Math.PI * time) / s.floatPeriod) *
                (1 - this.heldProgress)
        }
        if (shift !== 0) {
            const dy = (-2 * shift * this.pixelRatio) / height
            for (let c = 0; c < 4; c++) proj[c * 4 + 1] += dy * proj[c * 4 + 3]
        }
        const shiftX = (-s.growAnchorX * (grow - 1) * s.widthPoints) / 2
        if (shiftX !== 0) {
            const dx = (2 * shiftX * this.pixelRatio) / width
            for (let c = 0; c < 4; c++) proj[c * 4] += dx * proj[c * 4 + 3]
        }
        const animationTime = this.reduceMotion
            ? 0
            : Entrance.highlightTime(time, s.animationMode === "entrance")
        const sparkle = sparkleState(animationTime, s.appearance)
        // Angular speed from a short look-ahead, so the main flare hides while the stone turns fast.
        const lookAhead = 1 / 120
        const next = m.clone()
        next.step(
            lookAhead,
            this.speed,
            this.reduceMotion,
            s.animationMode,
            time + lookAhead
        )
        const yawDelta = Math.atan2(
            Math.sin(next.yaw - m.yaw),
            Math.cos(next.yaw - m.yaw)
        )
        const angularSpeed =
            Math.hypot(yawDelta, next.pitch - m.pitch) / lookAhead
        const main = mainPlacement(model, angularSpeed)
        const light = lightState(animationTime)
        return {
            "u.model": model,
            "u.projection": proj,
            "u.inverseModel": transpose(model),
            "u.parameters": [
                animationTime,
                clamp(s.refraction, 0, 1),
                Math.max(0, s.brightness),
                s.sparkles && !this.reduceMotion ? 1 : 0,
            ],
            "u.viewport": [width, height, this.data.planeCount, 0],
            "u.sparkleShape": sparkle.shape,
            "u.sparkleHalo": [
                sparkle.haloScale,
                main.faceRotation,
                hScale,
                main.visibility,
            ],
            "u.crownGradient": light.crown,
            "u.pavilionGradient": light.pavilion,
            "u.lightSweep": light.sweep,
            "u.facetProjection": this.data.facetProjection,
            "u.crownSweep": light.crownSweep,
            "u.rightCrownSweep": light.rightCrownSweep,
            "u.leftCrownSweep": light.leftCrownSweep,
            "u.pavilionSweep": light.pavilionSweep,
            "u.rightPavilionSweep": light.rightPavilionSweep,
            "u.leftPavilionSweep": light.leftPavilionSweep,
            "u.appearance": [s.appearance, 0, 0, 0],
        }
    }

    frame() {
        if (!this.running) return
        requestAnimationFrame(this.frame)
        this.resize()
        this.updateMotion(now())
        this.draw()
    }

    draw() {
        const gl = this.gl,
            s = this.style
        const width = this.canvas.width,
            height = this.canvas.height
        const time = this.elapsed
        gl.viewport(0, 0, width, height)
        gl.clearColor(0, 0, 0, 0)
        gl.clearDepth(1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        const u = this.uniforms(width, height, time)

        // Background stars: premultiplied blending, no depth.
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
        if (s.backgroundStars && s.starOpacity > 0.001 && !this.reduceMotion) {
            const entrance = s.animationMode === "entrance"
            gl.disable(gl.DEPTH_TEST)
            gl.disable(gl.CULL_FACE)
            gl.useProgram(this.stars.program)
            gl.bindVertexArray(this.emptyVAO)
            const stars = {
                "u.projection": projection(
                    width / Math.max(height, 1),
                    Math.max(0.2, s.starZoom),
                    false
                ),
                "u.animation": [
                    0,
                    Entrance.particleTime(time, entrance),
                    0,
                    s.lightBackground ? 1 : 0,
                ],
                "u.layoutInfo": [width, height, Entrance.steadyStarCount, 0],
                "u.appearance": u["u.appearance"],
                "u.tint": [
                    Math.max(0, s.starBrightness),
                    clamp(s.starOpacity, 0, 1),
                    Math.max(0.05, s.starEmission),
                    0,
                ],
                instanceOffset: 0,
            }
            if (s.steadyStars) {
                setUniforms(gl, this.stars, stars)
                gl.drawArraysInstanced(
                    gl.TRIANGLES,
                    0,
                    6,
                    Entrance.steadyStarCount
                )
            }
            for (const burst of this.starBursts) {
                if (
                    time < burst.startTime ||
                    time - burst.startTime >= STAR_BURST_LIFETIME
                )
                    continue
                stars["u.animation"] = [
                    time - burst.startTime,
                    stars["u.animation"][1],
                    1,
                    stars["u.animation"][3],
                ]
                stars["u.layoutInfo"] = [
                    width,
                    height,
                    Entrance.steadyStarCount,
                    burst.seed,
                ]
                stars.instanceOffset = Entrance.steadyStarCount
                setUniforms(gl, this.stars, stars)
                const count = Math.floor(
                    Entrance.burstStarCount * clamp(s.burstSize, 0, 1)
                )
                gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, Math.max(count, 1))
            }
        }

        // The stone: opaque, depth-tested, back faces culled.
        gl.disable(gl.BLEND)
        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)
        gl.depthMask(true)
        gl.enable(gl.CULL_FACE)
        gl.frontFace(gl.CCW)
        gl.cullFace(gl.BACK)
        gl.useProgram(this.stone.program)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.lensTexture)
        setUniforms(gl, this.stone, {
            ...u,
            planes: this.data.planes,
            ...this.lensUniforms(u, width, height),
        })
        gl.bindVertexArray(this.stoneVAO)
        gl.drawArrays(gl.TRIANGLES, 0, this.data.vertexCount)

        // Surface sparkles on top.
        if (s.sparkles && !this.reduceMotion) {
            gl.enable(gl.BLEND)
            gl.disable(gl.DEPTH_TEST)
            gl.disable(gl.CULL_FACE)
            gl.useProgram(this.sparkle.program)
            const sparkleUniforms = {
                ...u,
                anchorPositions: this.data.anchorPositions,
                anchorNormals: this.data.anchorNormals,
            }
            setUniforms(gl, this.sparkle, {
                ...sparkleUniforms,
                instanceOffset: 0,
            })
            gl.bindVertexArray(this.mainSparkles.vao)
            gl.drawArrays(gl.TRIANGLES, 0, this.mainSparkles.count)
            setUniforms(gl, this.sparkle, { instanceOffset: 1 })
            gl.bindVertexArray(this.smallSparkles.vao)
            gl.drawArraysInstanced(gl.TRIANGLES, 0, this.smallSparkles.count, 7)
        }
        gl.bindVertexArray(null)
    }
}
