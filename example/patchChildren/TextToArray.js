import { h, ref } from "../../lib/guide-mini-vue.esm.js"

const nextChildren = [h("div", {}, "A"), h("div", {}, "B")]
const prevChildren = "prevChildren"

export default {
  name: "ArrayToText",
  setup() {
    const isChange = ref(false)
    window.isChange = isChange // 控制台调试

    return {
      isChange,
    }
  },
  render() {
    const self = this
    return self.isChange
      ? h("div", {}, nextChildren)
      : h("div", {}, prevChildren)
  },
}
