import Text from "../Text"

import * as styles from "./SplitView.module.scss"

// Empty-state shown in the detail pane when no item is selected (route "/").
const SplitViewPlaceholder = () => (
    <div className={styles.placeholder}>
        <Text variant="body" weight="regular">
            Select a component
        </Text>
    </div>
)

export default SplitViewPlaceholder
