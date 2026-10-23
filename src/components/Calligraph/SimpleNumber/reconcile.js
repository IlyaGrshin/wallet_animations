export const isDigit = (char) => char >= "0" && char <= "9"
const toNumber = (text) => parseFloat(text.replace(/[^0-9.-]/g, "")) || 0
const isPrefix = (key) => key.startsWith("p")
const now = () => performance.now()

const INSTANT_BELOW = 200

export const slots = (text) => {
    const chars = Array.from(text)
    const split = Math.max(chars.findIndex(isDigit), 0)
    return chars.map((char, index) => ({
        char,
        key: index < split ? `p${index}` : `${chars.length - 1 - index}`,
    }))
}

export const initialState = (text) => ({
    text,
    at: -Infinity,
    from: null,
    gen: 0,
    changes: {},
    dropped: null,
    slide: null,
})

export const reconcile = (state, text) => {
    const at = now()
    if (at - state.at < INSTANT_BELOW) {
        return { ...initialState(text), at, gen: state.gen }
    }

    const direction = Math.sign(toNumber(text) - toNumber(state.text)) || 1
    const prevSlots = slots(state.text)
    const nextSlots = slots(text)
    const previous = Object.fromEntries(
        prevSlots.map(({ key, char }) => [key, char])
    )
    const nextKeys = new Set(nextSlots.map(({ key }) => key))
    const changes = {}
    let gen = state.gen

    for (const { key, char } of nextSlots) {
        const prevChar = previous[key]
        if (prevChar === char) {
            if (state.changes[key]) changes[key] = state.changes[key]
            continue
        }
        gen += 1
        changes[key] = { gen, prevChar, direction }
    }

    const dropped = prevSlots.filter(
        ({ key }) => !isPrefix(key) && !nextKeys.has(key)
    )
    const added = nextSlots.filter(
        ({ key }) => !isPrefix(key) && !(key in previous)
    ).length

    if (!dropped.length && !added) {
        return {
            ...state,
            text,
            at,
            from: state.text,
            gen,
            changes,
            slide: null,
        }
    }

    gen += 1
    return {
        text,
        at,
        from: state.text,
        gen,
        changes,
        dropped: dropped.length ? { gen, slots: dropped, direction } : null,
        slide: { gen, added },
    }
}
