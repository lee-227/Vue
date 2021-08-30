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
    initComputed(vm, opts.computed)
  }
  if (opts.watch) {
    initWatch(vm, opts.watch)
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
    },
  })
}

function initWatch(vm, watch) {
  for (const key in watch) {
    let handler = watch[key]
    if (Array.isArray(handler)) {
      handler.forEach((h) => {
        createWatcher(vm, key, h)
      })
    } else {
      createWatcher(vm, key, handler)
    }
  }
}
function createWatcher(vm, exprOrFn, handler, options) {
  if (typeof handler === 'object' && handler !== null) {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(exprOrFn, handler, options)
}

function initComputed(vm, computed) {
  // 存放计算属性的watcher
  const watchers = (vm._computedWatchers = {})
  for (const key in computed) {
    const userDef = computed[key]
    // 创建计算属性watcher
    watchers[key] = new Watcher(vm, userDef, () => {}, { lazy: true })
    defineComputed(vm, key, userDef)
  }
}
function defineComputed(target, key, userDef) {
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = createComputedGetter(key)
  } else {
    sharedPropertyDefinition.get = createComputedGetter(userDef.get)
    sharedPropertyDefinition.set = userDef.set
  }
  // 使用defineProperty定义
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
function createComputedGetter(key) {
  return function computedGetter() {
    const watcher = this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        // 如果dirty为true
        watcher.evaluate() // 计算出新值，并将dirty 更新为false
      }
      if (Dep.target) {
        // 计算属性在模板中使用 则存在Dep.target
        watcher.depend()
      }
      // 如果依赖的值不发生变化，则返回上次计算的结果
      return watcher.value
    }
  }
}
