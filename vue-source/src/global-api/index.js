import { mergeOptions } from '../util'

export function initGlobalApi(Vue) {
  Vue.options = {}
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
  Vue.options._base = Vue
  Vue.options.components = {}
  Vue.component = function (id, defintion) {
    defintion.name = defintion.name || id
    defintion = this.options._base.extend(defintion)
    this.options.components[id] = defintion
  }
  let cid = 0
  Vue.extend = function (options) {
    const Super = this
    const Sub = function VueComponent(options) {
      this._init(options)
    }
    Sub.cid = cid++
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.component = Super.component
    Sub.options = mergeOptions(Super.options, options)
    return Sub
  }
}
