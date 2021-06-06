import { isSameVnode } from './index'
export function patch(oldVnode, vnode) {
  if (!oldVnode) {
    return createElm(vnode)
  }
  const isRealElement = oldVnode.nodeType
  if (isRealElement) {
    // oldVnode 为真实元素 说明时第一次挂载
    const oldElm = oldVnode
    const parentElm = oldVnode.parentNode
    let el = createElm(vnode) // 根据 vnode 生成真实 dom 进行挂载操作
    parentElm.insertBefore(el, oldElm.nextSibling)
    parentElm.removeChild(oldElm)
    return el
  } else {
    // domdiff
    if (oldVnode.tag !== vnode.tag) {
      // 标签不一致 不能复用将老节点替换为新节点
      return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
    }
    if (!oldVnode.tag) {
      if (oldVnode.text !== vnode.text) {
        // 老节点是文本节点 且 与新节点文本不一致 替换文本
        return (oldVnode.el.textContent = vnode.text)
      }
    }
    let el = (vnode.el = oldVnode.el)
    updateProperties(vnode, oldVnode.data) // 更新dom属性
    let oldChildren = oldVnode.children || []
    let newChildren = vnode.children || []
    if (oldChildren.length > 0 && newChildren.length > 0) {
      // 都有儿子节点 更新儿子节点
      updateChildren(el, oldChildren, newChildren)
    } else if (oldChildren.length > 0) {
      // 老节点没有子节点 新节点有 老节点innerHTML清空
      el.innerHTML = ''
    } else if (newChildren.length > 0) {
      // 老节点没有子节点 新节点有 创建新节点 插入
      newChildren.forEach((node) => {
        el.appendChild(createElm(node))
      })
    }
  }
}
function updateChildren(parent, oldChildren, newChildren) {
  // 双指针
  let oldStartIndex = 0
  let oldStartVnode = oldChildren[0]
  let oldEndIndex = oldChildren.length - 1
  let oldEndVnode = oldChildren[oldEndIndex]

  let newStartIndex = 0
  let newStartVnode = newChildren[0]
  let newEndIndex = newChildren.length - 1
  let newEndVnode = newChildren[newEndIndex]
  function makeIndexByKey(oldChildren) {
    let map = {}
    oldChildren.forEach((node, index) => {
      map[node.key] = index
    })
    return map
  }
  let map = makeIndexByKey(oldChildren)
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {
      oldStartVnode = oldChildren[++oldStartIndex]
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex]
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {
      // 头跟头比较
      patch(oldStartVnode, newStartVnode)
      oldStartVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      // 尾跟尾比较
      patch(oldEndVnode, newEndVnode)
      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      // 旧头跟新尾比较
      patch(oldStartVnode, newEndVnode)
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      // 新头旧尾比较
      patch(oldEndVnode, newStartVnode)
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else {
      // 都不符合优化方案 暴力比较
      // 根据剩余老节点 创建key跟index形式，快速找到可服用的老节点
      let moveIndex = map[newStartVnode.key]
      if (moveIndex === undefined) {
        // 没有可服用老节点 创建新节点 插入到旧的头指针节点之前
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      } else {
        // 有可服用老节点 移动该节点到旧的头指针节点之前
        let moveNode = oldChildren[moveIndex]
        oldChildren[moveIndex] = undefined
        patch(newStartVnode, moveNode)
        parent.insertBefore(moveNode.el, oldStartVnode.el)
      }
      newStartVnode = newChildren[++newEndIndex]
    }
  }
  if (newStartIndex <= newEndIndex) {
    // 新节点没有遍历完 说明剩余为新节点 创建新节点 插入到新节点尾指针的下一个节点之前
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      let nextElm =
        newChildren[newEndIndex + 1] == null
          ? null
          : newChildren[newEndIndex + 1].el
      parent.insertBefore(createElm(newChildren[i]), nextElm)
    }
  }
  if (oldStartIndex <= oldEndIndex) {
    // 老节点没有遍历完 删除老节点
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      let child = oldChildren[i]
      if (child !== undefined) {
        parent.removeChild(child.el)
      }
    }
  }
}
function createComponent(vnode) {
  let i = vnode.data
  // 调用组件虚拟 dom init 钩子挂载子组件
  if ((i = i.hook) && (i = i.init)) {
    i(vnode)
  }
  // init 方法会在虚拟 dom 上添加 componentInstance 属性，存在该属性标名该虚拟 dom 为组件节点
  if (vnode.componentInstance) {
    return true
  }
  return false
}
function createElm(vnode) {
  let { tag, children, data, key, text, vm } = vnode
  if (typeof tag === 'string') {
    if (createComponent(vnode)) {
      // 创建组件节点
      return vnode.componentInstance.$el
    }
    // 创建元素节点
    vnode.el = document.createElement(tag)
    updateProperties(vnode)
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child))
    })
  } else {
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}
// 更新节点属性
function updateProperties(vnode, oldProps = {}) {
  let newProps = vnode.data || {}
  let el = vnode.el
  for (const key in oldProps) {
    if (!newProps[key]) {
      el.removeAttribute(key)
    }
  }
  let newStyle = newProps.style || {}
  let oldStyle = oldProps.style || {}
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = ''
    }
  }
  for (const key in newProps) {
    if (key === 'style') {
      for (const styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName]
      }
    } else if (key === 'class') {
      el.className = newProps.class
    } else {
      el.setAttribute(key, newProps[key])
    }
  }
}
