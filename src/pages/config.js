import { lazy } from "react"

const config = [
    {
        category: "Components",
        pages: [
            {
                title: "Cell",
                slug: "cell",
                component: lazy(
                    () => import("../components/Cells/Cells.showcase")
                ),
            },
            {
                title: "Navigation Bar",
                slug: "navigation-bar",
                component: lazy(() => import("./showcases/NavigationBar")),
            },
            {
                title: "Bottom Bar",
                slug: "bottom-bar",
                component: lazy(() => import("./showcases/BottomBar")),
            },
            {
                title: "Input Page",
                slug: "input-page",
                component: lazy(
                    () => import("../components/TextField/TextField.showcase")
                ),
            },
            {
                title: "Picker",
                slug: "picker",
                component: lazy(
                    () => import("../components/Picker/Picker.showcase")
                ),
            },
            {
                title: "Wheel",
                slug: "wheel",
                component: lazy(
                    () => import("../components/Wheel/Wheel.showcase")
                ),
            },
            {
                title: "Modal Pages",
                slug: "modal-pages",
                component: lazy(
                    () => import("../components/ModalView/ModalView.showcase")
                ),
            },
        ],
    },
    {
        category: "Prototypes",
        pages: [
            {
                title: "Navigation",
                slug: "navigation",
                component: lazy(() => import("./prototypes/NewNavigation")),
                routeSuffix: "/:rest*?",
            },
            {
                title: "Color Asset Page",
                slug: "color-asset-page",
                component: lazy(() => import("./prototypes/ColorAssetPage")),
            },
            {
                title: "Onboarding",
                slug: "onboarding",
                component: lazy(() => import("./prototypes/Onboarding")),
            },
            {
                title: "Background Tests",
                slug: "background-tests",
                component: lazy(() => import("./prototypes/ColorChanging")),
            },
        ],
    },
]

export default config
