import { useState } from "react"

import PanelHeader from "../../../../../components/PanelHeader"
import ImageAvatar from "../../../../../components/ImageAvatar"
import TextField from "../../../../../components/TextField"
import { useAvatarUrl } from "../../../../../hooks/useAvatarUrl"
import { useSkin } from "../../../../../hooks/DeviceProvider"

import GiftIcon from "../../../../../icons/28/Gift Fill.svg?react"

export default function SearchHeader() {
    const { isApple } = useSkin()
    const avatarUrl = useAvatarUrl()
    const [query, setQuery] = useState("")

    return (
        <PanelHeader
            left={<ImageAvatar src={avatarUrl} size={isApple ? 38 : 36} />}
            right={<GiftIcon />}
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
    )
}
