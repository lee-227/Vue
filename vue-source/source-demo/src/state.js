import { observe } from './observer/index.js'
export function initState(vm) {
  // 根据不同属性调用不同方法进行初始化
  const opts = vm.$options
  if (opts.props) {
    initProps(vm)
  }
  if (opts.methods) {
    initMethod(vm)
  }
  if (opts.data) {
    // 初始化data
    initData(vm)
  }
  if (opts.computed) {
    initComputed(vm)
  }
  if (opts.watch) {
    initWatch(vm)
  }
}
function initData(vm) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      proxy(vm, '_data', key) // 将 data 中的属性 通过 proxy 代理到 vm 实例上
    }
  }
  observe(data) // observe 属性劫持 data
}
function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key]
    },
    set(val) {
      vm[source][key] = val
    }
  })
}
