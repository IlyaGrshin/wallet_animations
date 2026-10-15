import cx from "clsx"

import PanelHeader from "../../../../../components/PanelHeader"

import { useOverDarkBlock } from "./useOverDarkBlock"
import * as styles from "./TonWalletHeader.module.scss"

export default function TonWalletHeader() {
    const [ref, overDark] = useOverDarkBlock()

    return (
        <div
            ref={ref}
            className={cx(styles.root, !overDark && styles.light)}
            data-color-scheme={overDark ? "dark" : undefined}
        >
            <PanelHeader
                pin="sticky"
                left={<PanelHeader.BackIcon />}
                onLeft={() => window.history.back()}
            />
        </div>
    )
}
