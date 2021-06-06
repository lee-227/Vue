import { isObject, isReservedTag } from '../util'

export function createElement(vm, tag, data = {}, ...children) {
  if (isReservedTag(tag)) {
    // 生成普通元素的虚拟 dom
    return vnode(vm, tag, data, data.key, children, undefined)
  } else {
    // 生成 component 虚拟 dom
    const Ctor = vm.$options.components[tag] // 根据 tag 跟 options 拿到对应的组件对象
    return createComponent(vm, tag, data, data.key, children, Ctor)
  }
}
function createComponent(vm, tag, data, key, children, Ctor) {
  if (isObject(Ctor)) {
    Ctor = vm.$options._base.extend(Ctor)
    // 将组件对象 通过 extend 方法转换成组件构造函数
  }
  // 添加 init 钩子 在生成组件真实 dom 时会调用 init 钩子挂载组件
  data.hook = {
    init(vnode) {
      // 该方法主要是给虚拟 dom 添加了componentInstance属性 标记它为组件虚拟 dom
      let child = (vnode.componentInstance = new vnode.componentsOptions.Ctor(
        {}
      ))
      child.$mount()
    }
  }
  return vnode(
    vm,
    `vue-component-${Ctor.cid}-${tag}`,
    data,
    key,
    undefined,
    undefined,
    { Ctor }
  )
}
export function createText(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text)
}
function vnode(vm, tag, data, key, children, text, componentsOptions) {
  return {
    vm,
    tag,
    data,
    key,
    children,
    text,
    componentsOptions
  }
}
export function isSameVnode(oldVnode, newVNode) {
  return oldVnode.tag === newVNode.tag && oldVnode.key === newVNode.key
}
