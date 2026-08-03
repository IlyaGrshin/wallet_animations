import WebApp from "./webApp"
import { isTelegram } from "./env"

const SHARE_MESSAGE_VERSION = "8.0"

export const canShareMessage = () =>
    isTelegram() && WebApp.isVersionAtLeast(SHARE_MESSAGE_VERSION)

export function shareMessage(preparedMessageId) {
    if (!canShareMessage()) return Promise.resolve(false)

    return new Promise((resolve, reject) => {
        try {
            WebApp.shareMessage(preparedMessageId, resolve)
        } catch (error) {
            reject(error)
        }
    })
}
