import { observe } from './observer/index.js'
export function initState(vm) {
  const options = vm.$options
  if (options.data) {
    initData(vm)
  }
}
function initData(vm) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      proxy(vm, '_data', key)
    }
  }
  observe(data)
}
function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key]
    },
    set(val) {
      vm[source][key] = val
    },
  })
}
