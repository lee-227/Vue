import { pushTarget, popTarget } from './dep'
import { queueWatcher } from './schedular'

let id = 0
class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm
    this.cb = cb
    this.options = options
    this.id = id++
    this.depsId = new Set()
    this.deps = []
    this.user = !!options.user
    this.lazy = !!options.lazy
    this.dirty = this.lazy
    if (typeof exprOrFn === 'function') {
      this.getter = exprOrFn
    } else {
      this.getter = function () {
        let path = exprOrFn.split('.')
        let obj = vm
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]]
        }
        return obj
      }
    }
    this.value = this.lazy ? undefined : this.get()
  }
  get() {
    // 依赖收集 将 watcher 添加到 Dep.target 上 然后触发取值操作，让属性进行依赖收集 收集当前 watcher
    pushTarget(this)
    const value = this.getter.call(this.vm)
    popTarget()
    return value
  }
  addDep(dep) {
    let id = dep.id
    if (!this.depsId.has(id)) {
      this.deps.push(dep)
      this.depsId.add(id)
      dep.addSub(this)
    }
  }
  depend() {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }
  run() {
    let value = this.get()
    let oldValue = this.value
    this.value = value
    if (this.user) {
      // 如果是用户watcher 则调用用户传入的callback
      this.cb.call(this.vm, value, oldValue)
    }
  }
  evaluate() {
    this.value = this.get()
    this.dirty = false
  }
  update() {
    if (this.lazy) {
      this.dirty = true
      return
    }
    // 通过队列异步更新 提高性能
    queueWatcher(this)
  }
}
export default Watcher
