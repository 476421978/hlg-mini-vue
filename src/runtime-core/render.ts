import { effect } from "../reactivity/effect"
import { EMPTY_OBJ } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { shouldUpdateComponent } from "./componentUpdateUtils"
import { createdAppAPI } from "./createApp"
import { queueJobs } from "./scheduler"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options

  function render(vnode, container) {
    patch(null, vnode, container, null, null)
  }

  // n1 旧的 n2新的
  function patch(n1, n2: any, container: any, parentComponent, anchor) {
    // ShapeFlags 位运算符优化
    const { type, shapeFlag } = n2
    // Fragment -> 只渲染children
    switch (type) {
      case Fragment:
        processFragment(
          n1.children,
          n2.children,
          container,
          parentComponent,
          anchor
        )
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // element [元素]类型如何处理
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // component [组件]类型如何处理
          processComponent(n1, n2, container, parentComponent, anchor)
        }
        break
    }
  }

  function processText(n1, n2: any, container: any) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.insertBefore(textNode)
  }

  function processFragment(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    mountChildren(n2, container, parentComponent, anchor)
  }

  function processElement(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  // 更新
  function patchElement(n1, n2: any, container: any, parentComponent, anchor) {
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    const el = (n2.el = n1.el)

    patchChildren(n1, n2, el, parentComponent, anchor) // el 当前节点
    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag
    const { shapeFlag } = n2

    const c1 = n1.children
    const c2 = n2.children

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 把老的children清空
        unmountChildren(c1) // Array to Text
      }
      if (c1 !== c2) {
        // Array/Text to Text
        hostSetElementText(container, c2)
      }
    } else {
      // Text to Array
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "")
        // 挂载节点
        mountChildren(c2, container, parentComponent, anchor)
      }

      // Array to Array
      if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    const l2 = c2.length
    let i = 0
    let e1 = c1.length - 1
    let e2 = l2 - 1

    function isSomeVNodeType(n1, n2) {
      return n1.type === n2.type && n1.key === n2.key
    }

    // 左侧对比 右移动下标
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      i++
    }

    // 右侧对比 左移动下标
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      e1--
      e2--
    }

    // 新的比老的长 创建
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1 // 确定锚点
        const anchor = nextPos + 1 < l2 ? c2[nextPos].el : null // 创建位置
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if (i > e2) {
      // 新的比老的短 删除
      while (i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
    } else {
      // 中间对比
      let s1 = i
      let s2 = i

      const toBePatched = e2 - s2 + 1 // 待处理的新节点总数量
      let patched = 0 // 当前处理的数量
      const keyToNewIndexMap = new Map() // 映射查找

      const newIndexToOldIndexMap = new Array(toBePatched)
      let moved = false
      let maxNewIndexSoFar = 0
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0

      for (let i = s2; i <= e2; i++) {
        // 新节点数组建立映射
        const nextChild = c2[i]
        keyToNewIndexMap.set(nextChild.key, i)
      }

      for (let i = s1; i <= e1; i++) {
        // 循环旧节点数组
        const prevChild = c1[i]

        if (patched >= toBePatched) {
          // 若处理节点的次数大于toBePatched
          hostRemove(prevChild.el)
          continue
        }

        let newIndex
        if (prevChild !== null) {
          newIndex = keyToNewIndexMap.get(prevChild.key) // 查找节点映射(新节点)
        } else {
          // 存在则历遍对比新节点数组
          for (let j = s2; j <= e2; j++) {
            if (isSomeVNodeType(prevChild, c2[j])) {
              // 获取旧值在新节点的位置
              newIndex = j
              break
            }
          }
        }

        if (newIndex === undefined) {
          // 新节点没有则删除
          hostRemove(prevChild.el)
        } else {
          // 新节点有则移动
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            moved = true
          }

          newIndexToOldIndexMap[newIndex - s2] = i + 1 // newIndex是从0开始的
          patch(prevChild, c2[newIndex], container, parentComponent, null)
          patched++
        }
      }

      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : []

      let j = increasingNewIndexSequence.length - 1

      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2
        const nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null

        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor)
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            hostInsert(nextChild.el, container, anchor)
          } else {
            j--
          }
        }
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      debugger
      hostRemove(el)
    }
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      // 对比变化
      // newProps 更新
      for (const key in newProps) {
        const prevProd = oldProps[key]
        const nextProd = newProps[key]
        if (prevProd !== nextProd) {
          hostPatchProp(el, key, prevProd, nextProd)
        }
      }
      // oldProps 删除
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  // 元素挂载
  function mountElement(vnode: any, container: any, parentComponent, anchor) {
    // canvas document
    const el = (vnode.el = hostCreateElement(vnode.type))

    // children
    const { children, shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent, anchor)
    }

    // props
    const { props } = vnode
    for (const key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }

    // append
    hostInsert(el, container, anchor)
  }

  // 挂载子元素
  function mountChildren(
    children: any,
    container: any,
    parentComponent,
    anchor
  ) {
    children.forEach((v) => {
      patch(null, v, container, parentComponent, anchor)
    })
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      // 去挂载节点
      mountedComponent(n2, container, parentComponent, anchor)
    } else {
      updateComponent(n1, n2)
    }
  }

  function updateComponent(n1, n2) {
    const instance = (n2.component = n1.component)
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    } else {
      n2.el = n1.el
      instance.vnode = n2
    }
  }

  // 组件挂载
  function mountedComponent(
    initialVnode: any,
    container: any,
    parentComponent,
    anchor
  ) {
    let instance = (initialVnode.component = createComponentInstance(
      initialVnode,
      parentComponent
    )) // 节点创建
    setupComponent(instance) // 初始化组件
    setupRenderEffect(instance, initialVnode, container, anchor) // 处理组件 判断类型
  }

  function setupRenderEffect(
    instance: any,
    initialVnode: any,
    container: any,
    anchor
  ) {
    instance.update = effect(
      () => {
        const { proxy } = instance
        if (!instance.isMounted) {
          // 初始化
          const subTree = (instance.subTree = instance.render.call(proxy))
          patch(null, subTree, container, instance, anchor)
          initialVnode.el = subTree.el
          instance.isMounted = true
        } else {
          // 更新
          const { next, vnode } = instance
          if (next) {
            next.el = vnode.el
            updateComponentPreRender(instance, next)
          }

          const subTree = instance.render.call(proxy)
          const prevSubThree = instance.subTree
          instance.subTree = prevSubThree
          patch(prevSubThree, subTree, container, instance, anchor)
        }
      },
      {
        scheduler() {
          console.log("update - scheduler")
          queueJobs(instance.update)
        },
      }
    )
  }

  return {
    createApp: createdAppAPI(render),
  }
}

