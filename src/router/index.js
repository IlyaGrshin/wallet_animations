import { createRouter } from "@tanstack/react-router"
import { createHashHistory } from "@tanstack/history"
import { performViewTransition } from "../utils/viewTransition"

// Импортируем все маршруты
import { Route as rootRoute } from "./routes/__root"
import { Route as indexRoute } from "./routes/index"
import { Route as walletRoute } from "./routes/wallet"
import { Route as tonspaceRoute } from "./routes/tonspace"
import { Route as onboardingRoute } from "./routes/onboarding"
import { Route as newnavigationRoute } from "./routes/newnavigation"
import { Route as colorchangingRoute } from "./routes/colorchanging"
import { Route as textpageRoute } from "./routes/textpage"
import { Route as tabbarRoute } from "./routes/tabbar"
import { Route as pickerRoute } from "./routes/picker"
import { Route as modalpagesRoute } from "./routes/modalpages"
import { Route as colorassetpageRoute } from "./routes/colorassetpage"
import { Route as componentsHeaderRoute } from "./routes/components.header"

// Создаем дерево маршрутов
const routeTree = rootRoute.addChildren([
    indexRoute,
    walletRoute,
    tonspaceRoute,
    onboardingRoute,
    newnavigationRoute,
    colorchangingRoute,
    textpageRoute,
    tabbarRoute,
    pickerRoute,
    modalpagesRoute,
    colorassetpageRoute,
    componentsHeaderRoute,
])

// Создаем hash-based history
const hashHistory = createHashHistory()

// Создаем роутер с ViewTransition middleware
export const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    history: hashHistory,
})

// Добавляем обработчик для ViewTransition
router.subscribe("onBeforeLoad", async ({ fromLocation, toLocation, cause }) => {
    // Применяем ViewTransition только для навигационных переходов между разными маршрутами
    if (
        cause === "push" &&
        fromLocation?.pathname !== toLocation.pathname &&
        typeof document !== "undefined" &&
        "startViewTransition" in document
    ) {
        return new Promise((resolve) => {
            const transition = document.startViewTransition(() => {
                resolve()
            })
            transition.finished.catch(() => resolve())
        })
    }
})
