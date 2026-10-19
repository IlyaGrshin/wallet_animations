import VERTEX_SHADER from "./vertex.glsl?raw"
import FRAGMENT_SHADER from "./fragment.glsl?raw"

const FEEDBACK_VARYINGS = [
    "outPosition",
    "outVelocity",
    "outTime",
    "outDuration",
    "outAlpha",
    "outColor",
]

const STRIDE = 40 // 10 floats * 4 bytes
const ATTRIBS = [
    [0, 2, 0],
    [1, 2, 8],
    [2, 1, 16],
    [3, 1, 20],
    [4, 1, 24],
    [5, 3, 28],
]

function compile(gl, type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader))
    }
    return shader
}

export function linkProgram(gl) {
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.transformFeedbackVaryings(
        program,
        FEEDBACK_VARYINGS,
        gl.INTERLEAVED_ATTRIBS
    )
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program))
    }
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    return program
}

// One-time GL setup: points the sampler at unit 0 and configures blending.
// Scissoring keeps every instance inside its own slot of the shared atlas.
export function setupGl(gl, program, loc) {
    gl.useProgram(program)
    gl.uniform1i(loc.textTexture, 0)
    gl.clearColor(0, 0, 0, 0)
    gl.enable(gl.BLEND)
    gl.enable(gl.SCISSOR_TEST)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
}

// Per-instance glyph mask texture (unit 0, mipmapped, clamped).
export function createMaskTexture(gl) {
    const texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_NEAREST
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    return texture
}

export function createBuffers(gl, count) {
    const buffers = [gl.createBuffer(), gl.createBuffer()]
    for (const buffer of buffers) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, count * STRIDE, gl.DYNAMIC_DRAW)
    }
    return buffers
}

export function bindAttribs(gl) {
    for (const [index, size, offset] of ATTRIBS) {
        gl.vertexAttribPointer(index, size, gl.FLOAT, false, STRIDE, offset)
        gl.enableVertexAttribArray(index)
    }
}

let probe = null
const colorCache = new Map()

// Resolves any CSS color to opaque [r,g,b] 0..1 (alpha dropped), cached.
export function resolveColor(value) {
    let rgb = colorCache.get(value)
    if (rgb) return rgb
    probe ??= document
        .createElement("canvas")
        .getContext("2d", { willReadFrequently: true })
    probe.clearRect(0, 0, 1, 1)
    probe.fillStyle = "#fff"
    probe.fillStyle = value
    probe.fillRect(0, 0, 1, 1)
    // getImageData is unpremultiplied, so translucent colors keep their hue.
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data
    rgb = [r / 255, g / 255, b / 255]
    colorCache.set(value, rgb)
    return rgb
}

export const toCss = ([r, g, b]) =>
    `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`
