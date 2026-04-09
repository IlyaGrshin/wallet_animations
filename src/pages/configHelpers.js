const PREFIX_MAP = {
    Components: "showcase",
    Prototypes: "prototype",
}

export function categoryToPrefix(category) {
    return PREFIX_MAP[category] || category.toLowerCase()
}

export function flattenRoutes(config) {
    return config.flatMap(({ category, pages }) => {
        const prefix = categoryToPrefix(category)
        return pages.map((page) => ({
            path: `/${prefix}/${page.slug}${page.routeSuffix || ""}`,
            component: page.component,
            title: page.title,
        }))
    })
}
