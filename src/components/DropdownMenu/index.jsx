import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import { FloatingFocusManager, FloatingPortal } from "@floating-ui/react"
import * as m from "motion/react-m"
import { AnimatePresence } from "motion/react"

import { POPOVER_VARIANTS } from "../../utils/animations"
import MenuItem from "./MenuItem"
import { useDropdownFloating } from "./useDropdownFloating"
import { GlassBorder } from "../GlassEffect"
import { useSkin } from "../../hooks/DeviceProvider"
import { useSplitViewContext } from "../SplitView/context"

import * as styles from "./DropdownMenu.module.scss"

/**
 * Portal-rendered menu with keyboard nav (arrows / Enter / Esc) and edge-aware
 * placement. Without `trigger` it renders the selected item as the button.
 * @param {string[]} props.items Menu options (required, non-empty).
 * @param {import("react").ReactNode} [props.trigger] Custom trigger; defaults to selected item.
 * @param {(item: string) => void} [props.onChange] Fires with the picked item.
 * @example
 * <DropdownMenu items={["Newest", "Oldest", "Popular"]} trigger={<SortIcon />} />
 */
const DropdownMenu = ({ items, trigger, onChange }) => {
    const { isApple } = useSkin()
    const [isOpen, setIsOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(items[0])
    const [activeIndex, setActiveIndex] = useState(null)
    const listRef = useRef([])

    // Menus inside a SplitView detail pane stay within that pane's rect.
    const { paneRef } = useSplitViewContext()

    const selectedIndex = items.indexOf(selectedItem)
    const {
        setReference,
        setFloating,
        floatingStyles,
        context,
        isPositioned,
        origin,
        getReferenceProps,
        getFloatingProps,
        getItemProps,
    } = useDropdownFloating({
        isOpen,
        setIsOpen,
        activeIndex,
        setActiveIndex,
        selectedIndex: selectedIndex < 0 ? null : selectedIndex,
        listRef,
        getBoundary: () => paneRef?.current,
    })

    useEffect(() => {
        if (!items.includes(selectedItem)) setSelectedItem(items[0])
    }, [items, selectedItem])

    const handleSelectItem = (item) => {
        setSelectedItem(item)
        if (onChange) onChange(item)
        setIsOpen(false)
    }

    return (
        <div className={styles.container}>
            <div
                ref={setReference}
                className={trigger ? styles.trigger : styles.selected}
                role="button"
                tabIndex={0}
                {...getReferenceProps()}
            >
                {trigger ?? selectedItem}
            </div>
            <FloatingPortal>
                <AnimatePresence>
                    {isOpen && (
                        // List navigation owns focus: it lands on the
                        // selected item, so the manager must not claim it.
                        <FloatingFocusManager
                            key="menu"
                            context={context}
                            modal={false}
                            initialFocus={-1}
                        >
                            <div
                                ref={setFloating}
                                className={styles.positioner}
                                style={floatingStyles}
                                {...getFloatingProps()}
                            >
                                <m.div
                                    className={styles.root}
                                    initial="hidden"
                                    animate={
                                        isPositioned ? "visible" : "hidden"
                                    }
                                    exit="exit"
                                    variants={POPOVER_VARIANTS}
                                    style={{ transformOrigin: origin }}
                                >
                                    {isApple && <GlassBorder muted />}
                                    {items.map((item, index) => (
                                        <MenuItem
                                            key={item}
                                            item={item}
                                            isSelected={item === selectedItem}
                                            itemRef={(el) => {
                                                listRef.current[index] = el
                                            }}
                                            tabIndex={-1}
                                            {...getItemProps({
                                                onClick: () =>
                                                    handleSelectItem(item),
                                                onKeyDown: (event) => {
                                                    if (
                                                        event.key !== "Enter" &&
                                                        event.key !== " "
                                                    )
                                                        return
                                                    event.preventDefault()
                                                    handleSelectItem(item)
                                                },
                                            })}
                                        />
                                    ))}
                                </m.div>
                            </div>
                        </FloatingFocusManager>
                    )}
                </AnimatePresence>
            </FloatingPortal>
        </div>
    )
}

DropdownMenu.propTypes = {
    items: PropTypes.arrayOf(PropTypes.string).isRequired,
    trigger: PropTypes.node,
    onChange: PropTypes.func,
}
export default DropdownMenu
