// Port of DiamondGeometry.swift: the bevelled cut, its optical hull (17 planes), the sparkle
// contours and anchors, and the silhouette widths used for width compensation.
// Everything is generated once at startup (a few tens of milliseconds).

export const ROUNDING_RADIUS = 0.055
const CROWN_ROUNDING_RADIUS = 0.32865
const GIRDLE_ROUNDING_RADIUS = 0.073114
const OUTLINE_BOW = 0.106987
const SEGMENTS = 3
const EDGE_STEP = 0.4
const RADIAL_STEPS = 2

export const REFERENCE_PITCH = -0.104458
export const CAMERA_DISTANCE = 6
export const CAMERA_SCALE = 0.948985

// MARK: - Vector helpers (plain arrays)

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s]
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
]
const length = (a) => Math.hypot(a[0], a[1], a[2])
const normalize = (a) => scale(a, 1 / length(a))
const mix = (a, b, t) => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
]
const distSq = (a, b) => {
    const d = sub(a, b)
    return dot(d, d)
}

// MARK: - Camera math (DiamondMath)

/** Column-major 4x4 rotation: pitch (around x) applied after yaw (around y), like `pitch * yaw` quaternions. */
export function rotation(x, y) {
    const cx = Math.cos(x),
        sx = Math.sin(x),
        cy = Math.cos(y),
        sy = Math.sin(y)
    // Rx * Ry, rows: [cy, 0, sy], [sx*sy, cx, -sx*cy], [-cx*sy, sx, cx*cy]
    return new Float32Array([
        cy,
        sx * sy,
        -cx * sy,
        0,
        0,
        cx,
        sx,
        0,
        sy,
        -sx * cy,
        cx * cy,
        0,
        0,
        0,
        0,
        1,
    ])
}

/** m * v for a column-major mat4 and a 4-vector. */
export function transform(m, v) {
    return [
        m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
        m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
        m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
        m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3],
    ]
}

export function transpose(m) {
    const r = new Float32Array(16)
    for (let c = 0; c < 4; c++)
        for (let row = 0; row < 4; row++) r[c * 4 + row] = m[row * 4 + c]
    return r
}

export const cameraW = (z) => (1 - z / CAMERA_DISTANCE) / CAMERA_SCALE
export const cameraPoint = (w) => [w[0] / cameraW(w[2]), w[1] / cameraW(w[2])]
export function cameraRay(point) {
    return {
        origin: [0, 0, CAMERA_DISTANCE, 1],
        direction: [
            ...normalize([
                point[0] / CAMERA_SCALE,
                point[1] / CAMERA_SCALE,
                -CAMERA_DISTANCE,
            ]),
            0,
        ],
    }
}

export function projection(aspect, zoom, perspective = true) {
    const halfHeight = (1.52 / zoom) * Math.max(1, 1 / Math.max(aspect, 0.01))
    const halfWidth = halfHeight * aspect
    if (perspective) {
        const w0 = 1 / CAMERA_SCALE,
            wz = -w0 / CAMERA_DISTANCE
        const framing = 0.12 / halfHeight
        return new Float32Array([
            1 / halfWidth,
            0,
            0,
            0,
            0,
            1 / halfHeight,
            0,
            0,
            0,
            framing * wz,
            -w0 / 6,
            wz,
            0,
            framing * w0,
            0.5 * w0,
            w0,
        ])
    }
    return new Float32Array([
        1 / halfWidth,
        0,
        0,
        0,
        0,
        1 / halfHeight,
        0,
        0,
        0,
        0,
        -1 / 12,
        0,
        0,
        0.12 / halfHeight,
        0.5,
        1,
    ])
}

// MARK: - Cut

