import { useState } from "react"
import PropTypes from "prop-types"

import Page from "../Page"
import SectionHeader from "../SectionHeader"
import PanelHeader from "../PanelHeader"
import ImageAvatar from "../ImageAvatar"
import TextField from "../TextField"

import CheckmarkIcon from "../../icons/28/Checkmark.svg?react"
import GiftIcon from "../../icons/28/Gift Fill.svg?react"

import { useAvatarUrl } from "../../hooks/useAvatarUrl"
import { useSkin } from "../../hooks/DeviceProvider"
import { BackButton } from "../../lib/twa"

import * as styles from "./PanelHeader.showcase.module.scss"

const noop = () => {}

const Sample = ({ label, over = false, plain = false, children }) => (
    <div className={styles.section}>
        <SectionHeader title={label} />
        <div
            className={`${styles.canvas} ${over ? styles.over : ""} ${
                plain ? styles.plain : ""
            }`}
        >
            {children}
        </div>
    </div>
)

Sample.propTypes = {
    label: PropTypes.string,
    over: PropTypes.bool,
    plain: PropTypes.bool,
    children: PropTypes.node,
}

const PanelHeaderShowcase = () => {
    const { isApple } = useSkin()
    const avatarUrl = useAvatarUrl()
    const [query, setQuery] = useState("")

    return (
        <>
            <BackButton />
            <Page>
                <Sample label="Regular">
                    <PanelHeader
                        left={<PanelHeader.BackIcon />}
                        onLeft={noop}
                        right={<PanelHeader.MoreIcon />}
                        onRight={noop}
                    >
                        Title
                    </PanelHeader>
                </Sample>

                <Sample label="Title only">
                    <PanelHeader>Title</PanelHeader>
                </Sample>

                <Sample label="Icon + label">
                    <PanelHeader
                        left={<PanelHeader.CloseIcon />}
                        onLeft={noop}
                        right={{ apple: "Done", material: <CheckmarkIcon /> }}
                        onRight={noop}
                    >
                        Title
                    </PanelHeader>
                </Sample>

                {isApple && (
                    <Sample label="Secondary">
                        <PanelHeader
                            left={<PanelHeader.BackIcon />}
                            onLeft={noop}
                            leftVariant="secondary"
                            right={<PanelHeader.MoreIcon />}
                            onRight={noop}
                            rightVariant="secondary"
                        >
                            Title
                        </PanelHeader>
                    </Sample>
                )}

                <Sample label="Accent">
                    <PanelHeader
                        left={<PanelHeader.CloseIcon />}
                        onLeft={noop}
                        right={{ apple: "Done", material: <CheckmarkIcon /> }}
                        onRight={noop}
                        rightVariant="accent"
                    >
                        Title
                    </PanelHeader>
                </Sample>

                <Sample label="Search" plain>
                    <PanelHeader
                        left={<ImageAvatar src={avatarUrl} size={isApple ? 38 : 36} />}
                        onLeft={noop}
                        right={<GiftIcon />}
                        onRight={noop}
                        search={
                            <TextField
                                type="search"
                                label="Search"
                                value={query}
                                onChange={setQuery}
                                onClear={() => setQuery("")}
                            />
                        }
                    />
                </Sample>

                <Sample label="Overlay" over>
                    <PanelHeader
                        left={<PanelHeader.BackIcon />}
                        onLeft={noop}
                        right={<PanelHeader.MoreIcon />}
                        onRight={noop}
                        overlay
                    >
                        Title
                    </PanelHeader>
                </Sample>

                {isApple && (
                    <Sample label="Title capsule">
                        <PanelHeader
                            left={<PanelHeader.BackIcon />}
                            onLeft={noop}
                            right={<PanelHeader.MoreIcon />}
                            onRight={noop}
                            titleGlass
                        >
                            Title
                        </PanelHeader>
                    </Sample>
                )}
            </Page>
        </>
    )
}

export default PanelHeaderShowcase
