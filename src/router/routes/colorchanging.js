import { createRoute } from "@tanstack/react-router"
import { Route as rootRoute } from "./__root"
import ColorChanging from "../../pages/prototypes/ColorChanging"

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/colorchanging",
  component: ColorChanging,
})
