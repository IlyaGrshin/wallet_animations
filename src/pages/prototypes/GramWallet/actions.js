import { formatTimestamp } from "./helpers"
import { shortenAddress, shortenFriendly } from "../../../utils/address"
import { isFragmentUri, rawKey } from "./nft"
import { TON_DECIMALS } from "./constants"

const amountFmt = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: TON_DECIMALS,
})

const PARTIES = {
    ton_transfer: (d) => [d.source, d.destination],
    nft_transfer: (d) => [d.old_owner, d.new_owner],
}

export const ACTION_TYPES = Object.keys(PARTIES)

function tokenInfo(metadata, address) {
    const entry = metadata?.[rawKey(address)]
    return entry?.token_info?.[0] || {}
}

function formatAmount(raw, decimals) {
    if (raw == null) return null
    return amountFmt.format(Number(raw) / 10 ** decimals)
}

function partyName(addressBook, address) {
    const entry = addressBook?.[rawKey(address)]
    return (
        entry?.domain ||
        shortenFriendly(entry?.user_friendly) ||
        shortenAddress(address)
    )
}

function tonRow(details) {
    return {
        amount: formatAmount(details.value, TON_DECIMALS),
        unit: "Gram",
    }
}

function nftRow(details, metadata) {
    const collection = tokenInfo(metadata, details.nft_collection)
    if (!isFragmentUri(collection.extra?.uri)) return null
    const item = tokenInfo(metadata, details.nft_item)
    const extra = item.extra || {}
    return {
        amount: "1",
        unit: "Gift",
        nftAddress: details.nft_item,
        nft: {
            name: item.name,
            image: extra._image_small || item.image,
            preview: extra._image_medium || extra._image_big || item.image,
        },
    }
}

function typeRow(action, metadata) {
    const details = action.details || {}
    if (action.type === "ton_transfer") return tonRow(details)
    if (action.type === "nft_transfer") return nftRow(details, metadata)
    return null
}

function mapAction(action, myRawAddress, metadata, addressBook) {
    if (!action.success) return null
    const parties = PARTIES[action.type]
    if (!parties) return null
    const row = typeRow(action, metadata)
    if (!row) return null

    const [from, to] = parties(action.details || {})
    const incoming = rawKey(to) === rawKey(myRawAddress)
    const counterparty = incoming ? from : to
    const sign = row.amount ? (incoming ? "+" : "−") : ""

    return {
        id: action.action_id,
        name: partyName(addressBook, counterparty),
        description:
            action.type === "nft_transfer"
                ? "NFT Transfer"
                : incoming ? "Deposit" : "Withdrawal",
        caption: formatTimestamp(action.start_utime),
        amount: row.amount ? `${sign}${row.amount}` : null,
        unit: row.unit,
        nftAddress: row.nftAddress,
        nft: row.nft,
    }
}

export function mapActions(response, myRawAddress) {
    const { metadata, address_book: addressBook } = response
    return (response.actions || [])
        .map((a) => mapAction(a, myRawAddress, metadata, addressBook))
        .filter(Boolean)
}
