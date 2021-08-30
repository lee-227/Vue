import { initState } from './state'
import { complieToFunction } from './compiler/index'
import { callHook, mountComponent } from './lifecycle'
import { mergeOptions, nextTick } from './util'

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this
    vm.$options = mergeOptions(vm.constructor.options, options)
    callHook(vm, 'beforeCreate')
    initState(vm) // 初始化状态
    callHook(vm, 'created')
    if (vm.$options.el) {
      // 挂载页面
      vm.$mount(vm.$options.el)
    }
  }
  Vue.prototype.$nextTick = nextTick
  Vue.prototype.$mount = function (el) {
    el = document.querySelector(el)
    const vm = this
    vm.$el = el
    const options = vm.$options
    // 没有 render 方法 找 template
    if (!options.render) {
      let template = options.template
      if (!template && el) {
        // 没有 template 找 el 将 el 当做 template
        template = el.outerHTML
      }
      // 将 template 编译成 render 函数
      const render = complieToFunction(template)
      options.render = render
    }
    mountComponent(vm, el) // 有了渲染函数之后创建渲染 watcher
  }
  Vue.prototype.$watch = function (exprOrFn, cb, options = {}) {
    options.user = true // 标记为用户watcher
    // 核心就是创建个watcher
    const watcher = new Watcher(this, exprOrFn, cb, options)
    if (options.immediate) {
      cb.call(vm, watcher.value)
    }
  }
}
