function readFloatArray(view, state) {
    const length = view.getInt32(state.offset, false)
    state.offset += 4
    const values = new Float32Array(length)
    for (let index = 0; index < length; index += 1) {
        values[index] = view.getFloat32(state.offset, false)
        state.offset += 4
    }
    return values
}

function parseBinObj(buffer) {
    const view = new DataView(buffer)
    const state = { offset: 0 }
    const sourcePositions = readFloatArray(view, state)
    readFloatArray(view, state)
    const sourceNormals = readFloatArray(view, state)
    const vertexCount = view.getInt32(state.offset, false)
    state.offset += 4

    const positions = new Float32Array(vertexCount * 3)
    const normals = new Float32Array(vertexCount * 3)

    for (let vertex = 0; vertex < vertexCount; vertex += 1) {
        const positionIndex = view.getInt32(state.offset, false) * 3
        state.offset += 8
        const normalIndex = view.getInt32(state.offset, false) * 3
        state.offset += 4

        positions.set(
            sourcePositions.subarray(positionIndex, positionIndex + 3),
            vertex * 3
        )
        normals.set(
            sourceNormals.subarray(normalIndex, normalIndex + 3),
            vertex * 3
        )
    }

    return { positions, normals, vertexCount }
}

function smoothCoincidentNormals(positions, normals) {
    const groups = new Map()

    for (let vertex = 0; vertex < positions.length / 3; vertex += 1) {
        const offset = vertex * 3
        const positionKey = [
            positions[offset],
            positions[offset + 1],
            positions[offset + 2],
        ].join(",")
        const normal = [
            normals[offset],
            normals[offset + 1],
            normals[offset + 2],
        ]

        if (!groups.has(positionKey)) {
            groups.set(positionKey, { vertices: [], normals: new Map() })
        }
        const group = groups.get(positionKey)
        group.vertices.push(vertex)
        group.normals.set(normal.join(","), normal)
    }

    for (const group of groups.values()) {
        const average = [0, 0, 0]
        for (const normal of group.normals.values()) {
            average[0] += normal[0]
            average[1] += normal[1]
            average[2] += normal[2]
        }
        const length = Math.hypot(average[0], average[1], average[2]) || 1
        average[0] /= length
        average[1] /= length
        average[2] /= length

        for (const vertex of group.vertices) {
            normals.set(average, vertex * 3)
        }
    }
}

function uploadAttribute(gl, values) {
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, values, gl.STATIC_DRAW)
    return buffer
}

export async function loadMesh(gl, url, edge, frontFace = 0) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Could not load ${url}`)
    const mesh = parseBinObj(await response.arrayBuffer())
    if (edge) smoothCoincidentNormals(mesh.positions, mesh.normals)
    return {
        vertexCount: mesh.vertexCount,
        edge,
        frontFace,
        positionBuffer: uploadAttribute(gl, mesh.positions),
        normalBuffer: uploadAttribute(gl, mesh.normals),
    }
}

export function disposeMesh(gl, mesh) {
    gl.deleteBuffer(mesh.positionBuffer)
    gl.deleteBuffer(mesh.normalBuffer)
}
