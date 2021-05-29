import { initGlobalApi } from './global-api/index.js'
import { initMixin } from './init'
import { lifecycleMinxin } from './lifecycle'
import { renderMixin } from './render'

function Vue(options) {
  this._init(options) // initMixin 给原型新增 init 方法
}
initMixin(Vue)
lifecycleMinxin(Vue)
renderMixin(Vue)
initGlobalApi(Vue)
export default Vue
