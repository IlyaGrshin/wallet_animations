export function identity() {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
}

export function multiply(a, b) {
    const output = new Float32Array(16)
    for (let column = 0; column < 4; column += 1) {
        for (let row = 0; row < 4; row += 1) {
            let value = 0
            for (let index = 0; index < 4; index += 1) {
                value += a[index * 4 + row] * b[column * 4 + index]
            }
            output[column * 4 + row] = value
        }
    }
    return output
}

export function perspective(fieldOfView, aspect, near, far) {
    const f = 1 / Math.tan(fieldOfView / 2)
    const range = 1 / (near - far)
    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * range, -1,
        0, 0, 2 * far * near * range, 0,
    ])
}

export function translation(x, y, z) {
    const matrix = identity()
    matrix[12] = x
    matrix[13] = y
    matrix[14] = z
    return matrix
}

export function rotationX(angle) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1])
}

export function rotationY(angle) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1])
}

export function normalMatrix(matrix) {
    return new Float32Array([
        matrix[0], matrix[1], matrix[2],
        matrix[4], matrix[5], matrix[6],
        matrix[8], matrix[9], matrix[10],
    ])
}
