import { cachedRequest, readJson } from "./requestCache"

const BASE = "https://toncenter.com/api/v3"
const KEY = import.meta.env.VITE_TONCENTER_KEY

function get(path) {
    const label = `toncenter ${path}`
    return cachedRequest(label, async () => {
        const res = await fetch(`${BASE}${path}`, {
            headers: KEY ? { "X-API-Key": KEY } : undefined,
        })
        return readJson(res, label)
    })
}

export function getOwnedNfts(owner, limit = 1000) {
    const account = encodeURIComponent(owner)
    return get(`/nft/items?owner_address=${account}&limit=${limit}`)
}

const NFT_BATCH_SIZE = 50

function getNftBatch(addresses) {
    const query = addresses
        .map((address) => `address=${encodeURIComponent(address)}`)
        .join("&")
    return get(`/nft/items?${query}&limit=${addresses.length}`)
}

function mergeNftPages(acc, page) {
    return {
        nft_items: [...acc.nft_items, ...(page.nft_items || [])],
        address_book: { ...acc.address_book, ...page.address_book },
        metadata: { ...acc.metadata, ...page.metadata },
    }
}

export async function getNftsByAddress(addresses) {
    const batches = []
    for (let i = 0; i < addresses.length; i += NFT_BATCH_SIZE) {
        batches.push(addresses.slice(i, i + NFT_BATCH_SIZE))
    }
    const pages = await Promise.all(batches.map(getNftBatch))
    return pages.reduce(mergeNftPages, {
        nft_items: [],
        address_book: {},
        metadata: {},
    })
}

export function getNftTransfers(address, limit = 50) {
    const item = encodeURIComponent(address)
    return get(`/nft/transfers?item_address=${item}&limit=${limit}&sort=desc`)
}

export function getDeployTransaction(address) {
    const account = encodeURIComponent(address)
    return get(`/transactions?account=${account}&sort=asc&limit=1`)
}
