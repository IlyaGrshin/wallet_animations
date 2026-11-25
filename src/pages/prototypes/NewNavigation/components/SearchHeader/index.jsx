import { useEffect, useState } from "react"
import PropTypes from "prop-types"
import cx from "clsx"

import PanelHeader from "../../../../../components/PanelHeader"
import ImageAvatar from "../../../../../components/ImageAvatar"
import TextField from "../../../../../components/TextField"
import { useAvatarUrl } from "../../../../../hooks/useAvatarUrl"
import { useSkin } from "../../../../../hooks/DeviceProvider"
import { useScrolled } from "../../../../../hooks/useScrolled"
import { paintHeader } from "../../../../../lib/twa"
import GiftPromo from "../GiftPromo"

import GiftIcon from "../../../../../icons/28/Gift Fill.svg?react"

import * as styles from "./SearchHeader.module.scss"

// Scroll offset at which a tab's hero has passed under the header: the
// Rewards gradient stays solid to 348px, minus roughly the header itself.
const HERO_END = 280

// Pinned search bar of the wallet tabs: fades and blurs the content scrolling
// under it. `heroColor` is set for a tab that opens on a coloured hero: over
// the hero the bar is in its overlay look, its scroll fade and the Telegram
// header take that colour, and both return to the page colour once it has
// passed.
export default function SearchHeader({ heroColor }) {
    const { isApple } = useSkin()
    const avatarUrl = useAvatarUrl()
    const [query, setQuery] = useState("")
    const [heroRef, pastHero] = useScrolled(Boolean(heroColor), HERO_END)
    const overHero = Boolean(heroColor) && !pastHero

    // One paint per crossing of the hero's end.
    useEffect(() => {
        if (heroColor) paintHeader(overHero ? heroColor : null)
    }, [heroColor, overHero])

    // Hidden tabs (Activity) drop their effects, so leaving the tab hands the
    // header back to the page colour.
    useEffect(() => {
        if (!heroColor) return undefined
        return () => paintHeader(null)
    }, [heroColor])

    return (
        <div
            ref={heroRef}
            className={cx(styles.root, overHero && styles.overHero)}
            style={overHero ? { "--page-background": heroColor } : undefined}
        >
            <PanelHeader
                pin="sticky"
                overlay={overHero}
                left={<ImageAvatar src={avatarUrl} size={isApple ? 38 : 36} />}
                right={<GiftPromo icon={<GiftIcon />} label="Get $50" />}
                search={
                    <TextField
                        type="search"
                        label="Search"
                        value={query}
                        onChange={setQuery}
                        onClear={() => setQuery("")}
                    />
                }
            />
        </div>
    )
}

SearchHeader.propTypes = {
    // Hero colour of the tab, e.g. "#3886d9"; omit for a plain page.
    heroColor: PropTypes.string,
}
