import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"
import cx from "clsx"
import { useLocation } from "wouter"

import PanelHeader from "../../../../components/PanelHeader"
import Text from "../../../../components/Text"
import { useSplitViewContext } from "../../../../components/SplitView/context"
import { findScroller } from "../../../../hooks/useScrolled"
import { NAVIGATION_PATH } from "./constants"

import * as styles from "./AssetHeader.module.scss"

// Whether the top of `titleRef`'s element has slid under the bar, measured
// against the real layout (one rect pair per frame while scrolling), so
// content above the title or larger type can't throw it off.
function useTitleUnderBar(rootRef, titleRef) {
    const [under, setUnder] = useState(false)

    useEffect(() => {
        const bar = rootRef.current?.firstElementChild
        const title = titleRef.current
        const scroller = findScroller(title)
        if (!bar || !title || !scroller) return undefined

        let frame = 0
        const measure = () => {
            frame = 0
            setUnder(
                title.getBoundingClientRect().top <
                    bar.getBoundingClientRect().bottom
            )
        }
        const onScroll = () => {
            frame ||= requestAnimationFrame(measure)
        }

        measure()
        scroller.addEventListener("scroll", onScroll, { passive: true })
        return () => {
            scroller.removeEventListener("scroll", onScroll)
            cancelAnimationFrame(frame)
        }
    }, [rootRef, titleRef])

    return under
}

/**
 * Pinned bar of an asset page: back to the tabs, and the asset's name once
 * the page's own title has scrolled under it.
 * @param {string} props.title
 * @param {import("react").RefObject} props.titleRef The page's own title.
 * @param {boolean} [props.overCard] The page opens on a card-coloured hero:
 * the bar's scroll fade takes the card colour instead of the page's.
 */
export default function AssetHeader({ title, titleRef, overCard = false }) {
    const [, navigate] = useLocation()
    const { inDetailPane } = useSplitViewContext()
    const ref = useRef(null)
    const scrolled = useTitleUnderBar(ref, titleRef)

    return (
        <div ref={ref} className={cx(styles.root, overCard && styles.overCard)}>
            <PanelHeader
                pin="sticky"
                {...(!inDetailPane && {
                    left: <PanelHeader.BackIcon />,
                    onLeft: () => navigate(NAVIGATION_PATH),
                })}
            >
                <span
                    className={cx(styles.title, scrolled && styles.shown)}
                    aria-hidden={!scrolled}
                >
                    <Text
                        apple={{ variant: "body", weight: "semibold" }}
                        material={{ variant: "title3", weight: "medium" }}
                    >
                        {title}
                    </Text>
                </span>
            </PanelHeader>
        </div>
    )
}

AssetHeader.propTypes = {
    title: PropTypes.string.isRequired,
    titleRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
    overCard: PropTypes.bool,
}
