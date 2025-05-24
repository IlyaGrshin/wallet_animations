import { createRoute } from "@tanstack/react-router"
import { Route as rootRoute } from "./__root"
import TONSpace from "../../pages/prototypes/TS"

export const Route = createRoute({
    getParentRoute: () => rootRoute,
    path: "/tonspace",
    component: TONSpace,
})
