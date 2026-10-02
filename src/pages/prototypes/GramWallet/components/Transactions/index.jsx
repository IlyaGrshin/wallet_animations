import { useEffect, useRef, useState } from "react"
import PropTypes from "prop-types"

import Cell from "../../../../../components/Cells"
import ImageAvatar from "../../../../../components/ImageAvatar"
import InitialsAvatar from "../../../../../components/InitialsAvatar"
import useModal from "../../../../../hooks/useModal"
import ListSkeleton from "../ListSkeleton"
import ArrowDownCircleFill from "../../../../../icons/28/Arrow Down Circle Fill.svg?react"
import ArrowUpCircleFill from "../../../../../icons/28/Arrow Up Circle Fill.svg?react"
import ArrowLeftRightCircleFill from "../../../../../icons/28/Arrow Left & Right Circle Fill.svg?react"

import Amount from "../Amount"
import TransactionModal from "../TransactionModal"
import * as styles from "./Transactions.module.scss"

function hashToUserId(str) {
    let h = 0
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
    return Math.abs(h)
}

function renderAvatar(tx) {
    if (tx.nft?.image) {
        return <ImageAvatar src={tx.nft.image} shape="rounded" />
    }
    if (tx.description === "Deposit") {
        return (
            <Cell.Start
                type="Icon"
                iconType={<ArrowDownCircleFill />}
                variant="success"
            />
        )
    }
    if (tx.description === "Withdrawal") {
        return <Cell.Start type="Icon" iconType={<ArrowUpCircleFill />} />
    }
    if (tx.icon) return <ImageAvatar src={tx.icon} />
    if (tx.name && tx.name !== "Activity") {
        return <InitialsAvatar userId={hashToUserId(tx.name)} name={tx.name} />
    }
    return <Cell.Start type="Icon" iconType={<ArrowLeftRightCircleFill />} />
}

const Transactions = ({ items, hasMore, loadMore }) => {
    const [selected, setSelected] = useState(null)
    const { handlers } = useModal({ detail: false })
    const sentinelRef = useRef(null)

    useEffect(() => {
        if (!hasMore) return
        const sentinel = sentinelRef.current
        if (!sentinel) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) loadMore()
            },
            { rootMargin: "1500px" }
        )
        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [hasMore, loadMore])

    if (items === null) return <ListSkeleton caption />

    return (
        <>
            <div>
                {items.map((tx) => (
                    <Cell
                        key={tx.id}
                        start={renderAvatar(tx)}
                        end={
                            tx.amount && (
                                <Cell.End
                                    label={
                                        <Amount
                                            value={tx.amount}
                                            unit={tx.unit}
                                        />
                                    }
                                />
                            )
                        }
                        onClick={() => {
                            setSelected(tx)
                            handlers.detail.open()
                        }}
                    >
                        <Cell.Text
                            title={tx.name}
                            description={tx.description}
                            caption={tx.caption}
                            bold
                        />
                    </Cell>
                ))}
            </div>
            {hasMore && (
                <div
                    ref={sentinelRef}
                    className={styles.sentinel}
                    aria-hidden="true"
                />
            )}
            <TransactionModal
                transaction={selected}
                isOpen={handlers.detail.isOpen}
                onClose={handlers.detail.close}
            />
        </>
    )
}

Transactions.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string,
            caption: PropTypes.string,
            amount: PropTypes.string,
            unit: PropTypes.string,
            icon: PropTypes.string,
            nft: PropTypes.shape({
                name: PropTypes.string,
                image: PropTypes.string,
                preview: PropTypes.string,
            }),
        })
    ),
    hasMore: PropTypes.bool,
    loadMore: PropTypes.func.isRequired,
}

export default Transactions
