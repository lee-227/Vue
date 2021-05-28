import { Module } from './modules/module'
import { vnode, VNode } from './vnode'
import * as is from './is'
import { htmlDomApi, DOMAPI } from './htmldomapi'

type NonUndefined<T> = T extends undefined ? never : T

function isUndef(s: any): boolean {
  return s === undefined
}
function isDef<A>(s: A): s is NonUndefined<A> {
  return s !== undefined
}

type VNodeQueue = VNode[]

const emptyNode = vnode('', {}, [], undefined, undefined)

function sameVnode(vnode1: VNode, vnode2: VNode): boolean {
  const isSameKey = vnode1.key === vnode2.key
  const isSameIs = vnode1.data?.is === vnode2.data?.is
  const isSameSel = vnode1.sel === vnode2.sel

  return isSameSel && isSameKey && isSameIs
}

function isVnode(vnode: any): vnode is VNode {
  return vnode.sel !== undefined
}

type KeyToIndexMap = { [key: string]: number }

type ArraysOf<T> = {
  [K in keyof T]: Array<T[K]>
}

type ModuleHooks = ArraysOf<Required<Module>>

function createKeyToOldIdx(
  children: VNode[],
  beginIdx: number,
  endIdx: number
): KeyToIndexMap {
  const map: KeyToIndexMap = {}
  for (let i = beginIdx; i <= endIdx; ++i) {
    const key = children[i]?.key
    if (key !== undefined) {
      map[key as string] = i
    }
  }
  return map
}

const hooks: Array<keyof Module> = [
  'create',
  'update',
  'remove',
  'destroy',
  'pre',
  'post'
]

