// Canvas-measured glyph widths in em, cached per unique label — exact with
// zero layout involvement. 600 covers both skins: material's medium only
// renders narrower.
const measureCtx = document.createElement("canvas").getContext("2d")
const emWidths = new Map()
const EM_WIDTHS_LIMIT = 500
const labelEm = (text, weight) => {
    const key = `${weight} ${text}`
    let em = emWidths.get(key)
    if (em === undefined) {
        if (emWidths.size >= EM_WIDTHS_LIMIT) emWidths.clear()
        measureCtx.font = `${weight} 100px system-ui, -apple-system, sans-serif`
        em = measureCtx.measureText(text).width / 100
        emWidths.set(key, em)
    }
    return em
}

export default labelEm
