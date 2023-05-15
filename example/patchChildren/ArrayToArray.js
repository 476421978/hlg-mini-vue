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
// const prevChildren = [
//   h("p", { key: "A" }, "a"),
//   h("p", { key: "B" }, "b"),
//   h("p", { key: "C" }, "c"),
// ]
// const nextChildren = [h("p", { key: "B" }, "b"), h("p", { key: "C" }, "c")]

// 5.对比中间部分
// 综合例子 删除、创建 、移动
// a,b(c,d,e,z),f,g
// a,b(d,c,y,e),f,g
const prevChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "C" }, "C"),
  h("p", { key: "D" }, "D"),
  h("p", { key: "E" }, "E"),
  h("p", { key: "Z" }, "Z"),
  h("p", { key: "F" }, "F"),
  h("p", { key: "G" }, "G"),
]
const nextChildren = [
  h("p", { key: "A" }, "A"),
  h("p", { key: "B" }, "B"),
  h("p", { key: "D" }, "D"),
  h("p", { key: "C" }, "C"),
  h("p", { key: "Y" }, "Y"),
  h("p", { key: "E" }, "E"),
  h("p", { key: "F" }, "F"),
  h("p", { key: "G" }, "G"),
]

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
