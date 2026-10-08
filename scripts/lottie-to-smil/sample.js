// Renders a Lottie file with lottie-web's own SVG renderer inside jsdom and
// records every element's attributes at each sample step. Sampling the real
// renderer (instead of re-implementing Lottie's math) keeps the output
// frame-exact for every feature lottie-web supports.
import { createRequire } from "node:module"
import { JSDOM } from "jsdom"

const require = createRequire(import.meta.url)

const dom = new JSDOM("<!doctype html><body></body>", {
    pretendToBeVisual: true,
})
globalThis.window = dom.window
globalThis.document = dom.window.document
Object.defineProperty(globalThis, "navigator", {
    value: dom.window.navigator,
    configurable: true,
})
// lottie-web probes a 2D canvas at load time; the SVG renderer never draws.
dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    fillRect() {},
    fillStyle: "",
})

const lottie = require("lottie-web/build/player/lottie_light.js")

// Four samples per Lottie frame: hold keyframes and fractional keyframe times
// land within an eighth of a frame of their true position.
export const STEPS_PER_FRAME = 4

const readState = (el) => {
    const attrs = {}
    for (const { name, value } of el.attributes) attrs[name] = value
    return attrs
}

export function sampleLottie(data) {
    const container = document.createElement("div")
    document.body.appendChild(container)

    const anim = lottie.loadAnimation({
        container,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: structuredClone(data),
    })

    const root = container.querySelector("svg")
    const elements = [root, ...root.querySelectorAll("*")]
    const frameCount = data.op - data.ip
    const samples = []

    for (let step = 0; step <= frameCount * STEPS_PER_FRAME; step++) {
        const frame = step / STEPS_PER_FRAME
        anim.goToAndStop(frame, true)
        const current = [root, ...root.querySelectorAll("*")]
        if (current.length !== elements.length) {
            throw new Error(`DOM changed shape at frame ${frame}`)
        }
        samples.push({
            time: frame / data.fr,
            states: elements.map(readState),
        })
    }

    const nodes = elements.map((el) => ({
        tag: el.tagName,
        parent: elements.indexOf(el.parentElement),
    }))

    anim.destroy()
    container.remove()

    return {
        nodes,
        samples,
        duration: frameCount / data.fr,
    }
}
