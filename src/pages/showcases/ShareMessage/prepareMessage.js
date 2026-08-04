import WebApp from "../../../lib/twa"

const SHARE_API = import.meta.env.VITE_SHARE_API_URL || "shareApi/"

export default async function prepareMessage(text) {
    const response = await fetch(SHARE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: WebApp.initData, text }),
    })

    const data = await response.json().catch(() => null)
    if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? `Request failed with ${response.status}`)
    }

    return { id: data.id, expiresAt: data.expires_at }
}
