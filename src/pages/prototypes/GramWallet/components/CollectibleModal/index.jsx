import PropTypes from "prop-types"

import { MultilineButton } from "../../../../../components/Button"
import { Redaction } from "../../../../../components/Skeleton"
import { useSnackbar } from "../../../../../components/Snackbar"
import Tappable from "../../../../../components/Tappable"
import WebApp, { isTelegram } from "../../../../../lib/twa"
import ArrowUpCircleFill from "../../../../../icons/28/Arrow Up Circle Fill.svg?react"
import ShareCircleFill from "../../../../../icons/28/Share Circle Fill.svg?react"
import SparkleCircleFill from "../../../../../icons/28/Sparkle Circle Fill.svg?react"

import DetailModal from "../DetailModal"
import useNftHistory from "./useNftHistory"
import * as styles from "./CollectibleModal.module.scss"

const CollectibleModal = ({
    collectible,
    isWorn = false,
    onToggleWear,
    isOpen,
    onClose,
}) => {
    const snackbar = useSnackbar()
    const history = useNftHistory(collectible)

    if (!collectible) return null

    const notify = (title) => snackbar.show({ position: "bottom", title })

    const copy = async (text, success) => {
        try {
            await navigator.clipboard.writeText(text)
            notify(success)
        } catch {
            notify("Couldn't copy to clipboard")
        }
    }

    const send = () => notify("Transfers are not available in this prototype")

    const share = () => {
        if (isTelegram()) {
            const url = encodeURIComponent(collectible.link)
            WebApp.openTelegramLink(`https://t.me/share/url?url=${url}`)
            return
        }
        copy(collectible.link, "Link copied")
    }

    const toggleWear = () => {
        onToggleWear(collectible.id)
        notify(
            isWorn
                ? `${collectible.name} is off your profile`
                : `${collectible.name} is now on your profile`
        )
    }

    const copyAddress = () => copy(collectible.address, "Address copied")

    const historyRow = (label, value) => {
        if (history.isLoading) {
            return [label, <Redaction key={label} active width={8} />]
        }
        return value ? [label, value] : null
    }

    const rows = [
        collectible.collectionName && [
            "Collection",
            collectible.collectionName,
        ],
        ...collectible.attributes.map(({ trait, value }) => [trait, value]),
        collectible.domain && ["Domain", collectible.domain],
        historyRow("Received from", history.from),
        historyRow("Owned since", history.since),
        historyRow("Minted", history.minted),
        [
            "Address",
            <Tappable
                key="address"
                as="button"
                mode="opacity"
                className={styles.copy}
                onClick={copyAddress}
            >
                {collectible.shortAddress}
            </Tappable>,
        ],
    ].filter(Boolean)

    const actions = (
        <div className={styles.actions}>
            <Tappable className={styles.tile} onClick={send}>
                <MultilineButton
                    variant="tinted"
                    icon={<ArrowUpCircleFill />}
                    label="Send"
                />
            </Tappable>
            {collectible.isWearable && (
                <Tappable className={styles.tile} onClick={toggleWear}>
                    <MultilineButton
                        variant={isWorn ? "filled" : "tinted"}
                        icon={<SparkleCircleFill />}
                        label={isWorn ? "Take Off" : "Wear"}
                    />
                </Tappable>
            )}
            {collectible.link && (
                <Tappable className={styles.tile} onClick={share}>
                    <MultilineButton
                        variant="tinted"
                        icon={<ShareCircleFill />}
                        label="Share"
                    />
                </Tappable>
            )}
        </div>
    )

    return (
        <DetailModal
            title={collectible.name}
            image={collectible.preview}
            description={
                collectible.attributes.length > 0
                    ? null
                    : collectible.description
            }
            actions={actions}
            rows={rows}
            isOpen={isOpen}
            onClose={onClose}
        />
    )
}

CollectibleModal.propTypes = {
    collectible: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        preview: PropTypes.string,
        description: PropTypes.string,
        collectionName: PropTypes.string,
        domain: PropTypes.string,
        address: PropTypes.string,
        shortAddress: PropTypes.string,
        link: PropTypes.string,
        isWearable: PropTypes.bool,
        attributes: PropTypes.arrayOf(
            PropTypes.shape({
                trait: PropTypes.string.isRequired,
                value: PropTypes.string.isRequired,
            })
        ).isRequired,
    }),
    isWorn: PropTypes.bool,
    onToggleWear: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default CollectibleModal
