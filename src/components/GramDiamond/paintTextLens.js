function drawLine(context, element, text) {
    if (!element || !text) return
    const style = getComputedStyle(element)
    const box = element.getBoundingClientRect()
    const screenScale = element.offsetWidth
        ? box.width / element.offsetWidth
        : 1
    const fontSize = parseFloat(style.fontSize) * screenScale
    context.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`
    context.fillStyle = style.color
    context.fillText(text, box.left, box.top + box.height / 2)
}

export default function paintTextLens(canvas, lines) {
    const box = canvas.getBoundingClientRect()
    if (!box.width || !box.height) return null
    const ratio = Math.min(window.devicePixelRatio || 1, 3)
    const image = document.createElement("canvas")
    image.width = Math.round(box.width * ratio)
    image.height = Math.round(box.height * ratio)
    const context = image.getContext("2d")
    context.setTransform(
        ratio,
        0,
        0,
        ratio,
        -box.left * ratio,
        -box.top * ratio
    )
    context.textBaseline = "middle"
    for (const [element, text] of lines) drawLine(context, element, text)
    return image
}
