import { h, ref } from "../../lib/guide-mini-vue.esm.js"

// 1.左侧的对比
// const prevChildren = [
//   h("p", { key: "A" }, "a"),
//   h("p", { key: "B" }, "b"),
//   h("p", { key: "C" }, "C"),
// ]
// const nextChildren = [
//   h("p", { key: "A" }, "a"),
//   h("p", { key: "B" }, "b"),
//   h("p", { key: "D" }, "d"),
//   h("p", { key: "E" }, "e"),
// ]

// 2.右侧的对比
// const prevChildren = [
//   h("p", { key: "A" }, "a"),
//   h("p", { key: "B" }, "b"),
//   h("p", { key: "C" }, "C"),
// ]
// const nextChildren = [
//   h("p", { key: "D" }, "d"),
//   h("p", { key: "E" }, "e"),
//   h("p", { key: "B" }, "b"),
//   h("p", { key: "C" }, "c"),
// ]

// 3.新的比老的多
// 左侧
// const prevChildren = [h("p", { key: "A" }, "a"), h("p", { key: "B" }, "b")]
// const nextChildren = [
//   h("p", { key: "A" }, "a"),
//   h("p", { key: "B" }, "b"),
//   h("p", { key: "C" }, "c"),
//   h("p", { key: "D" }, "d"),
// ]

// 右侧
// const prevChildren = [h("p", { key: "A" }, "a"), h("p", { key: "B" }, "b")]
// const nextChildren = [
//   h("p", { key: "D" }, "d"),
//   h("p", { key: "C" }, "c"),
//   h("p", { key: "A" }, "a"),
//   h("p", { key: "B" }, "b"),
// ]

// 4.老的比新的长 删除老的
// 左侧
// const prevChildren = [
//   h("p", { key: "A" }, "a"),
//   h("p", { key: "B" }, "b"),
//   h("p", { key: "C" }, "c"),
// ]
// const nextChildren = [h("p", { key: "A" }, "a"), h("p", { key: "B" }, "b")]

// 右侧
const prevChildren = [
  h("p", { key: "A" }, "a"),
  h("p", { key: "B" }, "b"),
  h("p", { key: "C" }, "c"),
]
const nextChildren = [h("p", { key: "B" }, "b"), h("p", { key: "C" }, "c")]

// 5.对比中间部分
// 1.创建新的
// 2.删除老的
// 3.移动

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
