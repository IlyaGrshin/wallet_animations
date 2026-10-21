import PropTypes from "prop-types"
import cx from "clsx"

import Tappable from "../Tappable"
import Text from "../Text"

import * as styles from "./DropdownMenu.module.scss"

// An item is a plain label, or `{ label, icon, destructive }` for menus that
// carry trailing icons and a destructive (red) entry.
export const itemShape = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
        label: PropTypes.string.isRequired,
        icon: PropTypes.node,
        destructive: PropTypes.bool,
    }),
])

const MenuItem = ({ item, isSelected, onClick, onMouseEnter, itemRef }) => {
    const { label, icon, destructive } =
        typeof item === "string" ? { label: item } : item
    return (
        <Tappable
            ref={itemRef}
            role="menuitem"
            tabIndex={-1}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            className={cx(
                styles.item,
                isSelected && styles.selected,
                icon && styles.withIcon,
                destructive && styles.destructive
            )}
        >
            <Text variant="body">{label}</Text>
            {icon && <span className={styles.itemIcon}>{icon}</span>}
        </Tappable>
    )
}

MenuItem.propTypes = {
    item: itemShape,
    isSelected: PropTypes.bool,
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
    itemRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.any }),
    ]),
}

export default MenuItem
