import {
    autoUpdate,
    flip,
    offset,
    shift,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useListNavigation,
    useRole,
} from "@floating-ui/react"

import { clamp } from "../../utils/number"

export const GAP = 1
export const VIEWPORT_PADDING = 8

// Scale the menu out of the trigger rather than out of its own centre.
const transformOrigin = () => ({
    name: "transformOrigin",
    fn({ x, placement, rects }) {
        const centerX = rects.reference.x + rects.reference.width / 2
        const originX = clamp(
            ((centerX - x) / rects.floating.width) * 100,
            0,
            100
        )
        const side = placement.split("-")[0]
        return {
            data: { origin: `${originX}% ${side === "top" ? "100%" : "0%"}` },
        }
    },
})

/**
 * Floating UI wiring for the menu: placement clamped to the SplitView pane when
 * there is one, click / dismiss interactions and roving-focus list navigation.
 */
export const useDropdownFloating = ({
    isOpen,
    setIsOpen,
    activeIndex,
    setActiveIndex,
    selectedIndex,
    listRef,
    getBoundary,
}) => {
    // Derivable options: read the pane element when positioning, not on render.
    const overflowOptions = () => ({
        boundary: getBoundary() ?? "clippingAncestors",
        padding: VIEWPORT_PADDING,
    })

    const { refs, floatingStyles, context, middlewareData, isPositioned } =
        useFloating({
            open: isOpen,
            onOpenChange: setIsOpen,
            placement: "bottom",
            strategy: "fixed",
            whileElementsMounted: autoUpdate,
            middleware: [
                offset(GAP),
                flip(overflowOptions),
                shift(() => ({ ...overflowOptions(), crossAxis: true })),
                transformOrigin(),
            ],
        })

    const interactions = useInteractions([
        useClick(context),
        useDismiss(context),
        useRole(context, { role: "menu" }),
        useListNavigation(context, {
            listRef,
            activeIndex,
            selectedIndex,
            onNavigate: setActiveIndex,
            focusItemOnOpen: true,
            loop: true,
        }),
    ])

    return {
        setReference: refs.setReference,
        setFloating: refs.setFloating,
        floatingStyles,
        context,
        isPositioned,
        origin: middlewareData.transformOrigin?.origin,
        ...interactions,
    }
}
