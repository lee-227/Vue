import { nextTick } from '../util'

let queue = []
let has = {}
let pending = false
// 异步情况队列
function flushSchedularQueue() {
  queue.forEach((watcher) => watcher.run())
  has = {}
  queue = []
  pending = false
}
export function queueWatcher(watcher) {
  let id = watcher.id
  // 在一次更新中 只执行一次watcher
  if (!has[id]) {
    has[id] = true
    queue.push(watcher)
    if (!pending) {
      pending = true
      nextTick(flushSchedularQueue)
    }
  }
}