function hullPlanes() {
    const girdle = [
        [0.70024, 1],
        [1, 0.70024],
        [1, -0.70024],
        [0.70024, -1],
        [-0.70024, -1],
        [-1, -0.70024],
        [-1, 0.70024],
        [-0.70024, 1],
    ]
    const table = [
        [0.498552, 0.631807],
        [0.631807, 0.498552],
        [0.631807, -0.498552],
        [0.498552, -0.631807],
        [-0.498552, -0.631807],
        [-0.631807, -0.498552],
        [-0.631807, 0.498552],
        [-0.498552, 0.631807],
    ]
    const sections = [
        [0.965, 0.583526, true],
        [1, 0.571526, true],
        [0.99, -0.081806, false],
        [1, -0.112806, false],
        [0.978, -0.151806, false],
        [0.025, -1.07157, false],
        [0.009, -1.08757, false],
    ]
    const rings = sections.map(([s, y, isTable]) =>
        [...Array(8).keys()].map((i) => {
            const o = isTable ? table[i] : girdle[i]
            return [o[0] * s, y, o[1] * s]
        })
    )
    const planes = []
    function face(points, kind) {
        let p = points
        let n = normalize(cross(sub(p[1], p[0]), sub(p[2], p[0])))
        const center = scale(p.reduce(add, [0, 0, 0]), 1 / p.length)
        if (dot(n, sub(center, [0, -0.12, 0])) < 0) {
            p = [...p].reverse()
            n = scale(n, -1)
        }
        if (kind !== 3) planes.push([...n, -dot(n, p[0])])
    }
    face(rings[0], 0)
    for (let band = 0; band < rings.length - 1; band++) {
        for (let i = 0; i < 8; i++) {
            const next = (i + 1) % 8
            face(
                [
                    rings[band][i],
                    rings[band + 1][i],
                    rings[band + 1][next],
                    rings[band][next],
                ],
                band === 1 ? 1 : band === 4 ? 2 : 3
            )
        }
    }
    // planes: [table, crown x8, pavilion x8]
    return planes
}

