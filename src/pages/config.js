import lazyWithPreload from "../utils/lazyWithPreload"

const config = [
    {
        category: "Components",
        pages: [
            {
                title: "Cell",
                component: lazyWithPreload(
                    () => import("../components/Cells/Cells.showcase")
                ),
            },
            {
                title: "Picker",
                component: lazyWithPreload(
                    () => import("../components/Picker/Picker.showcase")
                ),
            },
            {
                title: "Wheel",
                component: lazyWithPreload(
                    () => import("../components/Wheel/Wheel.showcase")
                ),
            },
            {
                title: "Modal Pages",
                component: lazyWithPreload(
                    () => import("../components/ModalView/ModalView.showcase")
                ),
            },
            {
                title: "Spinner",
                component: lazyWithPreload(
                    () => import("../components/Spinner/Spinner.showcase")
                ),
            },
            {
                title: "Train",
                component: lazyWithPreload(
                    () => import("../components/Train/Train.showcase")
                ),
            },
            {
                title: "Start View",
                component: lazyWithPreload(
                    () => import("../components/StartView/StartView.showcase")
                ),
            },
            {
                title: "Section List",
                component: lazyWithPreload(
                    () =>
                        import("../components/SectionList/SectionList.showcase")
                ),
            },
            {
                title: "Image Avatar",
                component: lazyWithPreload(
                    () =>
                        import("../components/ImageAvatar/ImageAvatar.showcase")
                ),
            },
            {
                title: "Initials Avatar",
                component: lazyWithPreload(
                    () =>
                        import("../components/InitialsAvatar/InitialsAvatar.showcase")
                ),
            },
            {
                title: "Switch",
                component: lazyWithPreload(
                    () => import("../components/Switch/Switch.showcase")
                ),
            },
            {
                title: "Collapsible",
                component: lazyWithPreload(
                    () =>
                        import("../components/Collapsible/Collapsible.showcase")
                ),
            },
            {
                title: "Button",
                component: lazyWithPreload(
                    () => import("../components/Button/Button.showcase")
                ),
            },
            {
                title: "Segmented Control",
                component: lazyWithPreload(
                    () =>
                        import("../components/SegmentedControl/SegmentedControl.showcase")
                ),
            },
            {
                title: "Dropdown Menu",
                component: lazyWithPreload(
                    () =>
                        import("../components/DropdownMenu/DropdownMenu.showcase")
                ),
            },
            {
                title: "Tooltip",
                component: lazyWithPreload(
                    () => import("../components/Tooltip/Tooltip.showcase")
                ),
            },
            {
                title: "Text",
                component: lazyWithPreload(
                    () => import("../components/Text/Text.showcase")
                ),
            },
            {
                title: "Gallery",
                component: lazyWithPreload(
                    () => import("../components/Gallery/Gallery.showcase")
                ),
            },
            {
                title: "TabBar",
                component: lazyWithPreload(
                    () => import("../components/TabBar/TabBar.showcase")
                ),
            },
            {
                title: "Tabs",
                component: lazyWithPreload(
                    () => import("../components/Tabs/Tabs.showcase")
                ),
            },
            {
                title: "Snackbar",
                component: lazyWithPreload(
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
                component: lazyWithPreload(
                    () => import("./showcases/NavigationBar")
                ),
            },
            {
                title: "Bottom Bar",
                component: lazyWithPreload(
                    () => import("./showcases/BottomBar")
                ),
            },
            {
                title: "Haptic Feedback",
                component: lazyWithPreload(
                    () => import("./showcases/HapticFeedback")
                ),
            },
        ],
    },
    {
        category: "Prototypes",
        pages: [
            {
                title: "Input Page",
                component: lazyWithPreload(
                    () => import("../components/TextField/TextField.showcase")
                ),
            },
            {
                title: "Navigation",
                component: lazyWithPreload(
                    () => import("./prototypes/NewNavigation")
                ),
                routeSuffix: "/:rest*?",
            },
            {
                title: "Color Asset Page",
                component: lazyWithPreload(
                    () => import("./prototypes/ColorAssetPage")
                ),
            },
            {
                title: "Onboarding",
                component: lazyWithPreload(
                    () => import("./prototypes/Onboarding")
                ),
            },
            {
                title: "Background Tests",
                component: lazyWithPreload(
                    () => import("./prototypes/ColorChanging")
                ),
            },
        ],
    },
]

export default config
