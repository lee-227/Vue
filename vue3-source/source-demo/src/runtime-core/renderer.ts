import { ShapeFlags } from '../shared'
import { createAppApi } from './apiCreateApp'
import { createComponentInstance, setupComponent } from './component'
import { effect } from '../reactivity'

export function createRenderer(options) {
  let {
    createElement: hostCreateElement,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    createTextNode: hostCreateNode,
    patchProp: hostPatchProp
  } = options

  const render = function (vnode, container) {
    patch(null, vnode, container)
  }
  const patch = (n1, n2, container, anchor = null) => {
    if (n1 && !isSameVnodeType(n1, n2)) {
      hostRemove(n1.el)
      n1 = null
    }
    let { shapeFlag } = n2
    if (shapeFlag & ShapeFlags.ELEMENT) {
      processElement(n1, n2, container, anchor)
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      processComponent(n1, n2, container)
    }
  }
  const isSameVnodeType = (n1, n2) => {
    return n1.type == n2.type && n1.key == n2.key
  }
  const processElement = (n1, n2, container, anchor) => {
    if (n1 == null) {
      // 组件挂载
      mountElement(n2, container, anchor)
    } else {
      patchElement(n1, n2, container)
    }
  }
  const processComponent = (n1, n2, container) => {
    if (n1 == null) {
      mountComponent(n2, container)
    } else {
      updateComponent(n1, n2, container)
    }
  }
  const mountElement = (vnode, container, anchor) => {
    let { type, shapeFlag, props, children } = vnode
    let el = (vnode.el = hostCreateElement(type))
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children)
    } else {
      mountChildren(children, el)
    }
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    hostInsert(el, container, anchor)
  }
  function mountChildren(children, container) {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], container)
    }
  }
  const patchElement = (n1, n2, container) => {
    let el = (n2.el = n1.el)
    const oldProps = n1.props || {}
    const nextProps = n2.props || {}
    patchProps(oldProps, nextProps, el)
    patchChildren(n1, n2, el)
  }
  function patchChildren(n1, n2, el) {
    const c1 = n1.children
    const c2 = n2.children
    const prevShapeFlag = n1.shapeFlag
    const nextShapeFlag = n2.shapeFlag
    if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (c2 !== c1) {
        hostSetElementText(el, c2)
      }
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        patchKeyedChildren(c1, c2, el)
      } else {
        hostSetElementText(el, '')
        mountChildren(c2, el)
      }
    }
  }
  function patchKeyedChildren(c1, c2, el) {
    let i = 0
    let e1 = c1.length - 1
    let e2 = c2.length - 1
    // 1. sync from start
    // (a b) c
    // (a b) d e
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVnodeType(n1, n2)) {
        patch(n1, n2, el)
      } else {
        break
      }
      i++
    }
    // 2. sync from end
    // a (b c)
    // d e (b c)
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVnodeType(n1, n2)) {
        patch(n1, n2, el)
      } else {
        break
      }
      e1--
      e2--
    }
    // 3. common sequence + mount
    // (a b)
    // (a b) c
    // i = 2, e1 = 1, e2 = 2
    // (a b)
    // c (a b)
    // i = 0, e1 = -1, e2 = 0
    if (i > e1) {
      // 旧节点已经遍历完
      if (i <= e2) {
        // 新节点为遍历完 说明是新增元素
        const nextPos = e2 + 1
        // 先根据e2 取他的下一个元素  和 数组长度进行比较 获取要插入的位置
        const anchor = nextPos < c2.length ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], el, anchor)
          i++
        }
      }
      // 4. common sequence + unmount
      // (a b) c
      // (a b)
      // i = 2, e1 = 2, e2 = 1
      // a (b c)
      // (b c)
      // i = 0, e1 = 0, e2 = -1
    } else if (i > e2) {
      // 旧节点有剩余 要删除的元素
      while (i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
    } else {
      // 未知序列对比
      // 5. unknown sequence
      // a b [c d e] f g
      // a b [e c d h] f g
      // i = 2, e1 = 4, e2 = 5
      const s1 = i
      const s2 = i
      const keyToNewIndexMap = new Map()
      for (let i = s2; i < e2; i++) {
        // 根据新节点的key 创建新节点下标的映射
        keyToNewIndexMap.set(c2[i].props.key, i)
      }
      // 剩下需要比对的元素总数量
      const toBePatched = e2 - s2 + 1
      
      // 新节点下标 与 老节点下标的映射
      const newIndexToOldIndexMap = new Array(toBePatched)
      newIndexToOldIndexMap.fill(0)

      // 遍历剩余老节点进行patch
      for (let i = s1; i <= e1; i++) {
        const oldVnode = c1[i]
        // 通过老节点的key 判断新节点中是否有一致key的节点 获取其下标
        let newIndex = keyToNewIndexMap.get(oldVnode.props.key)
        if (newIndex === undefined) {
          // 新节点中没有找到 说明是新节点中没有 删除该节点
          hostRemove(oldVnode.el)
        } else {
          // 在该新节点下标位置存储复用的老节点下标，通过该数组 获取最长递增子序列，这些老节点无需移动，移动其他节点
          newIndexToOldIndexMap[newIndex - s2] = i + 1
          patch(oldVnode, c2[newIndex], el)
        }
      }
      let sequence = getSequence(newIndexToOldIndexMap) // 目的是找到不需要移动的最多的哪些元素， 去移动别的元素，确保做到最少的dom移动操作
      let j = sequence.length - 1
      for (let i = toBePatched - 1; i >= 0; i--) {
        // 从后向前遍历 方便找到要插入的参照物节点
        const nextIndex = s2 + i
        const currentEle = c2[nextIndex]
        const anchor = nextIndex + 1 <= e2 ? c2[nextIndex + 1].el : null
        if (newIndexToOldIndexMap[i] === 0) {
          // 说明该节点老节点中没有 新增节点
          patch(null, currentEle, el, anchor)
        } else {
          // 这是需要移动的节点
          if (i === sequence[j]) {
            // 该节点在递增子序列中 无需移动
            j--
          } else {
            // 节点移动
            hostInsert(currentEle.el, el, anchor)
          }
        }
      }
    }
  }

  function getSequence(arr) {
    // 最长递增子序列的索引 贪心 + 二分查找法 但是替换时会导致结果错误 但是最长递增子序列的数量还是正确的
    const p = arr.slice()
    const result = [0] // 保存最长递增子序列的索引 该索引不一定正确 需要另外的数组去保存正确索引
    let i, j, u, v, c
    const len = arr.length
    for (i = 0; i < len; i++) {
      const arrI = arr[i]
      if (arrI !== 0) {
        j = result[result.length - 1]
        if (arr[j] < arrI) { // 当前遍历的值 》 递增子序列最后一项的值
          p[i] = j
          result.push(i) // 推送到递增子序列中 记录递增的索引
          continue
        }
        // 当前遍历的值 《 递增子序列最后一项的值 需要二分查找递增子序列 替换第一个 大于当前遍历的值 的值
        u = 0
        v = result.length - 1
        while (u < v) {
          c = ((u + v) / 2) | 0
          if (arr[result[c]] < arrI) {
            u = c + 1
          } else {
            v = c
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
            p[i] = result[u - 1]
          }
          result[u] = i // 贪心算法 用更有潜力的来替换
        }
      }
    }
    u = result.length
    v = result[u - 1]
    while (u-- > 0) {
      result[u] = v
      v = p[v]
    }
    return result
  }
  function patchProps(oldProps, newProps, el) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prev = oldProps[key]
        const next = newProps[key]
        if (prev !== next) {
          hostPatchProp(el, key, prev, next)
        }
      }
      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null)
        }
      }
    }
  }
  const mountComponent = (vnode, container) => {
    const instance = (vnode.component = createComponentInstance(vnode))

    setupComponent(instance)

    setupRenderEffect(instance, container)
  }
  function setupRenderEffect(instance, container) {
    effect(() => {
      if (!instance.isMounted) {
        let subTree = (instance.subTree = instance.render())
        patch(null, subTree, container)
        instance.isMounted = true
      } else {
        let prevTree = instance.subTree
        let nextTree = (instance.subTree = instance.render())
        patch(prevTree, nextTree, container)
      }
    })
  }
  const updateComponent = (n1, n2, container) => {}

  return {
    createApp: createAppApi(render)
  }
}
