import { useRef, useState } from "react"
import PropTypes from "prop-types"
import SplitViewContext from "./context"

import * as styles from "./SplitView.module.scss"

// Generic, presentational two-pane layout (iPad-style master/detail).
// Purely structural: pass any nodes as Sidebar / Detail so prototypes can
// reuse it with their own master content and local state or routing.
const SplitView = ({ children }) => (
    <div className={styles.root}>{children}</div>
)

const Sidebar = ({ children }) => {
    const paneRef = useRef(null)

    return (
        <SplitViewContext.Provider value={{ inDetailPane: false, paneRef }}>
            <aside ref={paneRef} className={styles.sidebar}>
                <div className={styles.sidebarScroll}>{children}</div>
            </aside>
        </SplitViewContext.Provider>
    )
}

// The active <Page> reports its background through context so the whole pane
// (full height, incl. the bottom-inset area) takes the page color, not just
// the content. Falls back to the secondary color from CSS until a Page mounts.
const Detail = ({ children }) => {
    const [background, setBackground] = useState(null)
    // Portalled overlays clamp to paneRef (usePaneBounds) and snackbars mount
    // inside it, so neither spills over the sidebar.
    const paneRef = useRef(null)

    const style = {}
    if (background) {
        style.background = background
        // Pane-scoped page color for fade gradients (AppBar/TabBar), shadowing
        // the body-level value the shell chrome Page sets.
        style["--page-background"] = background
    }

    return (
        <SplitViewContext.Provider
            value={{
                inDetailPane: true,
                setPaneBackground: setBackground,
                paneRef,
            }}
        >
            <main ref={paneRef} className={styles.detail} style={style}>
                {children}
            </main>
        </SplitViewContext.Provider>
    )
}

SplitView.propTypes = {
    children: PropTypes.node,
}
Sidebar.propTypes = {
    children: PropTypes.node,
}
Detail.propTypes = {
    children: PropTypes.node,
}

SplitView.Sidebar = Sidebar
SplitView.Detail = Detail

export default SplitView
