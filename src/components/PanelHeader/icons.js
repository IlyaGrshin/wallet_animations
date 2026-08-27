import { useSkin } from "../../hooks/DeviceProvider"

import ChevronLeftIcon from "../../icons/28/Chevron Left.svg?react"
import AppleXmarkIcon from "../../icons/28/Xmark.svg?react"
import AppleEllipsisIcon from "../../icons/28/Elipsis.svg?react"
import ArrowLeftIcon from "../../icons/24/Arrow Left.svg?react"
import MaterialXmarkIcon from "../../icons/24/Xmark.svg?react"
import MaterialDotsIcon from "../../icons/24/Elipsis.svg?react"

const platformIcon = (Apple, Material) => {
    const PlatformIcon = () => {
        const { isApple } = useSkin()

        return isApple ? <Apple /> : <Material />
    }

    return PlatformIcon
}

export const BackIcon = platformIcon(ChevronLeftIcon, ArrowLeftIcon)
export const CloseIcon = platformIcon(AppleXmarkIcon, MaterialXmarkIcon)
export const MoreIcon = platformIcon(AppleEllipsisIcon, MaterialDotsIcon)
