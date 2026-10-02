import { createPortal } from "react-dom"
import PropTypes from "prop-types"
import { AnimatePresence } from "motion/react"
import cx from "clsx"
import SnackbarItem from "./SnackbarItem"
import * as styles from "./Snackbar.module.scss"

const positionClass = {
    top: styles.host_top,
    bottom: styles.host_bottom,
}

const positions = Object.keys(positionClass)

const isMounted = (pane) => Boolean(pane?.isConnected)

const HostLayer = ({ snackbars, onDismiss, inPane }) =>
    positions.map((position) => {
        const items = snackbars.filter(
            (s) => (s.position ?? "bottom") === position
        )
        return (
            <div
                key={position}
                className={cx(
                    styles.host,
                    positionClass[position],
                    inPane && styles.host_pane
                )}
            >
                <AnimatePresence initial={false}>
                    {items.map((item) => (
                        <SnackbarItem
                            key={item.id}
                            item={item}
                            onDismiss={onDismiss}
                        />
                    ))}
                </AnimatePresence>
            </div>
        )
    })

const SnackbarHost = ({ snackbars, panes, onDismiss }) => {
    const mountedPanes = panes.filter(isMounted)
    const rootSnackbars = snackbars.filter(
        (s) => !mountedPanes.includes(s.pane)
    )

    return (
        <>
            {createPortal(
                <HostLayer snackbars={rootSnackbars} onDismiss={onDismiss} />,
                document.body
            )}
            {panes.map(
                (pane, index) =>
                    isMounted(pane) &&
                    createPortal(
                        <HostLayer
                            snackbars={snackbars.filter((s) => s.pane === pane)}
                            onDismiss={onDismiss}
                            inPane
                        />,
                        pane,
                        index
                    )
            )}
        </>
    )
}

HostLayer.propTypes = {
    snackbars: PropTypes.array.isRequired,
    onDismiss: PropTypes.func.isRequired,
    inPane: PropTypes.bool,
}

SnackbarHost.propTypes = {
    snackbars: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            position: PropTypes.oneOf(positions),
            pane: PropTypes.instanceOf(Element),
        })
    ).isRequired,
    panes: PropTypes.arrayOf(PropTypes.instanceOf(Element)).isRequired,
    onDismiss: PropTypes.func.isRequired,
}

export default SnackbarHost
