import { effect } from "../reactivity/effect"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createdAppAPI } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
  } = options

  function render(vnode, container) {
    patch(null, vnode, container, null)
  }

  // n1 旧的 n2新的
  function patch(n1, n2: any, container: any, parentComponent) {
    // ShapeFlags 位运算符优化
    const { type, shapeFlag } = n2
    // Fragment -> 只渲染children
    switch (type) {
      case Fragment:
        processFragment(n1.children, n2.children, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // element [元素]类型如何处理
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // component [组件]类型如何处理
          processComponent(n1, n2, container, parentComponent)
        }
        break
    }
  }

  function processText(n1, n2: any, container: any) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }

  function processFragment(n1, n2: any, container: any, parentComponent) {
    mountedChildren(n2, container, parentComponent)
  }

  function processElement(n1, n2: any, container: any, parentComponent) {
    if (!n1) {
      mountedElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container, parentComponent)
    }
  }

  function patchElement(n1, n2: any, container: any, parentComponent) {
    console.log("n1, n2-->>", n1, n2)
  }

  // 元素挂载
  function mountedElement(vnode: any, container: any, parentComponent) {
    // canvas document
    const el = (vnode.el = hostCreateElement(vnode.type))

    // children
    const { children, shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountedChildren(children, el, parentComponent)
    }

    // props
    const { props } = vnode
    for (const key in props) {
      const val = props[key]
      hostPatchProp(el, key, val)
    }

    // append
    hostInsert(el, container)
  }

  // 挂载子元素
  function mountedChildren(vnode: any, container: any, parentComponent) {
    vnode.forEach((v) => {
      patch(null, v, container, parentComponent)
    })
  }

  function processComponent(n1, n2: any, container: any, parentComponent) {
    // 去挂载节点
    mountedComponent(n2, container, parentComponent)
  }

  // 组件挂载
  function mountedComponent(
    initialVnode: any,
    container: any,
    parentComponent
  ) {
    let instance = createComponentInstance(initialVnode, parentComponent) // 节点创建
    setupComponent(instance) // 初始化组件
    setupRenderEffect(instance, initialVnode, container) // 处理组件 判断类型
  }

  function setupRenderEffect(instance: any, initialVnode: any, container: any) {
    effect(() => {
      const { proxy } = instance
      if (!instance.isMounted) { // 初始化
        const subTree = (instance.subTree = instance.render.call(proxy))
        patch(null, subTree, container, instance)
        initialVnode.el = subTree.el
        instance.isMounted = true
      } else { // 更新
        const subTree = instance.render.call(proxy)
        const prevSubThree = instance.subTree
        instance.subTree = prevSubThree
        patch(prevSubThree, subTree, container, instance)
      }
    })
  }

  return {
    createApp: createdAppAPI(render),
  }
}
