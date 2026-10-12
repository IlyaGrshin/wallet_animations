import { createContext, useContext } from "react"

// Lets nested components know they render inside a SplitView pane.
// Used by <Page> to yield TWA header/background chrome to the shell in split mode.
const SplitViewContext = createContext({ inDetailPane: false })

export const useSplitViewContext = () => useContext(SplitViewContext)

export const getViewportBounds = () => ({
    left: 0,
    top: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
})

// Bounds portalled overlays clamp to: the enclosing SplitView pane's rect,
// or the viewport outside a SplitView. Returns a getter to call at measure time.
export const usePaneBounds = () => {
    const { paneRef } = useSplitViewContext()
    return () => {
        const pane = paneRef?.current
        if (!pane) return getViewportBounds()
        const { left, top, right, bottom } = pane.getBoundingClientRect()
        return { left, top, right, bottom }
    }
}

export default SplitViewContext
