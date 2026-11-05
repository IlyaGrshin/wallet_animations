import PropTypes from "prop-types"
import * as m from "motion/react-m"
import cx from "clsx"
import { GlassBorder } from "../GlassEffect"
import { useSkin } from "../../hooks/DeviceProvider"

import MenuItem, { itemShape } from "./MenuItem"
import * as styles from "./DropdownMenu.module.scss"

export { MenuItem, itemShape }

/**
 * The animated menu surface shared by DropdownMenu and ContextMenu. Extra
 * props (variants, style, initial...) go to the motion root.
 * @param {boolean} [props.opaque] Near-opaque surface for menus shown over a
 * dim overlay, where the iOS glass would turn grey and let content bleed through.
 */
const MenuPanel = ({
    ref,
    items,
    selectedItem,
    onSelect,
    onItemHover,
    itemRefs,
    opaque = false,
    className,
    ...props
}) => {
    const { isApple } = useSkin()
    return (
        <m.div
            ref={ref}
            role="menu"
            className={cx(styles.root, opaque && styles.opaque, className)}
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
                    itemRef={
                        itemRefs &&
                        ((el) => {
                            itemRefs.current[index] = el
                        })
                    }
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
    opaque: PropTypes.bool,
    className: PropTypes.string,
}

export default MenuPanel
