import WebApp from "./webApp"

export default function isTelegram() {
    return !!WebApp?.platform && WebApp.platform !== "unknown"
}
