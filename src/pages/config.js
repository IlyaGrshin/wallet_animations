import { lazy } from "react"

const config = [
    {
        category: "Components",
        pages: [
            {
                title: "Cell",
                component: lazy(
                    () => import("../components/Cells/Cells.showcase")
                ),
            },
            {
                title: "Picker",
                component: lazy(
                    () => import("../components/Picker/Picker.showcase")
                ),
            },
            {
                title: "Wheel",
                component: lazy(
                    () => import("../components/Wheel/Wheel.showcase")
                ),
            },
            {
                title: "Modal Pages",
                component: lazy(
                    () => import("../components/ModalView/ModalView.showcase")
                ),
            },
            {
                title: "Spinner",
                component: lazy(
                    () => import("../components/Spinner/Spinner.showcase")
                ),
            },
            {
                title: "Train",
                component: lazy(
                    () => import("../components/Train/Train.showcase")
                ),
            },
            {
                title: "Start View",
                component: lazy(
                    () => import("../components/StartView/StartView.showcase")
                ),
            },
            {
                title: "Section List",
                component: lazy(
                    () =>
                        import("../components/SectionList/SectionList.showcase")
                ),
            },
            {
                title: "Image Avatar",
                component: lazy(
                    () =>
                        import("../components/ImageAvatar/ImageAvatar.showcase")
                ),
            },
            {
                title: "Initials Avatar",
                component: lazy(
                    () =>
                        import("../components/InitialsAvatar/InitialsAvatar.showcase")
                ),
            },
            {
                title: "Switch",
                component: lazy(
                    () => import("../components/Switch/Switch.showcase")
                ),
            },
            {
                title: "Collapsible",
                component: lazy(
                    () =>
                        import("../components/Collapsible/Collapsible.showcase")
                ),
            },
            {
                title: "Button",
                component: lazy(
                    () => import("../components/Button/Button.showcase")
                ),
            },
            {
                title: "Segmented Control",
                component: lazy(
                    () =>
                        import("../components/SegmentedControl/SegmentedControl.showcase")
                ),
            },
            {
                title: "Dropdown Menu",
                component: lazy(
                    () =>
                        import("../components/DropdownMenu/DropdownMenu.showcase")
                ),
            },
            {
                title: "Text",
                component: lazy(
                    () => import("../components/Text/Text.showcase")
                ),
            },
            {
                title: "Gallery",
                component: lazy(
                    () => import("../components/Gallery/Gallery.showcase")
                ),
            },
            {
                title: "TabBar",
                component: lazy(
                    () => import("../components/TabBar/TabBar.showcase")
                ),
            },
            {
                title: "Tabs",
                component: lazy(
                    () => import("../components/Tabs/Tabs.showcase")
                ),
            },
            {
                title: "Snackbar",
                component: lazy(
                    () => import("../components/Snackbar/Snackbar.showcase")
                ),
            },
        ],
    },
    {
        category: "Telegram",
        pages: [
            {
                title: "Navigation Bar",
                component: lazy(() => import("./showcases/NavigationBar")),
            },
            {
                title: "Bottom Bar",
                component: lazy(() => import("./showcases/BottomBar")),
            },
        ],
    },
    {
        category: "Prototypes",
        pages: [
            {
                title: "Input Page",
                component: lazy(
                    () => import("../components/TextField/TextField.showcase")
                ),
            },
            {
                title: "Navigation",
                component: lazy(() => import("./prototypes/NewNavigation")),
                routeSuffix: "/:rest*?",
            },
            {
                title: "Color Asset Page",
                component: lazy(() => import("./prototypes/ColorAssetPage")),
            },
            {
                title: "Onboarding",
                component: lazy(() => import("./prototypes/Onboarding")),
            },
            {
                title: "Background Tests",
                component: lazy(() => import("./prototypes/ColorChanging")),
            },
        ],
    },
]

export default config