function updateComponentPreRender(instance, nextVnode) {
  instance.vnode = nextVnode
  instance.next = null
  instance.props = nextVnode.props
}

// 返回的是数组中子序列的索引值
function getSequence(arr) {
  const p = arr.slice() //  保存原始数据
  const result = [0] //  存储最长增长子序列的索引数组
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1] //  j是子序列索引最后一项
      if (arr[j] < arrI) {
        //  如果arr[i] > arr[j], 当前值比最后一项还大，可以直接push到索引数组(result)中去
        p[i] = j //  p记录第i个位置的索引变为j
        result.push(i)
        continue
      }
      u = 0 //  数组的第一项
      v = result.length - 1 //  数组的最后一项
      while (u < v) {
        //  如果arrI <= arr[j] 通过二分查找，将i插入到result对应位置；u和v相等时循环停止
        c = ((u + v) / 2) | 0 //  二分查找
        if (arr[result[c]] < arrI) {
          u = c + 1 //  移动u
        } else {
          v = c //  中间的位置大于等于i,v=c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1] //  记录修改的索引
        }
        result[u] = i //  更新索引数组(result)
      }
    }
  }
  u = result.length
  v = result[u - 1]
  //把u值赋给result
  while (u-- > 0) {
    //  最后通过p数组对result数组进行进行修订，取得正确的索引
    result[u] = v
    v = p[v]
  }
  return result
}
