import ColorThief from "colorthief"
import { useState, useEffect } from "react"

import { rgbTohex, normalizeHex } from "../utils/common"

export async function getAccentHex(source, quality = 10) {
    let blob, mime
    if (source instanceof Blob) {
        blob = source
        mime = blob.type
    } else {
        const resp = await fetch(source, { mode: "cors" })
        blob = await resp.blob()
        mime = resp.headers.get("content-type") || ""
    }

    if (
        mime.includes("svg") ||
        (typeof source === "string" && source.endsWith(".svg"))
    ) {
        const text = await blob.text()
        const fills = [
            ...text.matchAll(/(?:fill|stroke)=(?:"|')([^"']+)(?:"|')/g),
        ]
            .map((m) => m[1])
            .filter((c) => c !== "none" && !c.startsWith("url("))

        if (fills.length) {
            const freq = {}
            fills.forEach((c) => (freq[c] = (freq[c] || 0) + 1))
            const accent = Object.entries(freq).sort(
                (a, b) => b[1] - a[1]
            )[0][0]
            return normalizeHex(accent)
        }
    }

    const url = source instanceof Blob ? URL.createObjectURL(blob) : source

    return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.decoding = "async"
        img.loading = "eager"
        img.src = url

        img.onload = () => {
            try {
                const thief = new ColorThief()
                const [r, g, b] = thief.getColor(img, quality)
                resolve(rgbTohex(r, g, b))
            } catch (err) {
                reject(err)
            } finally {
                URL.revokeObjectURL(url)
            }
        }
        img.onerror = reject
    })
}

export function useAccentColor(src, quality = 10) {
    const [hex, setHex] = useState(null)

    useEffect(() => {
        if (!src) {
            setHex(null)
            return
        }
        let canceled = false
        getAccentHex(src, quality)
            .then((c) => !canceled && setHex(c))
            .catch(() => !canceled && setHex(null))

        return () => {
            canceled = true
        }
    }, [src, quality])

    return hex
}
