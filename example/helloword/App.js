import { h } from "../../lib/guide-mini-vue.esm.js"
import { Foo } from "./Foo.js"
export const App = {
  render() {
    return h("div", {}, [
      h("div", {}, "App"),
      h(Foo, {
        // on + Event
        onAdd(a, b) {
          console.log("onAdd", a, b)
        },
      }),
    ])
  },
  setup() {
    return {}
  },
}
