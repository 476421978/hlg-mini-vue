import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode: any, container: any) {
  // ShapeFlags 位运算符优化
  const { shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.ELEMENT) {
    // element [元素]类型如何处理
    processElement(vnode, container)
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    // component [组件]类型如何处理
    processComponent(vnode, container)
  }
}

function processElement(vnode: any, container: any) {
  mountedElement(vnode, container)
}

// 元素挂载
function mountedElement(vnode: any, container: any) {
  // el -> element -> div
  const el = (vnode.el = document.createElement(vnode.type))

  const { children, shapeFlag } = vnode
  // children
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // text_children
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // array_children
    mountedChildren(children, el)
  }

  const { props } = vnode
  for (const key in props) {
    const val = props[key]
    // on + Event name
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    if (isOn(key)) {
      const eventName = key.slice(2).toLocaleLowerCase() // 去掉on转小写
      el.addEventListener(eventName, val)
    } else {
      el.setAttribute(key, val)
    }
  }
  container.append(el)
}

// 挂载子元素
function mountedChildren(vnode: any, container: any) {
  vnode.forEach((v) => {
    patch(v, container)
  })
}

function processComponent(vnode: any, container: any) {
  // 去挂载节点
  mountedComponent(vnode, container)
}

// 组件挂载
function mountedComponent(initialVnode: any, container: any) {
  let instance = createComponentInstance(initialVnode) // 节点创建
  setupComponent(instance) // 初始化组件
  setupRenderEffect(instance, initialVnode, container) // 处理组件 判断类型
}

function setupRenderEffect(instance: any, initialVnode: any, container: any) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container)

  //element->mounted mountedElement完成后再次赋值$el (self.$el可以获取dom信息)
  initialVnode.el = subTree.el
}
