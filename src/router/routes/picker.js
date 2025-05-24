import { createRoute } from "@tanstack/react-router"
import { Route as rootRoute } from "./__root"
import Picker from "../../pages/prototypes/Picker"

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/picker",
  component: Picker,
})
