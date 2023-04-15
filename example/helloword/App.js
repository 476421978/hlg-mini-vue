import { h } from "../../lib/guide-mini-vue.esm.js"
window.self
export const App = {
  // .vue
  // <template></template>
  // render
  render() {
    window.self = this // 方便调试
    // ui
    return h(
      "div",
      {
        id: "root2",
        onClick() {
          console.log("click")
        },
        onMousedown() {
          console.log("onmousedown")
        },
      },
      // setupState
      // $el
      "hi," + this.msg // 要通过this访问msg(render的this要绑定成setup的this指向)
      // [
      //   h("p", { id: "p1", class: ['red']}, "p1"),
      //   h("p", { id: "p2", class: ['blue'] }, "p2"),
      // ]
    )
  },
  setup() {
    // composition api
    return {
      msg: "this.msg -> mini-vue",
    }
  },
}
