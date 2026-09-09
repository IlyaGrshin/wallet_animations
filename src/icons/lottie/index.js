const loaders = {
    apple: () => import("./apple"),
    material: () => import("./material"),
}

const pending = new Map()

export const loadLottieIcons = (skin) => {
    if (!pending.has(skin)) {
        const load = loaders[skin] || loaders.apple
        pending.set(
            skin,
            load().then((module) => module.default),
        )
    }

    return pending.get(skin)
}
