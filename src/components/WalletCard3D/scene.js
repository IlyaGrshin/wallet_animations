import {
    multiply,
    normalMatrix,
    perspective,
    rotationX,
    rotationY,
    translation,
} from "./matrix"
import {
    CARD_COLOR,
    LIGHT_DIRECTION,
    LIGHT_POSITION,
    SCALAR_UNIFORMS,
    hexToLinearRgb,
} from "./preset"
import { ARTWORK_HEIGHT, ARTWORK_WIDTH } from "./artwork"

import vertexSource from "./shaders/card.vert.glsl?raw"
import fragmentSource from "./shaders/card.frag.glsl?raw"

const FIELD_OF_VIEW = Math.PI / 4.6
const CARD_ASPECT = 1.64
const CARD_HALF_HEIGHT = 1 / CARD_ASPECT

// The canvas is CANVAS_OVERSCAN times the card box (see the SCSS inset), so the
// camera pulls back by the same factor to land the card at its 2D footprint.
export const CANVAS_OVERSCAN = 1.35
const DISTANCE =
    (CARD_HALF_HEIGHT * CANVAS_OVERSCAN) / Math.tan(FIELD_OF_VIEW / 2)

function compileShader(gl, type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader)
        gl.deleteShader(shader)
        throw new Error(message)
    }
    return shader
}

function createProgram(gl) {
    const program = gl.createProgram()
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const message = gl.getProgramInfoLog(program)
        gl.deleteProgram(program)
        throw new Error(message)
    }
    return program
}

const STRUCTURAL_UNIFORMS = [
    "uProjection",
    "uModelView",
    "uNormalMatrix",
    "uEdge",
    "uFrontFace",
    "uLightDirection",
    "uLightPosition",
    "uCardColor",
    "uArtworkTexture",
    "uEngravingTexture",
    "uQrTexture",
    "uHeightTexture",
    "uArtworkTexel",
    "uEngravingTexel",
    "uHeightTexel",
]

const TEXTURE_UNITS = [
    ["artwork", "uArtworkTexture"],
    ["engraving", "uEngravingTexture"],
    ["qr", "uQrTexture"],
    ["height", "uHeightTexture"],
]

export function createScene(gl) {
    const program = createProgram(gl)
    const attributes = {
        position: gl.getAttribLocation(program, "aPosition"),
        normal: gl.getAttribLocation(program, "aNormal"),
    }
    const uniforms = Object.fromEntries(
        [...STRUCTURAL_UNIFORMS, ...Object.keys(SCALAR_UNIFORMS)].map(
            (name) => [name, gl.getUniformLocation(program, name)]
        )
    )
    const cardColor = hexToLinearRgb(CARD_COLOR)
    const lightLength = Math.hypot(...LIGHT_DIRECTION) || 1
    const lightDirection = LIGHT_DIRECTION.map((axis) => axis / lightLength)

    function bindAttribute(location, buffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.enableVertexAttribArray(location)
        gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0)
    }

    function draw({ meshes, textures, tiltX, tiltY }) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.CULL_FACE)
        // Swapping the model's X/Z axes to face the camera reverses winding.
        gl.frontFace(gl.CW)
        gl.cullFace(gl.BACK)

        if (!meshes || !textures) return

        const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight
        let modelView = translation(0, 0, -DISTANCE)
        modelView = multiply(modelView, rotationX(tiltX))
        modelView = multiply(modelView, rotationY(tiltY))

        gl.useProgram(program)
        gl.uniformMatrix4fv(
            uniforms.uProjection,
            false,
            perspective(FIELD_OF_VIEW, aspect, 0.1, 20)
        )
        gl.uniformMatrix4fv(uniforms.uModelView, false, modelView)
        gl.uniformMatrix3fv(
            uniforms.uNormalMatrix,
            false,
            normalMatrix(modelView)
        )
        for (const [name, value] of Object.entries(SCALAR_UNIFORMS)) {
            gl.uniform1f(uniforms[name], value)
        }
        gl.uniform3fv(uniforms.uLightDirection, lightDirection)
        gl.uniform3f(
            uniforms.uLightPosition,
            modelView[12] + LIGHT_POSITION[0],
            modelView[13] + LIGHT_POSITION[1],
            modelView[14] + LIGHT_POSITION[2]
        )
        gl.uniform3fv(uniforms.uCardColor, cardColor)
        gl.uniform2f(
            uniforms.uArtworkTexel,
            1 / ARTWORK_WIDTH,
            1 / ARTWORK_HEIGHT
        )
        gl.uniform2f(
            uniforms.uEngravingTexel,
            1 / textures.engravingWidth,
            1 / textures.engravingHeight
        )
        gl.uniform2f(
            uniforms.uHeightTexel,
            1 / textures.heightWidth,
            1 / textures.heightHeight
        )
        TEXTURE_UNITS.forEach(([key, uniform], unit) => {
            gl.activeTexture(gl.TEXTURE0 + unit)
            gl.bindTexture(gl.TEXTURE_2D, textures[key])
            gl.uniform1i(uniforms[uniform], unit)
        })

        for (const mesh of meshes) {
            bindAttribute(attributes.position, mesh.positionBuffer)
            bindAttribute(attributes.normal, mesh.normalBuffer)
            gl.uniform1f(uniforms.uEdge, mesh.edge)
            gl.uniform1f(uniforms.uFrontFace, mesh.frontFace)
            gl.drawArrays(gl.TRIANGLES, 0, mesh.vertexCount)
        }
    }

    return {
        draw,
        dispose: () => gl.deleteProgram(program),
    }
}
