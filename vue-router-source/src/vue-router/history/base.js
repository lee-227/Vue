export function createRoute(record, location) {
  let res = []
  if (record) {
    while (record) {
      res.unshift(record)
      record = record.parent
    }
  }
  return {
    ...location,
    matched: res
  }
}
function runQueue(queue, iterator, cb) {
  function next(i) {
    if (i >= queue.length) {
      return cb()
    } else {
      iterator(queue[i], () => {
        next(++i)
      })
    }
  }
  next(0)
}
export default class History {
  constructor(router) {
    this.router = router
    this.cb = null
    this.current = createRoute(null, { path: '/' })
  }
  transitionTo(location, onComplete) {
    let route = this.router.match(location)
    let queue = [].concat(this.router.beforeEachHooks)
    let iterator = (hook, cb) => {
      hook(this.current, route, cb)
    }
    runQueue(queue, iterator, () => {
      this.current = route
      this.cb && this.cb(route)
      onComplete && onComplete()
    })
  }
  listen(cb) {
    this.cb = cb
  }
}
