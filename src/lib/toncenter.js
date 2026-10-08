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

export function getAccountState(address) {
    return get(`/accountStates?address=${encodeURIComponent(address)}`)
}

export function getActions(address, types, limit = 20, offset = 0) {
    const account = encodeURIComponent(address)
    const filter = types.map((type) => `&action_type=${type}`).join("")
    return get(
        `/actions?account=${account}${filter}&limit=${limit}&offset=${offset}&sort=desc`
    )
}

export function getOwnedNfts(owner, limit = 1000) {
    const account = encodeURIComponent(owner)
    return get(`/nft/items?owner_address=${account}&limit=${limit}`)
}

export function getNftTransfers(address, limit = 50) {
    const item = encodeURIComponent(address)
    return get(`/nft/transfers?item_address=${item}&limit=${limit}&sort=desc`)
}

export function getDeployTransaction(address) {
    const account = encodeURIComponent(address)
    return get(`/transactions?account=${account}&sort=asc&limit=1`)
}
