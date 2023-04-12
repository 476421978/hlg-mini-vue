import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
  patch(vnode, container)
}

function patch(vnode: any, container: any) {
  // 去处理组件

  // 判断 是不是 element
  processComponent(vnode, container)
}

function processComponent(vnode: any, container: any) {
  // 去挂载节点
  mountedComponent(vnode, container)
}

// 挂载操作
function mountedComponent(vnode: any, container: any) {
  let instance = createComponentInstance(vnode) // 节点创建
  setupComponent(instance)
  setupRenderEffect(instance, container)
}

//
function setupRenderEffect(instance: any, container: any) {
  const subTree = instance.render() // return h("div", "hi" + this.msg)
  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container)
}
