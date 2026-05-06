import { useEffect, useRef } from "react"
import PropTypes from "prop-types"
import { useResizeObserver } from "../../hooks/useResizeObserver"
import * as styles from "./TitaniumTexture.module.scss"
import VERT_SRC from "./vert.glsl?raw"
import FRAG_SRC from "./frag.glsl?raw"

const MAX_DPR = 2

function compileShader(gl, type, src) {
    const sh = gl.createShader(type)
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return sh
    console.error(`Shader compile error: ${gl.getShaderInfoLog(sh)}`)
    gl.deleteShader(sh)
    return null
}

function createProgram(gl) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC)
    if (!vs || !fs) return null
    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    if (gl.getProgramParameter(prog, gl.LINK_STATUS)) return prog
    console.error(`Program link error: ${gl.getProgramInfoLog(prog)}`)
    gl.deleteProgram(prog)
    return null
}

export default function TitaniumTexture({
    brushed = 0.7,
    amount = 1,
    className,
}) {
    const canvasRef = useRef(null)
    const drawRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return undefined

        const gl = canvas.getContext("webgl2", {
            alpha: false,
            antialias: false,
            premultipliedAlpha: false,
        })
        if (!gl) return undefined

        const prog = createProgram(gl)
        if (!prog) return undefined
        gl.useProgram(prog)

        const buf = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            gl.STATIC_DRAW,
        )
        const aPos = gl.getAttribLocation(prog, "a_position")
        gl.enableVertexAttribArray(aPos)
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

        const uRes = gl.getUniformLocation(prog, "u_resolution")
        gl.uniform1f(gl.getUniformLocation(prog, "u_brushed"), brushed)
        gl.uniform1f(gl.getUniformLocation(prog, "u_amount"), amount)

        drawRef.current = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
            const w = Math.max(1, Math.floor(canvas.clientWidth * dpr))
            const h = Math.max(1, Math.floor(canvas.clientHeight * dpr))
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w
                canvas.height = h
                gl.viewport(0, 0, w, h)
            }
            gl.uniform2f(uRes, w, h)
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        }
        drawRef.current()

        return () => {
            drawRef.current = null
            gl.deleteBuffer(buf)
            gl.deleteProgram(prog)
        }
    }, [brushed, amount])

    useResizeObserver(canvasRef, () => drawRef.current?.())

    return (
        <canvas
            ref={canvasRef}
            className={[styles.canvas, className].filter(Boolean).join(" ")}
            aria-hidden="true"
        />
    )
}

TitaniumTexture.propTypes = {
    brushed: PropTypes.number,
    amount: PropTypes.number,
    className: PropTypes.string,
}
