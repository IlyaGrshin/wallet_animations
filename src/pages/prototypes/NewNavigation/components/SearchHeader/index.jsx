import { useState } from "react"
import cx from "clsx"

import PanelHeader from "../../../../../components/PanelHeader"
import ImageAvatar from "../../../../../components/ImageAvatar"
import TextField from "../../../../../components/TextField"
import { useAvatarUrl } from "../../../../../hooks/useAvatarUrl"
import { useSkin } from "../../../../../hooks/DeviceProvider"
import { useScrolled } from "../../../../../hooks/useScrolled"
import GiftPromo from "../GiftPromo"

import GiftIcon from "../../../../../icons/28/Gift Fill.svg?react"

import * as styles from "./SearchHeader.module.scss"

export default function SearchHeader() {
    const { isApple } = useSkin()
    const avatarUrl = useAvatarUrl()
    const [query, setQuery] = useState("")
    const [ref, scrolled] = useScrolled()

    return (
        <div ref={ref} className={cx(styles.root, scrolled && styles.scrolled)}>
            <PanelHeader
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
