import { useEffect, useRef } from "react"
import PropTypes from "prop-types"
import * as styles from "./TitaniumTexture.module.scss"
import VERT_SRC from "./vert.glsl?raw"
import FRAG_SRC from "./frag.glsl?raw"

const MAX_DPR = 2

function compileShader(gl, type, src) {
    const sh = gl.createShader(type)
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(sh)
        gl.deleteShader(sh)
        throw new Error(`Shader compile error: ${log}`)
    }
    return sh
}

function createProgram(gl) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, VERT_SRC)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC)
    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(prog)
        gl.deleteProgram(prog)
        throw new Error(`Program link error: ${log}`)
    }
    return prog
}

export default function TitaniumTexture({
    brushed = 0.7,
    amount = 1,
    className,
}) {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return undefined

        const gl = canvas.getContext("webgl2", {
            alpha: false,
            antialias: false,
            premultipliedAlpha: false,
        })
        if (!gl) return undefined

        let prog
        try {
            prog = createProgram(gl)
        } catch (err) {
            console.error(err)
            return undefined
        }
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
        const uBrushed = gl.getUniformLocation(prog, "u_brushed")
        const uAmount = gl.getUniformLocation(prog, "u_amount")

        gl.uniform1f(uBrushed, brushed)
        gl.uniform1f(uAmount, amount)

        const draw = () => {
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
        const ro = new ResizeObserver(draw)
        ro.observe(canvas)
        draw()

        return () => {
            ro.disconnect()
            gl.deleteBuffer(buf)
            gl.deleteProgram(prog)
        }
    }, [brushed, amount])

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
