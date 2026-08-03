export function formatAddress(raw) {
    const clean = String(raw).replace(/\s+/g, "")
    const groups = clean.match(/.{1,4}/g) || []
    const half = Math.ceil(groups.length / 2)
    return [groups.slice(0, half).join(" "), groups.slice(half).join(" ")]
}
