import { isSameVnode } from './index'
export function patch(oldVnode, vnode) {
  if (!oldVnode) {
    return createElm(vnode)
  }
  const isRealElement = oldVnode.nodeType
  if (isRealElement) {
    const oldElm = oldVnode
    const parentElm = oldVnode.parentNode
    let el = createElm(vnode)
    parentElm.insertBefore(el, oldElm.nextSibling)
    parentElm.removeChild(oldElm)
    return el
  } else {
    debugger
    if (oldVnode.tag !== vnode.tag) {
      return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el)
    }
    if (!oldVnode.tag) {
      if (oldVnode.text !== vnode.text) {
        return (oldVnode.el.textContent = vnode.text)
      }
    }
    let el = (vnode.el = oldVnode.el)
    updateProperties(vnode, oldVnode.data)
    let oldChildren = oldVnode.children || []
    let newChildren = vnode.children || []
    if (oldChildren.length > 0 && newChildren.length > 0) {
      updateChildren(el, oldChildren, newChildren)
    } else if (oldChildren.length > 0) {
      el.innerHTML = ''
    } else if (newChildren.length > 0) {
      newChildren.forEach((node) => {
        el.appendChild(createElm(node))
      })
    }
  }
}
function updateChildren(parent, oldChildren, newChildren) {
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
      patch(oldStartVnode, newStartVnode)
      oldStartVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      patch(oldEndVnode, newEndVnode)
      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      patch(oldStartVnode, newEndVnode)
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      patch(oldEndVnode, newStartVnode)
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else { 
      let moveIndex = map[newStartVnode.key]
      if (moveIndex === undefined) {
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      } else {
        let moveNode = oldChildren[moveIndex]
        oldChildren[moveIndex] = undefined
        patch(newStartVnode, moveNode)
        parent.insertBefore(moveNode.el, oldStartVnode.el)
      }
      newStartVnode = newChildren[++newEndIndex]
    }
  }
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      let nextElm =
        newChildren[newEndIndex + 1] == null
          ? null
          : newChildren[newEndIndex + 1].el
      parent.insertBefore(createElm(newChildren[i]), nextElm)
    }
  }
  if (oldStartIndex <= oldEndIndex) {
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
  if ((i = i.hook) && (i = i.init)) {
    i(vnode)
  }
  if (vnode.componentInstance) {
    return true
  }
  return false
}
function createElm(vnode) {
  let { tag, children, data, key, text, vm } = vnode
  if (typeof tag === 'string') {
    if (createComponent(vnode)) {
      return vnode.componentInstance.$el
    }
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
