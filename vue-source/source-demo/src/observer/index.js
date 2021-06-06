import arrayMethods from './array'
import { Dep } from './dep'

class Observer {
  constructor(data) {
    // 给对象添加了__ob__属性 标记该对象已经劫持过了
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false,
      configurable: false
    })
    this.dep = new Dep()
    if (Array.isArray(data)) {
      // 数组的属性劫持 重写了数组方法
      Object.setPrototypeOf(data, arrayMethods)
      this.observeArray(data)
    } else {
      this.walk(data) // 遍历劫持每个属性
    }
  }
  observeArray(data) {
    data.forEach((item) => {
      observe(item)
    })
  }
  walk(data) {
    Object.keys(data).forEach((key) => {
      defineReactive(data, key, data[key]) // 最终进行属劫持的方法
    })
  }
}
function dependArray(value) {
  value.forEach((item) => {
    item.__ob__ && item.__ob__.dep.depend()
    if (Array.isArray(item)) dependArray(item)
  })
}
export function defineReactive(data, key, value) {
  let dep = new Dep()
  let childOb = observe(value)
  Object.defineProperty(data, key, {
    get() {
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend() // 收集数组依赖 当我们调用数组方法修改数组成员时 该key也应该被更新 所以需要收集数组依赖
          if (Array.isArray(value)) {
            dependArray(value) // 递归收集数组依赖
          }
        }
      }
      return value
    },
    set(newValue) {
      if (newValue === value) return
      observe(newValue)
      value = newValue
      dep.notify()
    }
  })
}
export function observe(data) {
  if (typeof data !== 'object' || data === null) return
  if (data.__ob__) return
  return new Observer(data)
}
