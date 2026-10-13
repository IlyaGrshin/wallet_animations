import { usePlatform } from "../lib/platform"
import DefaultAvatar from "../icons/avatars/IlyaG.jpg"

export function useAvatarUrl() {
    const { getUser } = usePlatform()
    return getUser()?.photo_url || DefaultAvatar
}

export default useAvatarUrl
