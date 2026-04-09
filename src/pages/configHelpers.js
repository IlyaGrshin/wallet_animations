const PREFIX_MAP = {
    Components: "showcase",
    Prototypes: "prototype",
}

export function categoryToPrefix(category) {
    return PREFIX_MAP[category] || category.toLowerCase()
}

export function titleToSlug(title) {
    const words = title.split(/\s+/)
    return words
        .map((w, i) =>
            i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)
        )
        .join("")
}

export function sortedPages(config) {
    return config.map((group) => ({
        ...group,
        pages: group.pages.toSorted((a, b) => a.title.localeCompare(b.title)),
    }))
}

export function flattenRoutes(config) {
    return sortedPages(config).flatMap(({ category, pages }) => {
        const prefix = categoryToPrefix(category)
        return pages.map((page) => {
            const slug = page.slug || titleToSlug(page.title)
            return {
                path: `/${prefix}/${slug}${page.routeSuffix || ""}`,
                component: page.component,
                title: page.title,
                slug,
            }
        })
    })
}
