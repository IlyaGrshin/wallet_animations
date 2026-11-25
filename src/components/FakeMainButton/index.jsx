import PropTypes from "prop-types"

import DropdownMenu from "../DropdownMenu"
import { itemShape } from "../DropdownMenu/MenuItem"
import { GlassBorder } from "../GlassEffect"
import Tappable from "../Tappable"
import { useSkin } from "../../hooks/DeviceProvider"

import EllipsisIcon from "../../icons/28/Elipsis.svg?react"

import * as styles from "./FakeMainButton.module.scss"

function MoreButton({ ariaProps }) {
    const { isApple } = useSkin()
    return (
        <Tappable
            as="button"
            type="button"
            className={styles.more}
            aria-label="More actions"
            {...ariaProps}
        >
            {isApple && <GlassBorder muted />}
            <EllipsisIcon aria-hidden="true" />
        </Tappable>
    )
}

MoreButton.propTypes = {
    ariaProps: PropTypes.object,
}

/**
 * In-page stand-in for Telegram's MainButton/BottomBar, for screens it can't
 * serve: more than two actions, a trailing "more" menu, or a state the native
 * bar has no look for. Pins to the bottom of the scroller over a scroll-edge
 * fade and leaves room for itself after the content.
 * @param {import("react").ReactNode} props.children Buttons, sharing the row
 * equally (RegularButton with `isFill`).
 * @param {Array} [props.menu] DropdownMenu items behind a trailing "more"
 * button; omit for no button.
 * @param {(item: object) => void} [props.onMenuSelect] Fires with the item.
 * @example
 * <FakeMainButton menu={[{ label: "Withdraw", icon: <ArrowUp /> }]}>
 *   <RegularButton variant="filled" label="Buy" isFill />
 *   <RegularButton variant="filled" label="Sell" isFill />
 * </FakeMainButton>
 */
export default function FakeMainButton({ children, menu, onMenuSelect }) {
    return (
        <div className={styles.root}>
            <div className={styles.edge} aria-hidden="true" />
            <div className={styles.body}>
                <div className={styles.actions}>{children}</div>
                {menu?.length > 0 && (
                    <DropdownMenu
                        items={menu}
                        onChange={onMenuSelect}
                        trigger={(ariaProps) => (
                            <MoreButton ariaProps={ariaProps} />
                        )}
                    />
                )}
            </div>
        </div>
    )
}

FakeMainButton.propTypes = {
    children: PropTypes.node,
    menu: PropTypes.arrayOf(itemShape),
    onMenuSelect: PropTypes.func,
}
