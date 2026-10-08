import { useRef } from "react"
import PropTypes from "prop-types"
import { useVirtualizer } from "@tanstack/react-virtual"

import useScrollMargin from "../../../hooks/useScrollMargin"

import * as styles from "./ColorAssetPage.module.scss"

const OVERSCAN = 2

export default function VirtualStack({ count, estimateSize, gap, children }) {
    const listRef = useRef(null)
    const { scrollEl, listOffset } = useScrollMargin(listRef)

    // eslint-disable-next-line react-hooks/incompatible-library
    const virtualizer = useVirtualizer({
        count,
        getScrollElement: () => scrollEl,
        estimateSize: () => estimateSize,
        overscan: OVERSCAN,
        gap,
        scrollMargin: listOffset,
    })

    return (
        <div
            ref={listRef}
            className={styles.virtualList}
            style={{ height: virtualizer.getTotalSize() }}
        >
            {virtualizer.getVirtualItems().map((item) => (
                <div
                    key={item.key}
                    ref={virtualizer.measureElement}
                    data-index={item.index}
                    className={styles.virtualItem}
                    style={{
                        transform: `translateY(${item.start - listOffset}px)`,
                    }}
                >
                    {children(item.index)}
                </div>
            ))}
        </div>
    )
}

VirtualStack.propTypes = {
    count: PropTypes.number.isRequired,
    estimateSize: PropTypes.number.isRequired,
    gap: PropTypes.number,
    children: PropTypes.func.isRequired,
}
