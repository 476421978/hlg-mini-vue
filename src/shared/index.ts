export const extend = Object.assign

export const EMPTY_OBJ = {}

export function isObject(val) {
  return val !== null && typeof val === "object"
}

export const hasChanged = (value, newValue) => {
  return !Object.is(value, newValue)
}

export function hasOwn(val, key) {
  return Object.prototype.hasOwnProperty.call(val, key)
}

// 转换 add-foo -> addFoo
// 正则表达式 /-(\w)/g 匹配字符串中所有的 "-"，并将其后面的字符作为第一个捕获组
// replace() 方法接收两个参数：要查找的正则表达式和替换函数。替换函数的第一个参数是匹配到的字符串，第二个参数是第一个捕获组（即需要转换成大写字母的字符）
export const camelize = (str: string) => {
  return str.replace(/-(\w)g/, (_, c: string) => {
    return c ? c.toUpperCase() : ""
  })
}

// 首字母大写 add -> Add
const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// 拼接 on + Event
export const toHandleKey = (str: string) => {
  return str ? "on" + capitalize(str) : ""
}
