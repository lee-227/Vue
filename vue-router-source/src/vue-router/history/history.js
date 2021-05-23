import History from './base'

export default class BrowserHistory extends History {
  constructor(router) {
    super(router)
  }
  getCurrentLocation() {
    return window.location.pathname
  }
  setupListener() {
    window.addEventListener('popstate', () => {
      this.transitionTo(this.getCurrentLocation())
    })
  }
  push(location) {
    this.transitionTo(location, () => {
      window.history.pushState({}, null, location)
    })
  }
}