/** DiamondRounding.mesh: rounds every edge and corner of the convex cut. */
function roundedMesh(planes, radius) {
    const normals = planes.map((p) => [p[0], p[1], p[2]])
    const materials = planes.map((_, i) =>
        i === 0 ? [1, 0, 0] : i <= 8 ? [0, 1, 0] : [0, 0, 1]
    )
    const offsets = planes.map((p) => p[3] + radius)
    const incidenceTolerance = 2e-6
    const corners = []

    for (let a = 0; a < planes.length - 2; a++) {
        for (let b = a + 1; b < planes.length - 1; b++) {
            for (let c = b + 1; c < planes.length; c++) {
                const na = normals[a],
                    nb = normals[b],
                    nc = normals[c]
                const det = dot(na, cross(nb, nc))
                if (Math.abs(det) < 1e-8) continue
                const point = scale(
                    add(
                        add(
                            scale(cross(nb, nc), -offsets[a]),
                            scale(cross(nc, na), -offsets[b])
                        ),
                        scale(cross(na, nb), -offsets[c])
                    ),
                    1 / det
                )
                if (
                    !planes.every(
                        (_, i) => dot(normals[i], point) + offsets[i] < 2e-7
                    )
                )
                    continue
                if (!corners.some((q) => distSq(q, point) < 1e-10))
                    corners.push(point)
            }
        }
    }
    const sharpPoints = [],
        insetDirections = []
    for (const corner of corners) {
        const incident = planes
            .map((_, i) => i)
            .filter(
                (i) =>
                    Math.abs(dot(normals[i], corner) + offsets[i]) <
                    incidenceTolerance
            )
        let inset = [0, 0, 0]
        outer: for (let a = 0; a < incident.length - 2; a++) {
            for (let b = a + 1; b < incident.length - 1; b++) {
                for (let c = b + 1; c < incident.length; c++) {
                    const na = normals[incident[a]],
                        nb = normals[incident[b]],
                        nc = normals[incident[c]]
                    const det = dot(na, cross(nb, nc))
                    if (Math.abs(det) < 1e-8) continue
                    inset = scale(
                        add(add(cross(nb, nc), cross(nc, na)), cross(na, nb)),
                        1 / det
                    )
                    break outer
                }
            }
        }
        sharpPoints.push(add(corner, scale(inset, radius)))
        insetDirections.push(inset)
    }
    const radiusScale = radius / ROUNDING_RADIUS
    const radii = sharpPoints.map((p) => {
        if (p[1] > 0.4)
            return Math.min(CROWN_ROUNDING_RADIUS * radiusScale, 0.34)
        if (p[1] > -0.5) return GIRDLE_ROUNDING_RADIUS * radiusScale
        return radius
    })
    const points = sharpPoints.map((p, i) =>
        sub(p, scale(insetDirections[i], radii[i]))
    )

    function cyclicOrder(indices, values, normal) {
        const center = scale(
            indices.reduce((s, i) => add(s, values[i]), [0, 0, 0]),
            1 / indices.length
        )
        const axis = Math.abs(normal[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]
        const u = normalize(cross(axis, normal)),
            v = cross(normal, u)
        const angle = (i) => {
            const d = sub(values[i], center)
            return Math.atan2(dot(d, v), dot(d, u))
        }
        return [...indices].sort((a, b) => angle(a) - angle(b))
    }
    const edgeKey = (a, b) => `${Math.min(a, b)},${Math.max(a, b)}`

    const faces = planes.map(() => [])
    const incidentFaces = corners.map(() => [])
    const edgeFaces = new Map()
    for (let f = 0; f < planes.length; f++) {
        const indices = corners
            .map((_, i) => i)
            .filter(
                (i) =>
                    Math.abs(dot(normals[f], corners[i]) + offsets[f]) <
                    incidenceTolerance
            )
        if (indices.length < 3) continue
        faces[f] = cyclicOrder(indices, corners, normals[f])
        for (let i = 0; i < faces[f].length; i++) {
            const a = faces[f][i],
                b = faces[f][(i + 1) % faces[f].length]
            incidentFaces[a].push(f)
            const key = edgeKey(a, b)
            if (!edgeFaces.has(key))
                edgeFaces.set(key, {
                    a: Math.min(a, b),
                    b: Math.max(a, b),
                    faces: [],
                })
            edgeFaces.get(key).faces.push(f)
        }
    }

    const blendNormal = (a, b, step, count) =>
        step === 0 ? a : step === count ? b : normalize(mix(a, b, step / count))
    const blend = (a, b, step, count) => ({
        normal: blendNormal(a.normal, b.normal, step, count),
        material: mix(a.material, b.material, step / count),
    })
    const arcs = new Map()
    for (const { faces: adjacent } of edgeFaces.values()) {
        const fa = Math.min(adjacent[0], adjacent[1]),
            fb = Math.max(adjacent[0], adjacent[1])
        const a = { normal: normals[fa], material: materials[fa] }
        const b = { normal: normals[fb], material: materials[fb] }
        arcs.set(
            edgeKey(fa, fb),
            [...Array(SEGMENTS + 1).keys()].map((s) => blend(a, b, s, SEGMENTS))
        )
    }

    // Vertex: position xyz, normal xyz, surface (table weight, crown weight, kind)
    const result = []
    const vertex = (p, n, kind, material = [0, 0]) => ({
        p,
        n,
        s: [material[0], material[1], kind],
    })
    const roundedVertex = (index, sample) =>
        vertex(
            add(points[index], scale(sample.normal, radii[index])),
            sample.normal,
            3,
            sample.material
        )
    function triangle(a, b, c) {
        const cr = cross(sub(b.p, a.p), sub(c.p, a.p))
        const outward = sub(
            scale(add(add(a.p, b.p), c.p), 1 / 3),
            [0, -0.12, 0]
        )
        if (dot(cr, outward) > 0) result.push(a, b, c)
        else result.push(a, c, b)
    }
    const quad = (a, b, c, d) => {
        triangle(a, b, c)
        triangle(a, c, d)
    }

    const edgeRows = new Map()
    const sortedEdges = [...edgeFaces.values()].sort((x, y) =>
        x.a === y.a ? x.b - y.b : x.a - y.a
    )
    for (const edge of sortedEdges) {
        const adjacent = edge.faces
        const arc = arcs.get(edgeKey(adjacent[0], adjacent[1]))
        const steps = Math.max(
            1,
            Math.ceil(
                Math.sqrt(distSq(sharpPoints[edge.a], sharpPoints[edge.b])) /
                    EDGE_STEP
            )
        )
        const rows = []
        for (let row = 0; row <= steps; row++) {
            if (row === 0) {
                rows.push(arc.map((s) => roundedVertex(edge.a, s)))
                continue
            }
            if (row === steps) {
                rows.push(arc.map((s) => roundedVertex(edge.b, s)))
                continue
            }
            const t = row / steps
            const smooth = t * t * (3 - 2 * t)
            const r = radii[edge.a] + (radii[edge.b] - radii[edge.a]) * smooth
            const dr = (radii[edge.b] - radii[edge.a]) * 6 * t * (1 - t)
            const inset = mix(
                insetDirections[edge.a],
                insetDirections[edge.b],
                t
            )
            const center = sub(
                mix(sharpPoints[edge.a], sharpPoints[edge.b], t),
                scale(inset, r)
            )
            const tangent = sub(
                sub(
                    sub(sharpPoints[edge.b], sharpPoints[edge.a]),
                    scale(
                        sub(insetDirections[edge.b], insetDirections[edge.a]),
                        r
                    )
                ),
                scale(inset, dr)
            )
            const axis = normalize(
                cross(arc[0].normal, arc[arc.length - 1].normal)
            )
            rows.push(
                arc.map((sample, index) => {
                    const along = add(tangent, scale(sample.normal, dr))
                    const across = cross(axis, sample.normal)
                    let normal = normalize(cross(along, across))
                    if (dot(normal, sample.normal) < 0)
                        normal = scale(normal, -1)
                    if (index === 0 || index === SEGMENTS)
                        normal = sample.normal
                    return vertex(
                        add(center, scale(sample.normal, r)),
                        normal,
                        3,
                        sample.material
                    )
                })
            )
        }
        edgeRows.set(edgeKey(edge.a, edge.b), rows)
        for (let row = 0; row < steps; row++) {
            for (let i = 0; i < SEGMENTS; i++)
                quad(
                    rows[row][i],
                    rows[row + 1][i],
                    rows[row + 1][i + 1],
                    rows[row][i + 1]
                )
        }
    }

    for (let f = 0; f < faces.length; f++) {
        if (faces[f].length < 3) continue
        const n = normals[f]
        const kind = f === 0 ? 0 : f <= 8 ? 1 : 2
        const rim = []
        for (let i = 0; i < faces[f].length; i++) {
            const a = faces[f][i],
                b = faces[f][(i + 1) % faces[f].length]
            const key = edgeKey(a, b)
            const adjacent = edgeFaces.get(key).faces
            const arcIndex =
                f === Math.min(adjacent[0], adjacent[1]) ? 0 : SEGMENTS
            const rows = edgeRows.get(key)
            const ordered = a < b ? rows : [...rows].reverse()
            for (const row of ordered.slice(0, -1))
                rim.push(vertex(row[arcIndex].p, n, kind))
        }
        const center = scale(
            rim.reduce((s, v) => add(s, v.p), [0, 0, 0]),
            1 / rim.length
        )
        const middle = vertex(center, n, kind)
        for (let i = 0; i < rim.length; i++)
            triangle(middle, rim[i], rim[(i + 1) % rim.length])
    }

    for (let corner = 0; corner < points.length; corner++) {
        const incident = incidentFaces[corner]
        if (incident.length < 3) continue
        const centerNormal = normalize(
            incident.reduce((s, f) => add(s, normals[f]), [0, 0, 0])
        )
        const centerMaterial = scale(
            incident.reduce((s, f) => add(s, materials[f]), [0, 0, 0]),
            1 / incident.length
        )
        const centerSample = { normal: centerNormal, material: centerMaterial }
        const ordered = cyclicOrder(incident, normals, centerNormal)
        const middle = roundedVertex(corner, centerSample)
        for (let i = 0; i < ordered.length; i++) {
            const a = ordered[i],
                b = ordered[(i + 1) % ordered.length]
            const samples = arcs.get(edgeKey(a, b))
            const arc = a < b ? samples : [...samples].reverse()
            for (let j = 0; j < SEGMENTS; j++) {
                const sample = (side, row) =>
                    roundedVertex(
                        corner,
                        blend(centerSample, arc[j + side], row, RADIAL_STEPS)
                    )
                triangle(middle, sample(0, 1), sample(1, 1))
                for (let row = 1; row < RADIAL_STEPS; row++)
                    quad(
                        sample(0, row),
                        sample(1, row),
                        sample(1, row + 1),
                        sample(0, row + 1)
                    )
            }
        }
    }

    // Bow the outline slightly outwards (the optical hull stays flat).
    return result.map(({ p, n, s }) => {
        const [x, y, z] = p,
            bow = OUTLINE_BOW
        const a = 1 - bow * z * z,
            b = 1 - bow * x * x,
            c = -2 * bow * x * z
        const det = a * b - c * c
        const normal = normalize([
            (b * n[0] - c * n[2]) / det,
            n[1],
            (a * n[2] - c * n[0]) / det,
        ])
        return { p: [x * a, y, z * b], n: normal, s }
    })
}

// MARK: - Sparkles

function outline(vertices, incoming, outgoing) {
    return {
        vertices,
        incoming,
        outgoing,
        sample(i, t) {
            const j = (i + 1) % vertices.length
            const a = vertices[i],
                b = [a[0] + outgoing[i][0], a[1] + outgoing[i][1]]
            const d = vertices[j],
                c = [d[0] + incoming[j][0], d[1] + incoming[j][1]]
            const s = 1 - t
            const k = [s * s * s, 3 * s * s * t, 3 * s * t * t, t * t * t]
            return [
                a[0] * k[0] + b[0] * k[1] + c[0] * k[2] + d[0] * k[3],
                a[1] * k[0] + b[1] * k[1] + c[1] * k[2] + d[1] * k[3],
            ]
        },
    }
}
const scaleOutline = (o, s) =>
    outline(
        o.vertices.map((v) => [v[0] * s, v[1] * s]),
        o.incoming.map((v) => [v[0] * s, v[1] * s]),
        o.outgoing.map((v) => [v[0] * s, v[1] * s])
    )

// Generated from GramDiamond.json (Tools/extract_sparkle.py in the Swift package).
const CORE_WIDE = outline(
    [
        [1.3, -80.9],
        [17.6, -39.5],
        [38.9, -20.7],
        [80.3, -3.1],
        [38.9, 15.7],
        [17.6, 37],
        [0, 80.9],
        [-17.6, 37],
        [-38.9, 15.7],
        [-80.3, -3.1],
        [-38.9, -20.7],
        [-16.3, -40.8],
    ],
    [
        [-6.3, 0],
        [-6.3, -15.1],
        [-11.3, -3.8],
        [0, -6.3],
        [13.8, -5],
        [5, -11.3],
        [6.3, 0],
        [6.3, 16.3],
        [11.3, 3.8],
        [0, 7.5],
        [-15.1, 5],
        [-5, 11.3],
    ],
    [
        [5, 0],
        [3.8, 10],
        [13.8, 5],
        [0, 7.5],
        [-11.3, 3.8],
        [-6.3, 16.3],
        [-6.3, 0],
        [-3.8, -11.3],
        [-16.3, -6.3],
        [0, -6.3],
        [11.3, -3.8],
        [6.3, -16.3],
    ]
)
const CORE_NARROW = outline(
    [
        [1.3, -80.9],
        [9, -23],
        [20.8, -12.6],
        [80.3, -3.1],
        [20.8, 7.6],
        [9, 19.4],
        [0, 80.9],
        [-10.5, 19.4],
        [-22.3, 7.6],
        [-80.3, -3.1],
        [-22.3, -12.6],
        [-9.8, -23.7],
    ],
    [
        [-6.3, 0],
        [-3.5, -8.4],
        [-6.3, -2.1],
        [0, -6.3],
        [7.7, -2.8],
        [2.8, -6.3],
        [6.3, 0],
        [3.5, 9.1],
        [6.3, 2.1],
        [0, 7.5],
        [-8.4, 2.8],
        [-2.8, 6.3],
    ],
    [
        [5, 0],
        [2.1, 5.6],
        [7.7, 2.8],
        [0, 7.5],
        [-6.3, 2.1],
        [-3.5, 9.1],
        [-6.3, 0],
        [-2.1, -6.3],
        [-9.1, -3.5],
        [0, -6.3],
        [6.3, -2.1],
        [3.5, -9.1],
    ]
)
const HALO_WIDE = outline(
    [
        [1.8, -113.5],
        [24.6, -55.4],
        [54.6, -29],
        [112.7, -4.4],
        [54.6, 22],
        [24.6, 51.9],
        [0, 113.5],
        [-24.6, 51.9],
        [-54.6, 22],
        [-112.7, -4.4],
        [-54.6, -29],
        [-22.9, -57.2],
    ],
    [
        [-8.8, 0],
        [-8.8, -21.1],
        [-15.8, -5.3],
        [0, -8.8],
        [19.4, -7],
        [7, -15.8],
        [8.8, 0],
        [8.8, 22.9],
        [15.8, 5.3],
        [0, 10.6],
        [-21.1, 7],
        [-7, 15.8],
    ],
    [
        [7, 0],
        [5.3, 14.1],
        [19.4, 7],
        [0, 10.6],
        [-15.8, 5.3],
        [-8.8, 22.9],
        [-8.8, 0],
        [-5.3, -15.8],
        [-22.9, -8.8],
        [0, -8.8],
        [15.8, -5.3],
        [8.8, -22.9],
    ]
)
const HALO_NARROW = outline(
    [
        [1.8, -113.5],
        [12.9, -32],
        [29.5, -17.3],
        [112.7, -4.4],
        [29.5, 11],
        [12.9, 27.7],
        [0, 113.5],
        [-14.5, 27.7],
        [-31.1, 11],
        [-112.7, -4.4],
        [-31.1, -17.3],
        [-13.5, -32.9],
    ],
    [
        [-8.8, 0],
        [-4.9, -11.7],
        [-8.8, -2.9],
        [0, -8.8],
        [10.7, -3.9],
        [3.9, -8.8],
        [8.8, 0],
        [4.9, 12.7],
        [8.8, 2.9],
        [0, 10.6],
        [-11.7, 3.9],
        [-3.9, 8.8],
    ],
    [
        [7, 0],
        [2.9, 7.8],
        [10.7, 3.9],
        [0, 10.6],
        [-8.8, 2.9],
        [-4.9, 12.7],
        [-8.8, 0],
        [-2.9, -8.8],
        [-12.7, -4.9],
        [0, -8.8],
        [8.8, -2.9],
        [4.9, -12.7],
    ]
)
const CIRCLE = outline(
    [
        [108.5, 0],
        [0, 108.5],
        [-108.5, 0],
        [0, -108.5],
    ],
    [
        [0, -59.9],
        [59.9, 0],
        [0, 59.9],
        [-59.9, 0],
    ],
    [
        [0, 59.9],
        [-59.9, 0],
        [0, -59.9],
        [59.9, 0],
    ]
)
const SMALL_CORE = outline(
    [
        [0, -53.2],
        [53.2, 0],
        [0, 53.2],
        [-53.2, 0],
    ],
    [
        [-3.1, 50.4],
        [-50.8, -2.9],
        [2.1, -49.7],
        [50.1, 3.5],
    ],
    [
        [2.5, 50.2],
        [-50.8, 3.5],
        [-3.1, -49.7],
        [50.1, -2.7],
    ]
)

/** Triangle fan per contour: vec4 contours (wide.xy, narrow.zw) + float layer, 5 floats per vertex. */
function tessellate(wide, narrow, layer, out) {
    for (let segment = 0; segment < wide.vertices.length; segment++) {
        for (let step = 0; step < 16; step++) {
            for (const t of [-1, step / 16, (step + 1) / 16]) {
                const a = t < 0 ? [0, 0] : wide.sample(segment, t)
                const b = t < 0 ? [0, 0] : narrow.sample(segment, t)
                out.push(a[0], a[1], b[0], b[1], layer)
            }
        }
    }
    return out
}

function intersect(vertices, origin, direction) {
    let nearest = Infinity,
        result = null
    for (let i = 0; i < vertices.length; i += 3) {
        const a = vertices[i],
            b = vertices[i + 1],
            c = vertices[i + 2]
        const e1 = sub(b.p, a.p),
            e2 = sub(c.p, a.p)
        const cr = cross(direction, e2)
        const det = dot(e1, cr)
        if (Math.abs(det) < 1e-10) continue
        const offset = sub(origin, a.p)
        const u = dot(offset, cr) / det
        const q = cross(offset, e1)
        const v = dot(direction, q) / det
        const distance = dot(e2, q) / det
        if (
            u < -1e-5 ||
            v < -1e-5 ||
            u + v > 1.00001 ||
            distance <= 0 ||
            distance >= nearest
        )
            continue
        nearest = distance
        const normal = normalize(
            add(add(scale(a.n, 1 - u - v), scale(b.n, u)), scale(c.n, v))
        )
        result = { position: add(origin, scale(direction, distance)), normal }
    }
    return result
}

// MARK: - Render data

export function buildDiamond() {
    const planes = hullPlanes()
    const vertices = roundedMesh(planes, ROUNDING_RADIUS)

    const interleaved = new Float32Array(vertices.length * 9)
    vertices.forEach((v, i) => interleaved.set([...v.p, ...v.n, ...v.s], i * 9))

    const reference = rotation(REFERENCE_PITCH, 0)
    const projected = vertices.map((v) =>
        cameraPoint(transform(reference, [...v.p, 1]))
    )
    const halfWidth = projected.reduce((m, p) => Math.max(m, Math.abs(p[0])), 0)
    const top = projected.reduce((m, p) => Math.max(m, p[1]), -Infinity)
    const facetProjection = [
        Math.cos(REFERENCE_PITCH),
        Math.sin(REFERENCE_PITCH),
        223.95 / halfWidth,
        top,
    ]

    // Sparkle anchors: 0 is the branded flare on the front facet, 1...7 small glints around the stone.
    const inverseReference = transpose(reference)
    const anchors = [...Array(8).keys()].map((instance) => {
        if (instance === 0) {
            const s = halfWidth / ((447.9 * 0.75) / 2)
            const ray = cameraRay([42.375 * s, top - 105.075 * s])
            const p = transform(inverseReference, ray.origin),
                d = transform(inverseReference, ray.direction)
            const hit = intersect(vertices, p.slice(0, 3), d.slice(0, 3))
            if (!hit)
                throw new Error(
                    "The branded sparkle must lie on the front facet"
                )
            return hit
        }
        const angle = (instance * Math.PI) / 4 + Math.PI / 8
        const height =
            instance % 3 === 0 ? 0.56 : instance % 3 === 1 ? -0.02 : -0.54
        const hit = intersect(
            vertices,
            [0, height, 0],
            [Math.sin(angle), 0, Math.cos(angle)]
        )
        if (!hit) throw new Error("Sparkle anchor must intersect the diamond")
        return hit
    })

    const main = []
    tessellate(CIRCLE, CIRCLE, 0, main)
    tessellate(HALO_WIDE, HALO_NARROW, 1, main)
    tessellate(CORE_WIDE, CORE_NARROW, 2, main)
    const small = []
    tessellate(
        scaleOutline(CIRCLE, 256 / 108.5),
        scaleOutline(CIRCLE, 256 / 108.5),
        3,
        small
    )
    tessellate(SMALL_CORE, SMALL_CORE, 4, small)

    // Silhouette half-widths over a quarter turn, for the camera-dependent narrowing.
    const widths = []
    for (let i = 0; i <= 90; i++) {
        const model = rotation(REFERENCE_PITCH, (i * Math.PI) / 360)
        let left = Infinity,
            right = -Infinity
        for (let k = 0; k < vertices.length; k++) {
            const x = cameraPoint(transform(model, [...vertices[k].p, 1]))[0]
            if (x < left) left = x
            if (x > right) right = x
        }
        widths.push((right - left) / 2)
    }

    // Unique corners (on a 1/40 grid) for the lens: their projected convex hull bounds the refraction.
    const seen = new Set()
    const lensVertices = []
    for (const v of vertices) {
        const k = v.p.map((x) => Math.round(x * 40)).join(",")
        if (!seen.has(k)) {
            seen.add(k)
            lensVertices.push([...v.p, 1])
        }
    }

    return {
        vertices: interleaved,
        lensVertices,
        vertexCount: vertices.length,
        planes: new Float32Array(planes.flat()),
        planeCount: planes.length,
        anchorPositions: new Float32Array(
            anchors.flatMap((a) => [...a.position, 1])
        ),
        anchorNormals: new Float32Array(
            anchors.flatMap((a) => [...a.normal, 0])
        ),
        mainSparkles: new Float32Array(main),
        smallSparkles: new Float32Array(small),
        facetProjection,
        widths,
    }
}

/** DiamondSilhouette.horizontalScale: keeps the apparent width steady while the stone turns. */
export function horizontalScale(widths, yaw, pitch) {
    const quarter = Math.PI / 2
    const quadrant = Math.abs(yaw - quarter * Math.round(yaw / quarter))
    const sample = Math.min(90, (quadrant * 360) / Math.PI)
    const i = Math.min(89, Math.floor(sample)),
        t = sample - i
    const a = widths[i],
        b = widths[i + 1]
    const da = i === 0 ? 0 : (b - widths[i - 1]) / 2
    const db = i === 89 ? 0 : (widths[i + 2] - a) / 2
    const width =
        a +
        t * (da + t * (3 * (b - a) - 2 * da - db + t * (2 * (a - b) + da + db)))
    const turn = Math.sin(2 * quadrant)
    const targetWidth = widths[0] * (1 - 0.035 * turn * turn)
    const tilt = Math.min(
        1,
        Math.max(
            0,
            (Math.abs(Math.sin(pitch)) - Math.sin(0.25)) /
                (Math.sin(0.96) - Math.sin(0.25))
        )
    )
    const reveal = tilt * tilt * (3 - 2 * tilt)
    return 1 + (targetWidth / width - 1) * (1 - reveal)
}
