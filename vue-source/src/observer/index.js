import arrayMethods from './array'
import { Dep } from './dep'

class Observer {
  constructor(data) {
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false,
      configurable: false,
    })
    this.dep = new Dep()
    if (Array.isArray(data)) {
      Object.setPrototypeOf(data, arrayMethods)
      this.observeArray(data)
    } else {
      this.walk(data)
    }
  }
  observeArray(data) {
    data.forEach((item) => {
      observe(item)
    })
  }
  walk(data) {
    Object.keys(data).forEach((key) => {
      defineReactive(data, key, data[key])
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
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
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
    },
  })
}
export function observe(data) {
  if (typeof data !== 'object' || data === null) return
  if (data.__ob__) return
  return new Observer(data)
}
