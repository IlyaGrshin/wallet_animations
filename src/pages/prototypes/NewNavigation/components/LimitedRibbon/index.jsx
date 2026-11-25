import Text from "../../../../../components/Text"

import ribbonUrl from "../../../../../images/earn/Ribbon.svg"

import * as styles from "./LimitedRibbon.module.scss"

// "limited" band across a card's top-right corner. The card must be
// positioned and must not clip: the band's folded ends show past its edges.
export default function LimitedRibbon() {
    return (
        <span className={styles.root} aria-hidden="true">
            <img src={ribbonUrl} alt="" />
            <span className={styles.label}>
                <Text
                    apple={{
                        variant: "caption2",
                        weight: "semibold",
                        rounded: true,
                    }}
                    material={{ variant: "caption2", weight: "medium" }}
                >
                    limited
                </Text>
            </span>
        </span>
    )
}
