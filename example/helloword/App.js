import { h } from "../../lib/guide-mini-vue.esm.js"
export const App = {
  // .vue
  // <template></template>
  // render
  render() {
    // ui
    return h(
      "div",
      {
        id: "root2",
      },
      [
        h("p", { id: "p1", class: ['red']}, "p1"),
        h("p", { id: "p2", class: ['blue'] }, "p2"),
      ]
    )
  },
  setup() {
    // composition api
    return {
      msg: "mini-vue",
    }
  },
}
