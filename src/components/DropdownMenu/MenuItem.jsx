import PropTypes from "prop-types"
import cx from "clsx"

import Tappable from "../Tappable"
import Text from "../Text"

import * as styles from "./DropdownMenu.module.scss"

const MenuItem = ({ item, isSelected, onClick, onMouseEnter, itemRef }) => (
    <Tappable
        ref={itemRef}
        role="menuitem"
        tabIndex={-1}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        className={cx(styles.item, isSelected && styles.selected)}
    >
        <Text variant="body">{item}</Text>
    </Tappable>
)

MenuItem.propTypes = {
    item: PropTypes.string,
    isSelected: PropTypes.bool,
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
    itemRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.any }),
    ]),
}

export default MenuItem
