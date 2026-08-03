export function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener("load", () => resolve(image), { once: true })
        image.addEventListener(
            "error",
            () => reject(new Error(`Could not load ${url}`)),
            { once: true }
        )
        image.src = url
    })
}

function createTexture(gl, minFilter) {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    return texture
}

export function uploadCanvasTexture(gl, source) {
    const texture = createTexture(gl, gl.LINEAR)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
    gl.bindTexture(gl.TEXTURE_2D, null)
    return texture
}

export function uploadMipmappedCanvasTexture(gl, source) {
    const width = 2 ** Math.ceil(Math.log2(source.width))
    const height = 2 ** Math.ceil(Math.log2(source.height))
    const mipSource = document.createElement("canvas")
    mipSource.width = width
    mipSource.height = height
    const mipContext = mipSource.getContext("2d")
    mipContext.imageSmoothingEnabled = true
    mipContext.imageSmoothingQuality = "high"
    mipContext.drawImage(source, 0, 0, width, height)

    const texture = createTexture(gl, gl.LINEAR_MIPMAP_LINEAR)
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        mipSource
    )
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.bindTexture(gl.TEXTURE_2D, null)
    return { texture, width, height }
}
