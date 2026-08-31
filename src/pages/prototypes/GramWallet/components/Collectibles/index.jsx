import { useState } from "react"
import PropTypes from "prop-types"

import Cell from "../../../../../components/Cells"
import ImageAvatar from "../../../../../components/ImageAvatar"
import Text from "../../../../../components/Text"
import useModal from "../../../../../hooks/useModal"
import CollectibleModal from "../CollectibleModal"
import ListSkeleton from "../ListSkeleton"

import * as styles from "./Collectibles.module.scss"

const Collectibles = ({ items }) => {
    const [selected, setSelected] = useState(null)
    const [wornId, setWornId] = useState(null)
    const { handlers } = useModal({ detail: false })

    if (items === null) {
        return <ListSkeleton end={<Cell.Part type="Chevron" />} />
    }

    const toggleWear = (id) => setWornId((current) => (current === id ? null : id))

    return (
        <>
            <div>
                {items.map((item) => (
                    <Cell
                        key={item.id}
                        start={<ImageAvatar src={item.image} shape="rounded" />}
                        end={
                            wornId === item.id ? (
                                <div className={styles.trailing}>
                                    <Text
                                        apple={{ variant: "subheadline1" }}
                                        material={{ variant: "subheadline2" }}
                                    >
                                        Worn
                                    </Text>
                                    <Cell.Part type="Chevron" />
                                </div>
                            ) : (
                                <Cell.Part type="Chevron" />
                            )
                        }
                        onClick={() => {
                            setSelected(item)
                            handlers.detail.open()
                        }}
                    >
                        <Cell.Text
                            title={item.name}
                            description={item.caption}
                            bold
                        />
                    </Cell>
                ))}
            </div>
            <CollectibleModal
                collectible={selected}
                isWorn={selected != null && wornId === selected.id}
                onToggleWear={toggleWear}
                isOpen={handlers.detail.isOpen}
                onClose={handlers.detail.close}
            />
        </>
    )
}

Collectibles.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            caption: PropTypes.string,
            image: PropTypes.string,
        })
    ),
}

export default Collectibles
