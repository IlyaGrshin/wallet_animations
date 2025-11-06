import ColorThief from "colorthief"
import { useState, useEffect, useRef } from "react"

import { rgbTohex, normalizeHex } from "../utils/common"

const colorCache = new Map()

export async function getAccentHex(source, quality = 10) {
    const cacheKey = `${source}_${quality}`
    if (colorCache.has(cacheKey)) {
        return colorCache.get(cacheKey)
    }

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
            const result = normalizeHex(accent)
            colorCache.set(cacheKey, result)
            return result
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
                const result = rgbTohex(r, g, b)
                colorCache.set(cacheKey, result)
                resolve(result)
            } catch (err) {
                reject(err)
            } finally {
                if (source instanceof Blob) {
                    URL.revokeObjectURL(url)
                }
            }
        }
        img.onerror = reject
    })
}

export function useAccentColor(src, quality = 10) {
    const [hex, setHex] = useState(null)

    useEffect(() => {
        if (!src) {
            const timer = setTimeout(() => setHex(null), 0)
            return () => clearTimeout(timer)
        }

        let canceled = false
        const resetTimer = setTimeout(() => {
            if (!canceled) setHex(null)
        }, 0)

        getAccentHex(src, quality)
            .then((c) => !canceled && setHex(c))
            .catch(() => !canceled && setHex(null))

        return () => {
            canceled = true
            clearTimeout(resetTimer)
        }
    }, [src, quality])

    return src ? hex : null
}

export function useAccentColorLazy(src, quality = 10, options = {}) {
    const [hex, setHex] = useState(null)
    const [isVisible, setIsVisible] = useState(false)
    const elementRef = useRef(null)

    const {
        rootMargin = "50px",
        threshold = 0.01,
    } = options

    useEffect(() => {
        if (!src || !elementRef.current) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true)
                        observer.unobserve(entry.target)
                    }
                })
            },
            {
                rootMargin,
                threshold,
            }
        )

        observer.observe(elementRef.current)

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current)
            }
        }
    }, [src, rootMargin, threshold])

    useEffect(() => {
        if (!src || !isVisible) {
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
    }, [src, quality, isVisible])

    return { hex: src ? hex : null, ref: elementRef }
}
