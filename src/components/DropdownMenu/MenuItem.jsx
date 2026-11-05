import PropTypes from "prop-types"
import cx from "clsx"

import Tappable from "../Tappable"
import Text from "../Text"

import * as styles from "./DropdownMenu.module.scss"

// A string item is an option to pick; an object item is an action with an
// optional trailing glyph, and may open a new group with a divider above.
const MenuItem = ({ item, isSelected, onClick, onMouseEnter, itemRef }) => (
    <>
        {item.separator && (
            <div role="separator" className={styles.separator} />
        )}
        <Tappable
            ref={itemRef}
            role="menuitem"
            tabIndex={-1}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            className={cx(styles.item, isSelected && styles.selected)}
        >
            <Text variant="body">{item.label ?? item}</Text>
            {item.icon && (
                <span className={styles.icon} aria-hidden="true">
                    {item.icon}
                </span>
            )}
        </Tappable>
    </>
)

export const itemShape = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
        label: PropTypes.string.isRequired,
        icon: PropTypes.node,
        // Draw a divider above this item, opening a new group.
        separator: PropTypes.bool,
    }),
])

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
