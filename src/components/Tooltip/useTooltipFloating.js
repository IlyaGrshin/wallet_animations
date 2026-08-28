import { useState } from "react"
import {
    autoUpdate,
    flip,
    offset,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useHover,
    useInteractions,
    useRole,
} from "@floating-ui/react"

import {
    GAP,
    VIEWPORT_PADDING,
    tail,
    tailPlacement,
    tailShellStyle,
} from "./tooltipTail"
import { TAIL_WIDTH_HORIZONTAL, TAIL_WIDTH_VERTICAL } from "./tooltipPath"

const HOVER_DELAY = { open: 80, close: 120 }

// Floating UI wiring for the tooltip: placement, the tail geometry that feeds
// the clip path, and the hover / tap / dismiss interactions.
export const useTooltipFloating = ({ placement, protrusion }) => {
    const [isOpen, setIsOpen] = useState(false)
    const isAuto = placement === "auto"

    const { refs, floatingStyles, context, middlewareData, isPositioned } =
        useFloating({
            open: isOpen,
            onOpenChange: setIsOpen,
            placement: isAuto ? "bottom" : placement,
            strategy: "fixed",
            whileElementsMounted: autoUpdate,
            middleware: [
                tailPlacement(placement),
                offset(GAP),
                isAuto && flip({ padding: VIEWPORT_PADDING }),
                shift({ padding: VIEWPORT_PADDING }),
                tail({
                    vBreadth: TAIL_WIDTH_VERTICAL,
                    hBreadth: TAIL_WIDTH_HORIZONTAL,
                    protrusion,
                }),
            ].filter(Boolean),
        })

    const interactions = useInteractions([
        useHover(context, { mouseOnly: true, delay: HOVER_DELAY }),
        useClick(context),
        useDismiss(context),
        useRole(context, { role: "tooltip" }),
    ])

    return {
        isOpen,
        isPositioned,
        setReference: refs.setReference,
        setFloating: refs.setFloating,
        floatingStyles,
        shellStyle: tailShellStyle(middlewareData.tail),
        ...interactions,
    }
}
