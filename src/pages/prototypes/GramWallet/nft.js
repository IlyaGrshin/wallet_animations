import { formatDate, shortenFriendly } from "./helpers"

const FRAGMENT_HOST = "https://nft.fragment.com/"

const COLLECTION_LABELS = {
    "Telegram Usernames": "Username",
    "Anonymous Telegram Numbers": "Anonymous Number",
}

export const rawKey = (address) => (address ? address.toUpperCase() : address)

export function isFragmentUri(uri) {
    return Boolean(uri) && uri.startsWith(FRAGMENT_HOST)
}

export function isFragmentItem(item) {
    return isFragmentUri(item.collection?.collection_content?.uri)
}

function tokenInfo(response, address) {
    const entry = response.metadata?.[rawKey(address)]
    return entry?.token_info?.[0] || {}
}

function friendlyAddress(response, address) {
    return response.address_book?.[rawKey(address)]?.user_friendly || address
}

function mapAttributes(attributes) {
    return (attributes || [])
        .filter(
            (a) =>
                a?.trait_type &&
                (typeof a.value === "string" || typeof a.value === "number")
        )
        .map((a) => ({ trait: a.trait_type, value: String(a.value) }))
}

function traitValue(attributes, trait) {
    const match = attributes.find((a) => a.trait.toLowerCase() === trait)
    return match?.value || null
}

function describeNft(attributes, collectionName) {
    const model = traitValue(attributes, "model")
    const backdrop = traitValue(attributes, "backdrop")
    if (model && backdrop) return `${model} on ${backdrop}`
    return (
        model ||
        backdrop ||
        COLLECTION_LABELS[collectionName] ||
        collectionName ||
        null
    )
}

function publicLink(name, image) {
    if (name.startsWith("@")) return `https://t.me/${name.slice(1)}`
    const gift = /^(.+?)\s+#(\d+)$/.exec(name)
    if (gift) {
        return `https://t.me/nft/${gift[1].replace(/\s+/g, "")}-${gift[2]}`
    }
    const slug = /nft\.fragment\.com\/(gift|username|number)\/([\w-]+)\./.exec(
        image || ""
    )
    return slug ? `https://fragment.com/${slug[1]}/${slug[2]}` : null
}

export function mapNft(item, response) {
    const info = tokenInfo(response, item.address)
    const extra = info.extra || {}
    const collection = tokenInfo(response, item.collection_address)
    const attributes = mapAttributes(extra.attributes)
    const name = info.name || "Untitled"
    const friendly = friendlyAddress(response, item.address)
    return {
        id: rawKey(item.address),
        name,
        caption: describeNft(attributes, collection.name),
        image: extra._image_small || info.image,
        preview: extra._image_medium || extra._image_big || info.image,
        attributes,
        description: info.description || null,
        collectionName: collection.name || null,
        ownerAddress: rawKey(item.owner_address),
        domain: extra.domain || null,
        address: friendly,
        shortAddress: shortenFriendly(friendly),
        link: publicLink(name, info.image),
        isWearable: attributes.length > 0,
    }
}

export function mapNftHistory(response, ownerAddress) {
    const transfers = response.nft_transfers || []
    const received = transfers.find(
        (t) => rawKey(t.new_owner) === rawKey(ownerAddress)
    )
    const sender = received?.old_owner
    const entry = sender ? response.address_book?.[rawKey(sender)] : null
    return {
        from: entry?.domain || shortenFriendly(entry?.user_friendly) || null,
        since: received ? formatDate(received.transaction_now) : null,
    }
}

export function mapMintDate(response) {
    const deploy = response.transactions?.[0]
    return deploy ? formatDate(deploy.now) : null
}
