import { createRoute } from "@tanstack/react-router"
import { Route as rootRoute } from "./__root"
import Onboarding from "../../pages/prototypes/Onboarding"

export const Route = createRoute({
    getParentRoute: () => rootRoute,
    path: "/onboarding",
    component: Onboarding,
})
