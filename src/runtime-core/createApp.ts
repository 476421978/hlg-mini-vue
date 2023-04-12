import { render } from "./render"
import { createVnode } from "./vnode"

/** 
 * rootComponent
  render() {
    return h("div", "hi" + this.msg)
  },
  setup() {
    return {
      msg: "mini-vue",
    }
  },
 */

/**
 *  rootContainer 
  #app
 */

export function createApp(rootComponent) {
  return {
    mounted(rootContainer) {
      // 先转虚拟节点vnode
      // component => vnode
      // 所有的逻辑操作都基于 vnode 做处理
      const vnode = createVnode(rootComponent) // 转虚拟节点

      render(vnode, rootContainer)
    },
  }
}
