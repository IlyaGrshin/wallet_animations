import { useEffect, useRef, useState } from "react"

import { createFaceArtwork, disposeFaceArtwork } from "./artwork"
import { disposeMesh, loadMesh } from "./mesh"
import { startCardLoop } from "./renderLoop"
import { createScene } from "./scene"

import cardFrontUrl from "./assets/card_front.binobj?url"
import cardBackUrl from "./assets/card_back.binobj?url"
import cardEdgeUrl from "./assets/card_edge.binobj?url"

const CONTEXT_OPTIONS = {
    antialias: true,
    alpha: true,
    depth: true,
    powerPreference: "high-performance",
}

export default function useCardScene(canvas, { name, address, gramAmount, balance }) {
    const runtimeRef = useRef(null)
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        if (!canvas) return undefined

        const gl = canvas.getContext("webgl", CONTEXT_OPTIONS)
        if (!gl || gl.isContextLost()) {
            setFailed(true)
            return undefined
        }
        if (!gl.getExtension("OES_standard_derivatives")) {
            setFailed(true)
            return undefined
        }

        let scene
        try {
            scene = createScene(gl)
        } catch (error) {
            console.error(error)
            setFailed(true)
            return undefined
        }

        const contents = { meshes: null, textures: null }
        const loop = startCardLoop(canvas, gl, scene, contents)
        const runtime = { gl, contents, loop, disposed: false }
        runtimeRef.current = runtime

        Promise.all([
            loadMesh(gl, cardFrontUrl, 0, 1),
            loadMesh(gl, cardBackUrl, 0),
            loadMesh(gl, cardEdgeUrl, 1),
        ])
            .then((meshes) => {
                if (runtime.disposed) {
                    for (const mesh of meshes) disposeMesh(gl, mesh)
                    return
                }
                contents.meshes = meshes
                loop.requestRedraw()
            })
            .catch((error) => {
                console.error(error)
                setFailed(true)
            })

        return () => {
            runtime.disposed = true
            runtimeRef.current = null
            loop.stop()
            if (contents.meshes) {
                for (const mesh of contents.meshes) disposeMesh(gl, mesh)
            }
            if (contents.textures) disposeFaceArtwork(gl, contents.textures)
            scene.dispose()
        }
    }, [canvas])

    useEffect(() => {
        const runtime = runtimeRef.current
        if (!runtime) return undefined

        let cancelled = false
        createFaceArtwork(runtime.gl, { name, address, gramAmount, balance })
            .then((textures) => {
                if (cancelled || runtime.disposed) {
                    disposeFaceArtwork(runtime.gl, textures)
                    return
                }
                const previous = runtime.contents.textures
                runtime.contents.textures = textures
                if (previous) disposeFaceArtwork(runtime.gl, previous)
                runtime.loop.requestRedraw()
            })
            .catch((error) => {
                console.error(error)
            })

        return () => {
            cancelled = true
        }
    }, [canvas, name, address, gramAmount, balance])

    return failed
}
