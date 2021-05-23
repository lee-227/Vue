import { nextTick } from '../util'

let queue = []
let has = {}
let pending = false
function flushSchedularQueue() {
  queue.forEach((watcher) => watcher.run())
  has = {}
  queue = []
  pending = false
}
export function queueWatcher(watcher) {
  let id = watcher.id
  if (!has[id]) {
    has[id] = true
    queue.push(watcher)
    if (!pending) {
      pending = true
      nextTick(flushSchedularQueue)
    }
  }
}
