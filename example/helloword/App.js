import { h } from "../../lib/guide-mini-vue.esm.js"
import { Foo } from "./Foo.js"
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
        id: "root",
        class: ["red"],
        onClick() {
          console.log("click")
        },
        onMousedown() {
          console.log("onmousedown")
        },
      },
      // setupState
      // $el
      // "hi," + this.msg // 要通过this访问msg(render的this要绑定成setup的this指向)
      [
        h("div", {}, "hi," + this.msg),
        h(Foo, {
          count: 1,
        }),
      ]
    )
  },
  setup() {
    // composition api
    return {
      msg: "this.msg -> mini-vue",
    }
  },
}
