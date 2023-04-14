// 运算规则
// &	与	两个位都为1时，结果才为1
// |	或	两个位都为0时，结果才为0
// ^	异或	两个位相同为0，相异为1
// ~	取反	0变1，1变0
// <<	左移	各二进位全部左移若干位，高位丢弃，低位补0
// >>	右移
export const enum ShapeFlags {
  ELEMENT = 1, // 0001 HTML 或 SVG 标签 普通 DOM 元素
  STATEFUL_COMPONENT = 1 << 1, // 0010 普通有状态组件
  TEXT_CHILDREN = 1 << 2, // 0100 子节点为纯文本
  ARRAY_CHILDREN = 1 << 3, // 1000  子节点是数组
}
