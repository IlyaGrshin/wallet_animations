import SegmentedControl from "../SegmentedControl"
import GlassContainer from "../GlassEffect/GlassContainer"
import { currentSkin, setSkinOverride } from "../../hooks/DeviceProvider"

import * as styles from "./SkinSwitcher.module.scss"

const SKINS = [
    { label: "Apple", value: "apple" },
    { label: "Material", value: "material" },
]

const SkinSwitcher = () => {
    const defaultIndex = Math.max(
        0,
        SKINS.findIndex((s) => s.value === currentSkin)
    )

    const handleChange = (index) => {
        const next = SKINS[index].value
        if (next !== currentSkin) setSkinOverride(next)
    }

    return (
        <GlassContainer className={styles.root}>
            <SegmentedControl
                segments={SKINS.map((s) => s.label)}
                defaultIndex={defaultIndex}
                onChange={handleChange}
                type="circled"
            />
        </GlassContainer>
    )
}

export default SkinSwitcher
