import { createRoute } from "@tanstack/react-router"
import { Route as rootRoute } from "./__root"
import TabBar from "../../pages/prototypes/TabBar"

export const Route = createRoute({
    getParentRoute: () => rootRoute,
    path: "/tabbar",
    component: TabBar,
})
