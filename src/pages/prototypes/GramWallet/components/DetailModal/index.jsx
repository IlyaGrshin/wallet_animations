import PropTypes from "prop-types"

import ModalView from "../../../../../components/ModalView"
import PanelHeader from "../../../../../components/PanelHeader"
import Table from "../../../../../components/Table"
import Text from "../../../../../components/Text"
import { Image } from "../../../../../components/Image"
import XmarkIcon from "../../../../../icons/28/Xmark.svg?react"

import * as styles from "./DetailModal.module.scss"

const DetailModal = ({
    title,
    image,
    description,
    actions,
    rows,
    emptyLabel,
    isOpen,
    onClose,
}) => (
    <ModalView
        isOpen={isOpen}
        onClose={onClose}
        style={{ backgroundColor: "var(--tg-theme-secondary-bg-color)" }}
    >
        <PanelHeader left={<XmarkIcon />} onLeft={onClose}>
            {title}
        </PanelHeader>
        <div className={styles.body}>
            {image && <Image className={styles.image} src={image} alt="" />}
            {description && (
                <div className={styles.description}>
                    <Text
                        apple={{ variant: "subheadline1" }}
                        material={{ variant: "subheadline2" }}
                    >
                        {description}
                    </Text>
                </div>
            )}
            {actions}
            {rows.length > 0 ? (
                <Table rows={rows} />
            ) : (
                emptyLabel && (
                    <div className={styles.empty}>
                        <Text variant="body">{emptyLabel}</Text>
                    </div>
                )
            )}
        </div>
    </ModalView>
)

DetailModal.propTypes = {
    title: PropTypes.string.isRequired,
    image: PropTypes.string,
    description: PropTypes.string,
    actions: PropTypes.node,
    rows: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.node)).isRequired,
    emptyLabel: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default DetailModal
