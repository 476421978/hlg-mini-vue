import { h } from "../../lib/guide-mini-vue.esm.js"
import ArrayToText from "./ArrayToText.js"
import TextToArray from "./TextToArray.js"
import TextToText from "./TextToText.js"
import ArrayToArray from "./ArrayToArray.js"
export const App = {
  name: "App",
  setup() {
    return {}
  },
  render() {
    return h("div", { tId: 1 }, [
      h("p", {}, "主页"),
      // h(ArrayToText),    // array -> text
      // h(TextToArray), // text -> array
      // h(TextToText) // text -> text
      h(ArrayToArray), // Array -> Array
    ])
  },
}
