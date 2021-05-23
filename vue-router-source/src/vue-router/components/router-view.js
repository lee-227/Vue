export default {
  functional: true,
  name: 'router-view',
  render(h, { data, parent }) {
    let route = parent.$route
    let depth = 0
    let records = route.matched
    data.routerView = true
    while (parent) {
      if (parent.$vnode && parent.$vnode.data.routerView) {
        depth++
      }
      parent = parent.$parent
    }
    let record = records[depth]
    if (!record) return h()
    return h(record.component, data)
  },
}
