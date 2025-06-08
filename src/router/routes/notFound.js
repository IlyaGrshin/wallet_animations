import { createRoute, redirect } from "@tanstack/react-router"
import { Route as rootRoute } from "./__root"

export const Route = createRoute({
    getParentRoute: () => rootRoute,
    path: "*",
    beforeLoad: () => {
        throw redirect({ to: "/" })
    },
})
