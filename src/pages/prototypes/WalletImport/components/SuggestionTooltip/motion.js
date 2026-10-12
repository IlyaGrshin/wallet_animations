import { EASING, SPRING } from "../../../../../utils/animations"

const stripVariants = (spring) => ({
    hidden: { opacity: 0, scale: 0.92, filter: "blur(5px)" },
    visible: {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        transition: {
            ...spring,
            opacity: { duration: 0.12, ease: EASING.QUINT_OUT },
            filter: { duration: 0.16, ease: EASING.QUINT_OUT },
        },
    },
    exit: {
        opacity: 0,
        scale: 0.96,
        filter: "blur(4px)",
        transition: { duration: 0.14, ease: EASING.QUINT_OUT },
    },
})

export const APPLE_VARIANTS = stripVariants(SPRING.APPLE)
export const MATERIAL_VARIANTS = stripVariants(SPRING.MATERIAL)

export const INSTANT = { duration: 0 }

export const REDUCED_VARIANTS = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: INSTANT },
    exit: { opacity: 0, transition: INSTANT },
}

export const RESIZE_SPRING = { type: "spring", stiffness: 700, damping: 55 }

export const ITEM_HIDDEN = { opacity: 0, scale: 0.96 }
export const ITEM_VISIBLE = { opacity: 1, scale: 1 }
export const ITEM_TRANSITION = {
    ...RESIZE_SPRING,
    opacity: { duration: 0.12, ease: EASING.QUINT_OUT },
}

export const ERROR_PULSE = { scale: [1, 1.05, 1] }
export const ERROR_PULSE_TRANSITION = {
    duration: 0.4,
    ease: EASING.EASE_IN_OUT,
}
