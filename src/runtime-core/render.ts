import { effect } from "../reactivity/effect"
import { EMPTY_OBJ } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createdAppAPI } from "./createApp"
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

  function processComponent(
    n1,
    n2: any,
    container: any,
    parentComponent,
    anchor
  ) {
    // 去挂载节点
    mountedComponent(n2, container, parentComponent, anchor)
  }

  // 组件挂载
  function mountedComponent(
    initialVnode: any,
    container: any,
    parentComponent,
    anchor
  ) {
    let instance = createComponentInstance(initialVnode, parentComponent) // 节点创建
    setupComponent(instance) // 初始化组件
    setupRenderEffect(instance, initialVnode, container, anchor) // 处理组件 判断类型
  }

  function setupRenderEffect(
    instance: any,
    initialVnode: any,
    container: any,
    anchor
  ) {
    effect(() => {
      const { proxy } = instance
      if (!instance.isMounted) {
        // 初始化
        const subTree = (instance.subTree = instance.render.call(proxy))
        patch(null, subTree, container, instance, anchor)
        initialVnode.el = subTree.el
        instance.isMounted = true
      } else {
        // 更新
        const subTree = instance.render.call(proxy)
        const prevSubThree = instance.subTree
        instance.subTree = prevSubThree
        patch(prevSubThree, subTree, container, instance, anchor)
      }
    })
  }

  return {
    createApp: createdAppAPI(render),
  }
}
