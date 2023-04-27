import { h, ref } from "../../lib/guide-mini-vue.esm.js"

const nextChildren = [h("div", {}, "C"), h("div", {}, "D")]
const prevChildren = [h("div", {}, "A"), h("div", {}, "B")]

export default {
  name: "ArrayToArray",
  setup() {
    const isChange = ref(false)
    window.isChange = isChange // 控制台调试

    return {
      isChange,
    }
  },
  render() {
    const self = this
    return self.isChange === true
      ? h("div", {}, nextChildren)
      : h("div", {}, prevChildren)
  },
}
