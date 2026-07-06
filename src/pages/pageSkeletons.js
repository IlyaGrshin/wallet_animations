// Per-screen loading skeletons, keyed by the page title used in config.js.
// These are EAGER imports on purpose: a skeleton is the Suspense fallback that
// must paint instantly while the screen's own lazy chunk loads, so it cannot
// itself be code-split. Screens without an entry fall back to PageSkeleton.

import CellsSkeleton from "../components/Cells/Cells.skeleton"
import PickerSkeleton from "../components/Picker/Picker.skeleton"
import WheelSkeleton from "../components/Wheel/Wheel.skeleton"
import ModalViewSkeleton from "../components/ModalView/ModalView.skeleton"
import TrainSkeleton from "../components/Train/Train.skeleton"
import StartViewSkeleton from "../components/StartView/StartView.skeleton"
import SectionListSkeleton from "../components/SectionList/SectionList.skeleton"
import ImageAvatarSkeleton from "../components/ImageAvatar/ImageAvatar.skeleton"
import InitialsAvatarSkeleton from "../components/InitialsAvatar/InitialsAvatar.skeleton"
import SwitchSkeleton from "../components/Switch/Switch.skeleton"
import CollapsibleSkeleton from "../components/Collapsible/Collapsible.skeleton"
import ButtonSkeleton from "../components/Button/Button.skeleton"
import SegmentedControlSkeleton from "../components/SegmentedControl/SegmentedControl.skeleton"
import DropdownMenuSkeleton from "../components/DropdownMenu/DropdownMenu.skeleton"
import TooltipSkeleton from "../components/Tooltip/Tooltip.skeleton"
import TextSkeleton from "../components/Text/Text.skeleton"
import MarkdownSkeleton from "../components/Markdown/Markdown.skeleton"
import TableSkeleton from "../components/Table/Table.skeleton"
import GallerySkeleton from "../components/Gallery/Gallery.skeleton"
import TabBarSkeleton from "../components/TabBar/TabBar.skeleton"
import TabsSkeleton from "../components/Tabs/Tabs.skeleton"
import SnackbarSkeleton from "../components/Snackbar/Snackbar.skeleton"
import StreamingTextSkeleton from "../components/StreamingText/StreamingText.skeleton"
import ParticleEffectSkeleton from "../components/ParticleEffect/ParticleEffect.skeleton"
import CalligraphSkeleton from "../components/Calligraph/Calligraph.skeleton"
import NavigationBarSkeleton from "./showcases/NavigationBar/NavigationBar.skeleton"
import BottomBarSkeleton from "./showcases/BottomBar/BottomBar.skeleton"
import HapticFeedbackSkeleton from "./showcases/HapticFeedback/HapticFeedback.skeleton"
import TextFieldSkeleton from "../components/TextField/TextField.skeleton"
import NavigationSkeleton from "./prototypes/NewNavigation/NewNavigation.skeleton"
import ColorAssetPageSkeleton from "./prototypes/ColorAssetPage/ColorAssetPage.skeleton"
import OnboardingSkeleton from "./prototypes/Onboarding/Onboarding.skeleton"
import BackgroundTestsSkeleton from "./prototypes/ColorChanging/ColorChanging.skeleton"

const pageSkeletons = {
    Cell: CellsSkeleton,
    Picker: PickerSkeleton,
    Wheel: WheelSkeleton,
    "Modal Pages": ModalViewSkeleton,
    Train: TrainSkeleton,
    "Start View": StartViewSkeleton,
    "Section List": SectionListSkeleton,
    "Image Avatar": ImageAvatarSkeleton,
    "Initials Avatar": InitialsAvatarSkeleton,
    Switch: SwitchSkeleton,
    Collapsible: CollapsibleSkeleton,
    Button: ButtonSkeleton,
    "Segmented Control": SegmentedControlSkeleton,
    "Dropdown Menu": DropdownMenuSkeleton,
    Tooltip: TooltipSkeleton,
    Text: TextSkeleton,
    Markdown: MarkdownSkeleton,
    Table: TableSkeleton,
    Gallery: GallerySkeleton,
    TabBar: TabBarSkeleton,
    Tabs: TabsSkeleton,
    Snackbar: SnackbarSkeleton,
    "Streaming Text": StreamingTextSkeleton,
    "Particle Effect": ParticleEffectSkeleton,
    Calligraph: CalligraphSkeleton,
    "Navigation Bar": NavigationBarSkeleton,
    "Bottom Bar": BottomBarSkeleton,
    "Haptic Feedback": HapticFeedbackSkeleton,
    "Input Page": TextFieldSkeleton,
    Navigation: NavigationSkeleton,
    "Color Asset Page": ColorAssetPageSkeleton,
    Onboarding: OnboardingSkeleton,
    "Background Tests": BackgroundTestsSkeleton,
}

export default pageSkeletons
