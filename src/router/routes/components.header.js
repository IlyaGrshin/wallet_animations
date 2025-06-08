import { createRoute } from "@tanstack/react-router"
import { Route as rootRoute } from "./__root"
import NavigationBar from "../../pages/components/NavigationBar"

export const Route = createRoute({
    getParentRoute: () => rootRoute,
    path: "/components/header",
    component: NavigationBar,
})
