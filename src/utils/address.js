export function formatAddress(raw) {
    const clean = String(raw).replace(/\s+/g, "")
    const groups = clean.match(/.{1,4}/g) || []
    const half = Math.ceil(groups.length / 2)
    return [groups.slice(0, half).join(" "), groups.slice(half).join(" ")]
}

function crc16(bytes) {
    let crc = 0
    for (const byte of bytes) {
        crc ^= byte << 8
        for (let i = 0; i < 8; i++) {
            crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
            crc &= 0xffff
        }
    }
    return crc
}

export function rawToFriendly(rawAddress, { bounceable = false } = {}) {
    if (!rawAddress || !rawAddress.includes(":")) return rawAddress || ""
    const [wcStr, hexHash] = rawAddress.split(":")
    if (hexHash.length !== 64) return rawAddress
    const workchain = parseInt(wcStr, 10)
    const bytes = new Uint8Array(36)
    bytes[0] = bounceable ? 0x11 : 0x51
    bytes[1] = workchain & 0xff
    for (let i = 0; i < 32; i++) {
        bytes[2 + i] = parseInt(hexHash.substr(i * 2, 2), 16)
    }
    const crc = crc16(bytes.subarray(0, 34))
    bytes[34] = (crc >> 8) & 0xff
    bytes[35] = crc & 0xff
    let bin = ""
    for (const b of bytes) bin += String.fromCharCode(b)
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_")
}

const SPLITS = [
    [4, 4],
    [3, 5],
    [2, 6],
    [1, 7],
    [5, 3],
    [6, 2],
    [7, 1],
]

const shortByAddress = new Map()
const addressByShort = new Map()

export function shortenFriendly(friendly) {
    if (!friendly) return ""
    const cached = shortByAddress.get(friendly)
    if (cached) return cached
    if (friendly.length <= 9) return friendly

    for (const [head, tail] of SPLITS) {
        const short = `${friendly.slice(0, head)}…${friendly.slice(-tail)}`
        if (!addressByShort.has(short)) {
            addressByShort.set(short, friendly)
            shortByAddress.set(friendly, short)
            return short
        }
    }

    shortByAddress.set(friendly, friendly)
    return friendly
}

export function shortenAddress(raw) {
    if (!raw) return ""
    return shortenFriendly(rawToFriendly(raw))
}
