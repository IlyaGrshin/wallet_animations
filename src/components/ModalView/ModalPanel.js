import PropTypes from "prop-types"
import * as m from "motion/react-m"
import { useSmoothCorners } from "@lisse/react"

// Wraps the modal panel so the smooth-corner hook mounts with it. The hook
// keys on its options and reads ref.current, so on the always-mounted
// ModalView it would never attach to the panel (which lives in AnimatePresence).
const ModalPanel = ({ panelRef, corners, children, ...rest }) => {
    useSmoothCorners(panelRef, corners, { autoEffects: false })

    return (
        <m.div ref={panelRef} {...rest}>
            {children}
        </m.div>
    )
}

ModalPanel.propTypes = {
    panelRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.any }),
    ]),
    corners: PropTypes.object,
    children: PropTypes.node,
}

export default ModalPanel
