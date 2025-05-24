import { createRoute } from "@tanstack/react-router"
import { Route as rootRoute } from "./__root"
import ModalPages from "../../pages/prototypes/ModalPages"

export const Route = createRoute({
    getParentRoute: () => rootRoute,
    path: "/modalpages",
    component: ModalPages,
})
