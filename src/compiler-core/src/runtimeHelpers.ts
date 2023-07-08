export const TO_DISPLAY_STRING = Symbol("toDisplayString")
export const CREATE_ELEMENT_VNODE = Symbol("createElementVNode")

// 在处理 Symbol 类型的值时，不能将其隐式或显式转换成字符串，而应该使用适当的方法来表示或使用其值。
export const helperMapName = {
  [TO_DISPLAY_STRING]: "toDisplayString",
  [CREATE_ELEMENT_VNODE]: 'createElementVNode'
}
