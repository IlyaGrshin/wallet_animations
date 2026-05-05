import WebApp from "./webApp"

export default function getUser() {
    return WebApp?.initDataUnsafe?.user
}
