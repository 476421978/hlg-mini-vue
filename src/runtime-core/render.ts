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
    patch(vnode, container, null)
  }

  function patch(vnode: any, container: any, parentComponent) {
    // ShapeFlags 位运算符优化
    const { type, shapeFlag } = vnode
    // Fragment -> 只渲染children
    switch (type) {
      case Fragment:
        processFragment(vnode.children, container, parentComponent)
        break
      case Text:
        processText(vnode, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // element [元素]类型如何处理
          processElement(vnode, container, parentComponent)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // component [组件]类型如何处理
          processComponent(vnode, container, parentComponent)
        }
        break
    }
  }

  function processText(vnode: any, container: any) {
    const { children } = vnode
    const textNode = (vnode.el = document.createTextNode(children))
    container.append(textNode)
  }

  function processFragment(vnode: any, container: any, parentComponent) {
    mountedChildren(vnode, container, parentComponent)
  }

  function processElement(vnode: any, container: any, parentComponent) {
    mountedElement(vnode, container, parentComponent)
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
      patch(v, container, parentComponent)
    })
  }

  function processComponent(vnode: any, container: any, parentComponent) {
    // 去挂载节点
    mountedComponent(vnode, container, parentComponent)
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
    const { proxy } = instance
    const subTree = instance.render.call(proxy)
    // vnode -> patch
    // vnode -> element -> mountElement
    patch(subTree, container, instance)

    //element->mounted mountedElement完成后再次赋值$el (self.$el可以获取dom信息)
    initialVnode.el = subTree.el
  }

  return {
    createApp: createdAppAPI(render),
  }
}
