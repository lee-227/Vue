let callbacks = []
let waiting = false
function flushCallbacks() {
  callbacks.forEach((cb) => cb())
  waiting = false
  callbacks = []
}
export function nextTick(cb) {
  callbacks.push(cb)
  if (!waiting) {
    waiting = true
    Promise.resolve().then(flushCallbacks)
  }
}
const strats = {}
const LIFECYCLE_HOOKS = ['beforeCreate', 'created', 'beforeMount', 'mounted']
LIFECYCLE_HOOKS.forEach((hook) => {
  strats[hook] = mergeHook
})
function mergeHook(parentVal, childVal) {
  if (childVal) {
    if (parentVal) {
      return parentVal.concat(childVal)
    } else {
      return [childVal]
    }
  } else {
    return parentVal
  }
}
strats.components = function (parent, child) {
  const res = Object.create(parent)
  if (child) {
    for (const key in child) {
      res[key] = child[key]
    }
  }
  return res
}
export function mergeOptions(parent, child) {
  const options = {}
  for (const key in parent) {
    mergeField(key)
  }
  for (const key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key)
    }
  }
  function mergeField(key) {
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key])
      return
    }
    if (isObject(parent[key]) && isObject(child[key])) {
      options[key] = [...parent[key], ...child[key]]
    } else {
      if (child[key]) {
        options[key] = child[key]
      } else {
        options[key] = parent[key]
      }
    }
  }
  return options
}
export function isObject(val) {
  return typeof val === 'object' && val !== null
}
export const isReservedTag = makeUp('a,p,div,ul,li,span,input,button')
function makeUp(str) {
  const map = {}
  str.split(',').forEach((tagName) => {
    map[tagName] = true
  })
  return (tag) => map[tag] || false
}