export function init(modules: Array<Partial<Module>>, domApi?: DOMAPI) {
  let i: number
  let j: number
  const cbs: ModuleHooks = {
    create: [],
    update: [],
    remove: [],
    destroy: [],
    pre: [],
    post: []
  }

  // 初始化 dom 操作为 html dom 操作
  const api: DOMAPI = domApi !== undefined ? domApi : htmlDomApi

  // 注册模块中的钩子函数
  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      const hook = modules[j][hooks[i]]
      if (hook !== undefined) {
        ;(cbs[hooks[i]] as any[]).push(hook)
      }
    }
  }

  function emptyNodeAt(elm: Element) {
    const id = elm.id ? '#' + elm.id : ''

    // elm.className doesn't return a string when elm is an SVG element inside a shadowRoot.
    // https://stackoverflow.com/questions/29454340/detecting-classname-of-svganimatedstring
    const classes = elm.getAttribute('class')

    const c = classes ? '.' + classes.split(' ').join('.') : ''
    return vnode(
      api.tagName(elm).toLowerCase() + id + c,
      {},
      [],
      undefined,
      elm
    )
  }

  function createRmCb(childElm: Node, listeners: number) {
    return function rmCb() {
      if (--listeners === 0) {
        const parent = api.parentNode(childElm) as Node
        api.removeChild(parent, childElm)
      }
    }
  }
  // 根据虚拟 dom 生成真实节点并保存到 vnode 的 elm 属性上
  function createElm(vnode: VNode, insertedVnodeQueue: VNodeQueue): Node {
    let i: any
    let data = vnode.data
    if (data !== undefined) {
      // 触发 init 钩子
      const init = data.hook?.init
      if (isDef(init)) {
        init(vnode)
        data = vnode.data
      }
    }
    const children = vnode.children
    const sel = vnode.sel
    if (sel === '!') {
      if (isUndef(vnode.text)) {
        vnode.text = ''
      }
      // 传入！ 生成注释节点
      vnode.elm = api.createComment(vnode.text!)
    } else if (sel !== undefined) {
      // Parse selector
      // 根据 sel 生成 id 跟 class
      const hashIdx = sel.indexOf('#')
      const dotIdx = sel.indexOf('.', hashIdx)
      const hash = hashIdx > 0 ? hashIdx : sel.length
      const dot = dotIdx > 0 ? dotIdx : sel.length
      const tag =
        hashIdx !== -1 || dotIdx !== -1
          ? sel.slice(0, Math.min(hash, dot))
          : sel
      // 生成真实 dom
      const elm = (vnode.elm =
        isDef(data) && isDef((i = data.ns))
          ? api.createElementNS(i, tag, data)
          : api.createElement(tag, data))
      // 设置 dom id
      if (hash < dot) elm.setAttribute('id', sel.slice(hash + 1, dot))
      // 设置 dom class
      if (dotIdx > 0)
        elm.setAttribute('class', sel.slice(dot + 1).replace(/\./g, ' '))
      // dom 生成完毕 触发 create 钩子
      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode)
      // 递归生成子节点并挂载到该 dom 上
      if (is.array(children)) {
        for (i = 0; i < children.length; ++i) {
          const ch = children[i]
          if (ch != null) {
            api.appendChild(elm, createElm(ch as VNode, insertedVnodeQueue))
          }
        }
      } else if (is.primitive(vnode.text)) {
        // 文本节点
        api.appendChild(elm, api.createTextNode(vnode.text))
      }
      const hook = vnode.data!.hook
      if (isDef(hook)) {
        hook.create?.(emptyNode, vnode)
        if (hook.insert) {
          insertedVnodeQueue.push(vnode)
        }
      }
    } else {
      vnode.elm = api.createTextNode(vnode.text!)
    }
    return vnode.elm
  }

  function addVnodes(
    parentElm: Node,
    before: Node | null,
    vnodes: VNode[],
    startIdx: number,
    endIdx: number,
    insertedVnodeQueue: VNodeQueue
  ) {
    for (; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx]
      if (ch != null) {
        api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before)
      }
    }
  }

  function invokeDestroyHook(vnode: VNode) {
    const data = vnode.data
    if (data !== undefined) {
      data?.hook?.destroy?.(vnode)
      for (let i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode)
      if (vnode.children !== undefined) {
        for (let j = 0; j < vnode.children.length; ++j) {
          const child = vnode.children[j]
          if (child != null && typeof child !== 'string') {
            invokeDestroyHook(child)
          }
        }
      }
    }
  }

  function removeVnodes(
    parentElm: Node,
    vnodes: VNode[],
    startIdx: number,
    endIdx: number
  ): void {
    for (; startIdx <= endIdx; ++startIdx) {
      let listeners: number
      let rm: () => void
      const ch = vnodes[startIdx]
      if (ch != null) {
        if (isDef(ch.sel)) {
          // 执行所有的 destory 钩子
          invokeDestroyHook(ch)
          listeners = cbs.remove.length + 1
          rm = createRmCb(ch.elm!, listeners)
          for (let i = 0; i < cbs.remove.length; ++i) cbs.remove[i](ch, rm)
          const removeHook = ch?.data?.hook?.remove
          if (isDef(removeHook)) {
            removeHook(ch, rm)
          } else {
            rm()
          }
        } else {
          // Text node
          api.removeChild(parentElm, ch.elm!)
        }
      }
    }
  }
  // 双指针法
  function updateChildren(
    parentElm: Node,
    oldCh: VNode[],
    newCh: VNode[],
    insertedVnodeQueue: VNodeQueue
  ) {
    let oldStartIdx = 0
    let newStartIdx = 0
    let oldEndIdx = oldCh.length - 1
    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]
    let newEndIdx = newCh.length - 1
    let newStartVnode = newCh[0]
    let newEndVnode = newCh[newEndIdx]
    let oldKeyToIdx: KeyToIndexMap | undefined
    let idxInOld: number
    let elmToMove: VNode
    let before: any

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (oldStartVnode == null) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode might have been moved left
      } else if (oldEndVnode == null) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (newStartVnode == null) {
        newStartVnode = newCh[++newStartIdx]
      } else if (newEndVnode == null) {
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        // 首先 头跟头 比较
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        // 尾跟尾比较
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) {
        // Vnode moved right
        // 头跟尾比较
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
        // 一致的话 需要将老的节点移动到新节点处
        api.insertBefore(
          parentElm,
          oldStartVnode.elm!,
          api.nextSibling(oldEndVnode.elm!)
        )
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) {
        // Vnode moved left
        // 尾跟头比较
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
        // 需要将老节点移动到新节点之前
        api.insertBefore(parentElm, oldEndVnode.elm!, oldStartVnode.elm!)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        // 没用规律的儿子比对 从新节点开始遍历
        if (oldKeyToIdx === undefined) {
          // 创建 key 跟 index 的映射
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
        }
        // 通过新节点的 key 查看是否有可复用的 老节点
        idxInOld = oldKeyToIdx[newStartVnode.key as string]
        if (isUndef(idxInOld)) {
          // New element
          // 没用可复用的老节点 说明是新节点
          api.insertBefore(
            parentElm,
            createElm(newStartVnode, insertedVnodeQueue),
            oldStartVnode.elm!
          )
        } else {
          // 有可复用的老节点 需要将其移动到正确位置
          elmToMove = oldCh[idxInOld]
          if (elmToMove.sel !== newStartVnode.sel) {
            // 只有 key 对应 而标签不对应 无法复用
            api.insertBefore(
              parentElm,
              createElm(newStartVnode, insertedVnodeQueue),
              oldStartVnode.elm!
            )
          } else {
            // key 跟 标签都一致，可以复用
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue)
            oldCh[idxInOld] = undefined as any
            api.insertBefore(parentElm, elmToMove.elm!, oldStartVnode.elm!)
          }
        }
        newStartVnode = newCh[++newStartIdx]
      }
    }
    if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
      // 老节点没有遍历完 或者 子节点没用遍历完
      if (oldStartIdx > oldEndIdx) {
        // 新节点没有遍历完成，说明这些都是新增的节点
        before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm
        addVnodes(
          parentElm,
          before,
          newCh,
          newStartIdx,
          newEndIdx,
          insertedVnodeQueue
        )
      } else {
        // 老节点没用遍历完，说明这些老节点都要被删除
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
      }
    }
  }

  function patchVnode(
    oldVnode: VNode,
    vnode: VNode,
    insertedVnodeQueue: VNodeQueue
  ) {
    const hook = vnode.data?.hook
    // 执行 prepatch 钩子
    hook?.prepatch?.(oldVnode, vnode)
    // 复用就节点的 dom
    const elm = (vnode.elm = oldVnode.elm)!
    const oldCh = oldVnode.children as VNode[]
    const ch = vnode.children as VNode[]
    if (oldVnode === vnode) return
    if (vnode.data !== undefined) {
      for (let i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      // 执行 update 钩子
      vnode.data.hook?.update?.(oldVnode, vnode)
    }

    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        // 新阶段不是文本节点 且都有孩子节点 则通过 domdiff 比较儿子节点
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue)
      } else if (isDef(ch)) {
        // 新节点有儿子节点 老节点没用 则把所有儿子节点添加到老节点上
        if (isDef(oldVnode.text)) api.setTextContent(elm, '')
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      } else if (isDef(oldCh)) {
        // 老节点有儿子节点 新节点没用 删除所有子节点
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) {
        // 老节点是文本节点 新阶段不是 则删除老节点文本
        api.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
      // 新节点是文本节点 且与旧节点文本不一致
      if (isDef(oldCh)) {
        // 删除旧节点的所有儿子
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)
      }
      // 将就节点文本设置问新文本
      api.setTextContent(elm, vnode.text!)
    }
    hook?.postpatch?.(oldVnode, vnode)
  }

  // 返回 patch 方法
  return function patch(oldVnode: VNode | Element, vnode: VNode): VNode {
    let i: number, elm: Node, parent: Node
    const insertedVnodeQueue: VNodeQueue = []
    // 触发 pre 钩子
    for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]()

    if (!isVnode(oldVnode)) {
      // 传入的不是 vnode 则传入的就是真实 dom，通过 emptyNodeAt 方法将真实 dom 转为 vnode
      oldVnode = emptyNodeAt(oldVnode)
    }

    if (sameVnode(oldVnode, vnode)) {
      // 如果两个虚拟dom一致，调用 patchVnode 进行domdiff
      patchVnode(oldVnode, vnode, insertedVnodeQueue)
    } else {
      // 不一致 用新的 vnode 生成真实 dom 替换旧的 dom 节点
      elm = oldVnode.elm!
      parent = api.parentNode(elm) as Node

      // 根据 vnode 生成真实 dom 节点
      createElm(vnode, insertedVnodeQueue)

      if (parent !== null) {
        // 将生成的 dom 节点插入到旧 dom 节点之前
        api.insertBefore(parent, vnode.elm!, api.nextSibling(elm))
        // 删除旧 dom
        removeVnodes(parent, [oldVnode], 0, 0)
      }
    }

    for (i = 0; i < insertedVnodeQueue.length; ++i) {
      insertedVnodeQueue[i].data!.hook!.insert!(insertedVnodeQueue[i])
    }
    for (i = 0; i < cbs.post.length; ++i) cbs.post[i]()
    return vnode
  }
}
