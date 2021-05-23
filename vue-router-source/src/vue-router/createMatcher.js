import { createRouteMap } from './createRouteMap'
import { createRoute } from './history/base'
export function createMatcher(routes) {
  let { pathMap } = createRouteMap(routes)
  function addRoutes(routes) {
    createRouteMap(routes, pathMap)
  }
  function match(path) {
    let record = pathMap[path]
    return createRoute(record, { path })
  }
  return {
    addRoutes,
    match,
  }
}
