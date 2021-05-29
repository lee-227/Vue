let oldArrayMethods = Array.prototype
let arrayMethods = Object.create(oldArrayMethods)
let methods = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice']
methods.forEach((method) => {
  arrayMethods[method] = function (...args) {
    let res = oldArrayMethods[method].call(this, ...args)
    let inserted
    let ob = this.__ob__
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
      default:
        break
    }
    if (inserted) ob.observeArray(inserted) // 对新增的每一项进行数据劫持
    ob.dep.notify()
    return res
  }
})
export default arrayMethods
