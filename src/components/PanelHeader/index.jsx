import { isValidElement, useContext, useState } from "react"
import PropTypes from "prop-types"
import cx from "clsx"

import { GlassContainer } from "../GlassEffect"
import Text from "../Text"
import { useSkin } from "../../hooks/DeviceProvider"
import { useScrolled } from "../../hooks/useScrolled"
import { useTitleCollapse } from "../../hooks/useTitleCollapse"

import HeaderButton, { HEADER_BUTTON_VARIANTS } from "./HeaderButton"
import { BackIcon, CloseIcon, MoreIcon } from "./icons"
import { ModalChromeContext } from "./context"
import * as styles from "./PanelHeader.module.scss"

// The modal "шапка": a glass navigation bar with left/right actions and a
// centered title. 64px tall standalone, 70px inside a ModalView (via
// ModalChromeContext). Material stays a flat app bar: no glass, icon actions
// only (a text action is dropped), and no side actions at all inside a modal.
// data-modal-drag makes the whole bar a swipe-to-dismiss handle. `sticky` pins
// the bar to the top of its page scroller and fades its surface in on scroll.
// `largeTitle` adds the iOS expanded title row below the bar: it scrolls with
// the content and hands over to the inline title as it passes under the bar.
const PanelHeader = ({
    left,
    onLeft,
    leftVariant,
    right,
    onRight,
    rightVariant,
    overlay = false,
    titleGlass = false,
    search,
    pin,
    largeTitle = false,
    children,
}) => {
    const { isApple } = useSkin()
    const inModal = useContext(ModalChromeContext)
    const [stickyRef, scrolled] = useScrolled(Boolean(pin))
    const expands = largeTitle && !search && children != null
    const [barRef, largeTitleRef, collapsed] = useTitleCollapse(expands)

    // Over-content state: buttons default to the overlay glass and the title
    // goes white. Per-button variants still override.
    const baseVariant = overlay ? "overlay" : "regular"

    const resolveAction = (action) =>
        action && typeof action === "object" && !isValidElement(action)
            ? action[isApple ? "apple" : "material"]
            : action

    const showsAction = (action) =>
        action != null && (isApple || typeof action !== "string")

    const leftAction = resolveAction(left)
    const rightAction = resolveAction(right)

    const [searchFocused, setSearchFocused] = useState(false)

    const appleSearch = Boolean(search) && isApple
    const materialSearch = Boolean(search) && !isApple

    const exitSearch = () => document.activeElement?.blur()

    const renderSide = ({ action, onClick, variant, trailing, exits }) => (
        <div
            className={cx(
                styles.side,
                trailing && styles.trailing,
                (trailing ? materialSearch : appleSearch) && styles.collapsing
            )}
            {...(searchFocused && {
                onMouseDown: (event) => event.preventDefault(),
            })}
        >
            {(showsAction(action) || (exits && searchFocused)) && (
                <HeaderButton
                    onClick={searchFocused && exits ? exitSearch : onClick}
                    variant={variant ?? baseVariant}
                    surface={materialSearch}
                    {...(exits && {
                        swap: trailing ? <CloseIcon /> : <BackIcon />,
                        swapped: searchFocused,
                    })}
                >
                    {action}
                </HeaderButton>
            )}
        </div>
    )

    const title = (
        <Text
            apple={{ variant: "body", weight: "semibold" }}
            material={{ variant: "title2" }}
        >
            {children}
        </Text>
    )

    const bar = (
        <div
            ref={barRef}
            className={cx(
                styles.root,
                inModal && styles.inModal,
                search && styles.withSearch,
                searchFocused && styles.searching
            )}
            data-modal-drag=""
        >
            {renderSide({
                action: leftAction,
                onClick: onLeft,
                variant: leftVariant,
                exits: materialSearch,
            })}
            {renderSide({
                action: rightAction,
                onClick: onRight,
                variant: rightVariant,
                trailing: true,
                exits: appleSearch,
            })}
            <div
                className={cx(
                    styles.middle,
                    overlay && styles.middleOverlay,
                    expands && styles.handover,
                    expands && collapsed && styles.handedOver
                )}
                {...(expands && { "aria-hidden": true })}
                {...(search && {
                    onFocus: () => setSearchFocused(true),
                    onBlur: (event) => {
                        if (event.currentTarget.contains(event.relatedTarget)) {
                            return
                        }
                        setSearchFocused(false)
                    },
                })}
            >
                {search}
                {!search &&
                    (isApple && titleGlass ? (
                        <div className={styles.titlePill}>
                            <GlassContainer />
                            <span className={styles.titleContent}>{title}</span>
                        </div>
                    ) : (
                        title
                    ))}
            </div>
        </div>
    )

    // Stays in the flow so it scrolls at content speed and slides under the
    // pinned bar, dimming in step with the scroll rather than on a timer.
    const expandedTitle = expands && (
        <div ref={largeTitleRef} className={styles.largeTitle}>
            <Text
                apple={{ variant: "largeTitle", weight: "bold" }}
                material={{ variant: "largeTitle", weight: "medium" }}
            >
                {children}
            </Text>
        </div>
    )

    if (!pin)
        return (
            <>
                {bar}
                {expandedTitle}
            </>
        )

    const pinnedBar = (
        <div
            ref={stickyRef}
            className={cx(styles[pin], scrolled && styles.scrolled)}
        >
            {bar}
        </div>
    )

    // Fixed leaves the flow, so a spacer holds the bar's place in it.
    return (
        <>
            {pin === "fixed" && (
                <div className={styles.spacer} aria-hidden="true" />
            )}
            {pinnedBar}
            {expandedTitle}
        </>
    )
}

PanelHeader.BackIcon = BackIcon
PanelHeader.CloseIcon = CloseIcon
PanelHeader.MoreIcon = MoreIcon

const actionType = PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.shape({
        apple: PropTypes.node,
        material: PropTypes.node,
    }),
])

PanelHeader.propTypes = {
    left: actionType,
    onLeft: PropTypes.func,
    leftVariant: PropTypes.oneOf(HEADER_BUTTON_VARIANTS),
    right: actionType,
    onRight: PropTypes.func,
    rightVariant: PropTypes.oneOf(HEADER_BUTTON_VARIANTS),
    overlay: PropTypes.bool,
    titleGlass: PropTypes.bool,
    search: PropTypes.node,
    pin: PropTypes.oneOf(["sticky", "fixed"]),
    largeTitle: PropTypes.bool,
    children: PropTypes.node,
}

export default PanelHeader
