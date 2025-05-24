import { createRoute } from "@tanstack/react-router"
import { Route as rootRoute } from "./__root"
import NewNavigation from "../../pages/prototypes/NewNavigation"

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/newnavigation",
  component: NewNavigation,
})
