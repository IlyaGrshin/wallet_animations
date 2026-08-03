import { formatAddress } from "../../utils/address"

import {
    loadImage,
    uploadCanvasTexture,
    uploadMipmappedCanvasTexture,
} from "./textures"

import gramDiamondUrl from "./assets/gram-diamond.svg?url"
import qrButtonUrl from "./assets/qr-button-webgl.svg?url"
import heightMapUrl from "./assets/card_height1.png?url"

export const ARTWORK_WIDTH = 1640
export const ARTWORK_HEIGHT = 1000

const DESIGN_WIDTH = 336
const SCALE = ARTWORK_WIDTH / DESIGN_WIDTH

const ROUNDED_STACK = `"SF Pro Rounded", ".SF NS Rounded", sans-serif`
const GRAM_STACK = `"Gram Sans", sans-serif`
const MONO_STACK = `"Roboto Mono Card", monospace`

function createContext() {
    const canvas = document.createElement("canvas")
    canvas.width = ARTWORK_WIDTH
    canvas.height = ARTWORK_HEIGHT
    return canvas.getContext("2d")
}

function drawTrackedText(context, text, centerX, baselineY, tracking) {
    const widths = [...text].map(
        (character) => context.measureText(character).width
    )
    const totalWidth =
        widths.reduce((sum, width) => sum + width, 0) +
        tracking * Math.max(text.length - 1, 0)
    let cursor = centerX - totalWidth / 2

    ;[...text].forEach((character, index) => {
        context.fillText(character, cursor, baselineY)
        cursor += widths[index] + tracking
    })
}

function drawFace(context, { name, gramAmount, balance }, gramImage) {
    context.drawImage(
        gramImage,
        22 * SCALE,
        70 * SCALE,
        28 * SCALE,
        28 * SCALE
    )

    context.fillStyle = "#ffffff"
    context.font = `600 ${22 * SCALE}px ${ROUNDED_STACK}`
    context.textBaseline = "alphabetic"
    context.fillText(gramAmount, 51 * SCALE, 93 * SCALE)
    const amountWidth = context.measureText(gramAmount).width

    context.fillStyle = "#6ddcff"
    context.font = `500 ${15 * SCALE}px ${GRAM_STACK}`
    context.fillText("GRAM", 55 * SCALE + amountWidth, 92 * SCALE)

    context.fillStyle = "#87efff"
    context.font = `500 ${13 * SCALE}px ${MONO_STACK}`
    context.fillText(balance, 24 * SCALE, 115 * SCALE)

    context.fillStyle = "#ffffff"
    context.font = `500 ${13 * SCALE}px ${MONO_STACK}`
    context.fillText(name.toUpperCase(), 24 * SCALE, 185 * SCALE)
}

function drawEngraving(context, address) {
    const [line1, line2] = formatAddress(address)

    context.fillStyle = "#ffffff"
    context.font = `400 ${9.7 * SCALE}px ${MONO_STACK}`
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.save()
    context.translate(313 * SCALE, 102.5 * SCALE)
    context.rotate(Math.PI / 2)
    drawTrackedText(context, line1.toUpperCase(), 0, -5.6 * SCALE, 0)
    drawTrackedText(context, line2.toUpperCase(), 0, 5.6 * SCALE, 0)
    context.restore()
}

export async function createFaceArtwork(gl, values) {
    const [gramImage, qrImage, heightImage] = await Promise.all([
        loadImage(gramDiamondUrl),
        loadImage(qrButtonUrl),
        loadImage(heightMapUrl),
        document.fonts.load(`500 ${15 * SCALE}px "Gram Sans"`),
        document.fonts.load(`500 ${13 * SCALE}px "Roboto Mono Card"`),
        document.fonts.load(`400 ${9.7 * SCALE}px "Roboto Mono Card"`),
        document.fonts.load(`600 ${22 * SCALE}px "SF Pro Rounded"`),
    ])

    const face = createContext()
    drawFace(face, values, gramImage)

    const qr = createContext()
    qr.drawImage(qrImage, 241 * SCALE, 73 * SCALE, 50 * SCALE, 38 * SCALE)

    const engraving = createContext()
    drawEngraving(engraving, values.address)

    const engravingUpload = uploadMipmappedCanvasTexture(gl, engraving.canvas)

    return {
        artwork: uploadCanvasTexture(gl, face.canvas),
        engraving: engravingUpload.texture,
        engravingWidth: engravingUpload.width,
        engravingHeight: engravingUpload.height,
        qr: uploadCanvasTexture(gl, qr.canvas),
        height: uploadCanvasTexture(gl, heightImage),
        heightWidth: heightImage.naturalWidth,
        heightHeight: heightImage.naturalHeight,
    }
}

export function disposeFaceArtwork(gl, textures) {
    gl.deleteTexture(textures.artwork)
    gl.deleteTexture(textures.engraving)
    gl.deleteTexture(textures.qr)
    gl.deleteTexture(textures.height)
}
