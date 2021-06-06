import { createText, createElement } from './vdom/index'

export function renderMixin(Vue) {
  Vue.prototype._c = function (...args) {
    return createElement(this, ...args)
  }
  Vue.prototype._v = function (text) {
    // 创建文本的虚拟节点
    return createText(this, text)
  }
  Vue.prototype._s = function (val) {
    // 转化成字符串
    return val == null ? '' : typeof val == 'object' ? JSON.stringify(val) : val
  }
  Vue.prototype._render = function () {
    const vm = this
    let render = vm.$options.render
    let vnode = render.call(this)
    return vnode
  }
}
