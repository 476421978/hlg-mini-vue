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
    mountChildren(n2, container, parentComponent)
  }

  function processElement(n1, n2: any, container: any, parentComponent) {
    if (!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container, parentComponent)
    }
  }

  // 更新
  function patchElement(n1, n2: any, container: any, parentComponent) {
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    const el = (n2.el = n1.el)

    patchChildren(n1, n2, el, parentComponent) // el 当前节点
    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1, n2, container, parentComponent) {
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
        mountChildren(c2, container, parentComponent)
      }

      // Array to Array
      if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
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
  function mountElement(vnode: any, container: any, parentComponent) {
    // canvas document
    const el = (vnode.el = hostCreateElement(vnode.type))

    // children
    const { children, shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent)
    }

    // props
    const { props } = vnode
    for (const key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }

    // append
    hostInsert(el, container)
  }

  // 挂载子元素
  function mountChildren(children: any, container: any, parentComponent) {
    children.forEach((v) => {
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
      if (!instance.isMounted) {
        // 初始化
        const subTree = (instance.subTree = instance.render.call(proxy))
        patch(null, subTree, container, instance)
        initialVnode.el = subTree.el
        instance.isMounted = true
      } else {
        // 更新
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
