import { useEffect } from "react"
import SegmentedControl from "../SegmentedControl"
import GlassContainer from "../GlassEffect/GlassContainer"
import { ensureRobotoFlex, useSkin } from "../../hooks/DeviceProvider"

import * as styles from "./SkinSwitcher.module.scss"

const SKINS = [
    { label: "Apple", value: "apple" },
    { label: "Material", value: "material" },
]

const SkinSwitcher = () => {
    const { skin, setSkin } = useSkin()
    const defaultIndex = Math.max(
        0,
        SKINS.findIndex((s) => s.value === skin)
    )

    useEffect(() => {
        ensureRobotoFlex()
    }, [])

    // Reserve bottom space while the switcher floats over the UI, so
    // bottom-anchored elements (TabBar, Snackbar) lift above it via --bottom-clearance.
    useEffect(() => {
        document.body.classList.add("skin-switcher-active")
        return () => document.body.classList.remove("skin-switcher-active")
    }, [])

    const handleChange = (index) => {
        const next = SKINS[index].value
        if (next !== skin) setSkin(next)
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
