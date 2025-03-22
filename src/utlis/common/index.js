export function isUnicode(char) {
    return /^[\p{L}\p{N}]*$/u.test(char)
}

export const hexToRgb = (hex, format = "string") => {
    // Remove # if present
    hex = hex.replace(/^#/, "")

    let r, g, b

    // Handle both 3 and 6 character hex
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16)
        g = parseInt(hex[1] + hex[1], 16)
        b = parseInt(hex[2] + hex[2], 16)
    } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16)
        g = parseInt(hex.slice(2, 4), 16)
        b = parseInt(hex.slice(4, 6), 16)
    } else {
        throw new Error("Invalid hex color format")
    }

    // Check if parsing resulted in valid numbers
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        throw new Error("Invalid hex color")
    }

    // Return in requested format
    switch (format) {
        case "string":
            return `${r}, ${g}, ${b}`
        case "css":
            return `rgb(${r}, ${g}, ${b})`
        case "object":
            return { r, g, b }
        case "array":
            return [r, g, b]
        default:
            return `${r}, ${g}, ${b}`
    }
}
