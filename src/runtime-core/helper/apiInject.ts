import { getCurrentInstance } from "../component"

export function provide(key, value) {
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    let { provides } = currentInstance
    const parentProvides = currentInstance.parent.provides
    // init
    if (provides === parentProvides) {
      // 原型链 方法用于创建一个新对象，使用现有的对象来作为新创建对象的原型（prototype）
      provides = currentInstance.provides = Object.create(parentProvides) // 将原型指向父级
    }
    provides[key] = value
  }
}

export function inject(key, valueDefault) {
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides // createComponentInstance中存储
    if (key in parentProvides) {
      return parentProvides[key]
    } else if (valueDefault) {
      if (typeof valueDefault === "function") {
        return valueDefault()
      }
      return valueDefault
    }
  }
}
