import PropTypes from "prop-types"
import * as m from "motion/react-m"
import cx from "clsx"
import Tappable from "../Tappable"
import Text from "../Text"
import { GlassBorder } from "../GlassEffect"
import { useSkin } from "../../hooks/DeviceProvider"

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

const getLabel = (item) => (typeof item === "string" ? item : item.label)

export const MenuItem = ({
    item,
    isSelected,
    onClick,
    onMouseEnter,
    itemRef,
}) => {
    const icon = typeof item === "string" ? null : item.icon
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
                item.destructive && styles.destructive
            )}
        >
            <Text variant="body">{getLabel(item)}</Text>
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

/**
 * The animated menu surface shared by DropdownMenu and ContextMenu. Extra
 * props (variants, style, initial...) go to the motion root.
 */
const MenuPanel = ({
    ref,
    items,
    selectedItem,
    onSelect,
    onItemHover,
    itemRefs,
    className,
    ...props
}) => {
    const { isApple } = useSkin()
    return (
        <m.div
            ref={ref}
            role="menu"
            className={cx(styles.root, className)}
            {...props}
        >
            {isApple && <GlassBorder muted />}
            {items.map((item, index) => (
                <MenuItem
                    key={index}
                    item={item}
                    isSelected={item === selectedItem}
                    onClick={() => onSelect?.(item, index)}
                    onMouseEnter={() => onItemHover?.(index)}
                    itemRef={(el) => {
                        if (itemRefs) itemRefs.current[index] = el
                    }}
                />
            ))}
        </m.div>
    )
}

MenuPanel.propTypes = {
    ref: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.any }),
    ]),
    items: PropTypes.arrayOf(itemShape).isRequired,
    selectedItem: itemShape,
    onSelect: PropTypes.func,
    onItemHover: PropTypes.func,
    itemRefs: PropTypes.shape({ current: PropTypes.array }),
    className: PropTypes.string,
}

export default MenuPanel
