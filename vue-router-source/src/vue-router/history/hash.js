import History from './base'
function ensureSlash() {
  if (window.location.hash) {
    return
  }
  window.location.hash = '/'
}
function getHash() {
  return window.location.hash.slice(1)
}
export default class HashHistory extends History {
  constructor(router) {
    super(router)
    ensureSlash()
  }
  setupListener() {
    window.addEventListener('hashchange', () => {
      this.transitionTo(getHash())
    })
  }
  getCurrentLocation() {
    return getHash()
  }
  push(location) {
    window.location.hash = location
  }
}
