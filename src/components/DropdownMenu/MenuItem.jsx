import PropTypes from "prop-types"

import Tappable from "../Tappable"
import Text from "../Text"

import * as styles from "./DropdownMenu.module.scss"

const MenuItem = ({ item, isSelected, itemRef, ...props }) => (
    <Tappable
        ref={itemRef}
        role="menuitem"
        className={`${styles.item} ${isSelected ? styles.selected : ""}`}
        {...props}
    >
        <Text variant="body">{item}</Text>
    </Tappable>
)

MenuItem.propTypes = {
    item: PropTypes.string,
    isSelected: PropTypes.bool,
    itemRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.any }),
    ]),
}

export default MenuItem
