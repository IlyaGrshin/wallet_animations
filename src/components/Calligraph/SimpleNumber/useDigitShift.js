import { useLayoutEffect, useRef } from "react"

import { slots } from "./reconcile"

const SLIDE_DURATION = 250
const SLIDE_EASING = "cubic-bezier(0.23, 1, 0.32, 1)"
const NEIGHBOR_DURATION = 350
const NEIGHBOR_EASING =
    "linear(0, 0.1994, 0.5127, 0.7536, 0.8969, 0.968, 0.997, 1.0055, 1.006, 1.0041, 1.0023, 1)"

const digitSlots = (text) =>
    slots(text).filter(({ key }) => !key.startsWith("p"))

const edges = (list, widths, rtl) => {
    const result = {}
    let x = 0
    for (const { key, char } of rtl ? [...list].reverse() : list) {
        const width = widths.get(char)
        if (rtl) x -= width
        result[key] = x
        if (!rtl) x += width
    }
    return result
}

const plan = (fromText, toText, widths, rtl) => {
    const from = digitSlots(fromText)
    const to = digitSlots(toText)
    if ([...from, ...to].some(({ char }) => !widths.has(char))) return null

    const before = edges(from, widths, rtl)
    const after = edges(to, widths, rtl)
    const firstKept = to.find(({ key }) => key in before)
    const uniform =
        rtl || !firstKept ? 0 : before[firstKept.key] - after[firstKept.key]
    const local = to.map(({ key }) =>
        key in before ? before[key] - after[key] - uniform : 0
    )
    return { uniform, local }
}

const slide = (element, offset, duration, easing) =>
    element.animate([{ translate: `${offset}px 0` }, { translate: "0 0" }], {
        duration,
        easing,
    })

export default function useDigitShift(state, digitsRef, droppedRef) {
    const widthsRef = useRef(new Map())
    const rtlRef = useRef(null)

    useLayoutEffect(() => {
        const digits = digitsRef.current
        if (!digits) return
        const columns = Array.from(digits.children)

        if (state.at === -Infinity) return
        if (!state.from) {
            for (const element of [digits, ...columns]) {
                element
                    .getAnimations()
                    .forEach((animation) => animation.cancel())
            }
            return
        }

        if (rtlRef.current === null) {
            const host = digits.parentElement.parentElement
            rtlRef.current =
                !!host && getComputedStyle(host).direction === "rtl"
        }
        const rtl = rtlRef.current
        const widths = widthsRef.current
        const shift = plan(state.from, state.text, widths, rtl)

        if (shift) {
            if (shift.uniform) {
                slide(digits, shift.uniform, SLIDE_DURATION, SLIDE_EASING)
            }
            shift.local.forEach((offset, index) => {
                if (offset && columns[index]) {
                    slide(
                        columns[index],
                        offset,
                        NEIGHBOR_DURATION,
                        NEIGHBOR_EASING
                    )
                }
            })
            return
        }

        const scale = digits.offsetWidth / digits.getBoundingClientRect().width
        digitSlots(state.text).forEach(({ char }, index) => {
            if (!widths.has(char) && columns[index]) {
                const { width } = columns[index].getBoundingClientRect()
                widths.set(char, width * (scale || 1))
            }
        })

        if (!state.slide || rtl) return
        const offset = state.slide.added
            ? -(columns[state.slide.added]?.offsetLeft ?? 0)
            : (droppedRef.current?.offsetWidth ?? 0)
        if (offset) slide(digits, offset, SLIDE_DURATION, SLIDE_EASING)
    }, [state])
}
