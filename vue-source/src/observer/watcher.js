import { pushTarget, popTarget } from './dep'
import { queueWatcher } from './schedular'

let id = 0
class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm
    this.cb = cb
    this.options = options
    this.id = id++
    this.getter = exprOrFn
    this.depsId = new Set()
    this.deps = []
    this.get()
  }
  get() {
    // 依赖收集 将 watcher 添加到 Dep.target 上 然后触发取值操作，让属性进行依赖收集 收集当前 watcher
    pushTarget(this)
    this.getter()
    popTarget()
  }
  addDep(dep) {
    let id = dep.id
    if (!this.depsId.has(id)) {
      this.deps.push(dep)
      this.depsId.add(id)
      dep.addSub(this)
    }
  }
  run() {
    this.get()
  }
  update() {
    // 通过队列异步更新 提高性能
    queueWatcher(this)
  }
}
export default Watcher
