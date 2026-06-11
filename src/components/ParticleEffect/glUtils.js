import VERTEX_SHADER from "./vertex.glsl?raw"
import FRAGMENT_SHADER from "./fragment.glsl?raw"

const FEEDBACK_VARYINGS = [
    "outPosition",
    "outVelocity",
    "outTime",
    "outDuration",
    "outAlpha",
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
    gl.transformFeedbackVaryings(program, FEEDBACK_VARYINGS, gl.INTERLEAVED_ATTRIBS)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program))
    }
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    return program
}

// Resolves any CSS color (or the element's computed text color) to [r,g,b] 0..1.
export function resolveColor(input, fallbackEl) {
    const value =
        input || (fallbackEl ? getComputedStyle(fallbackEl).color : "#fff")
    const c = document.createElement("canvas")
    c.width = c.height = 1
    const ctx = c.getContext("2d")
    ctx.fillStyle = value
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return [r / 255, g / 255, b / 255]
}
