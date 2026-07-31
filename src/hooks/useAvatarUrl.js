import WebApp from "../lib/twa"
import DefaultAvatar from "../icons/avatars/IlyaG.jpg"

export function useAvatarUrl() {
    try {
        const user = new URLSearchParams(WebApp.initData).get("user")

        return (user && JSON.parse(user).photo_url) || DefaultAvatar
    } catch {
        return DefaultAvatar
    }
}

export default useAvatarUrl
