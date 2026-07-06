import { useEffect, useState } from "react"

const ENDPOINT = "https://ilyagrshn.com/coingeckoApi/index.php"

// Module-level cache: the request fires once and is shared across screens
// and remounts, so revisiting a screen shows data instantly.
let assetsPromise = null

const loadAssets = () => {
    assetsPromise ??= fetch(ENDPOINT).then((response) => response.json())
    return assetsPromise
}

// Stateful loader: `assets` stays null until the fetch resolves, so screens
// can render their skeleton in the same tree and reveal it in place (see
// Skeleton) instead of swapping out a Suspense fallback.
export default function useAssets() {
    const [state, setState] = useState({ assets: null, error: null })

    useEffect(() => {
        let active = true
        loadAssets().then(
            (assets) => active && setState({ assets, error: null }),
            (error) => active && setState({ assets: null, error })
        )
        return () => {
            active = false
        }
    }, [])

    return state
}
