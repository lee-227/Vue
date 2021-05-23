import { install } from './install'
import { createMatcher } from './createMatcher'
import HashHistory from './history/hash'
import BrowserHistory from './history/history'
export default class VueRouter {
  constructor(options) {
    this.matcher = createMatcher(options.routes || [])
    this.beforeEachHooks = []
    switch (options.mode) {
      case 'hash':
        this.history = new HashHistory(this)
        break
      case 'history':
        this.history = new BrowserHistory(this)
        break
    }
  }
  match(location) {
    return this.matcher.match(location)
  }
  push(location) {
    return this.history.push(location)
  }
  beforeEach(fn) {
    this.beforeEachHooks.push(fn)
  }
  init(app) {
    const history = this.history
    const setupListener = () => {
      history.setupListener()
    }
    history.transitionTo(history.getCurrentLocation(), setupListener)
    history.listen((route) => {
      app._route = route
    })
  }
}
VueRouter.install = install
