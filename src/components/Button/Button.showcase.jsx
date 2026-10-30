import { useState } from "react"

import Page from "../Page"
import SectionList from "../SectionList"
import { RegularButton, MultilineButton } from "../Button"

import { BackButton } from "../../lib/twa"

import ArrowUpIcon from "../../icons/28/Arrow Up Circle Fill.svg?react"
import PlusIcon from "../../icons/28/Plus Circle Fill.svg?react"

// Each tap flips the state so the transition can be poked both ways.
const LoadingButton = () => {
    const [isLoading, setIsLoading] = useState(false)

    return (
        <RegularButton
            variant="filled"
            label="Tap to Load"
            isLoading={isLoading}
            onClick={() => setIsLoading((value) => !value)}
            // A loading button ignores taps; re-enable them for the demo only.
            style={{ pointerEvents: "auto" }}
        />
    )
}

const ButtonShowcase = () => (
    <>
        <BackButton />
        <Page>
            <SectionList>
                <SectionList.Item header="Regular Button">
                    <div
                        style={{
                            padding: "12px var(--side-padding)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                        }}
                    >
                        <RegularButton variant="filled" label="Filled" />
                        <RegularButton
                            variant="filled"
                            label="Filled Shine"
                            isShine
                        />
                        <RegularButton variant="outlined" label="Outlined" />
                        <LoadingButton />
                        <RegularButton
                            variant="filled"
                            label="Loading"
                            isLoading
                        />
                    </div>
                </SectionList.Item>

                <SectionList.Item header="Multiline Button">
                    <div
                        style={{
                            padding: "12px var(--side-padding)",
                            display: "flex",
                            gap: 12,
                        }}
                    >
                        <MultilineButton
                            variant="filled"
                            icon={<ArrowUpIcon />}
                            label="Send"
                        />
                        <MultilineButton
                            variant="filled"
                            icon={<PlusIcon />}
                            label="Add"
                        />
                        <MultilineButton
                            variant="plain"
                            icon={<ArrowUpIcon />}
                            label="Plain"
                        />
                    </div>
                </SectionList.Item>
            </SectionList>
        </Page>
    </>
)

export default ButtonShowcase
