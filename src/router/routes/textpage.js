import { createRoute } from "@tanstack/react-router"
import { Route as rootRoute } from "./__root"
import TextPage from "../../pages/prototypes/TextPage"

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/textpage",
  component: TextPage,
})
