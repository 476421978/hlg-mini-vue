import { track, trigger } from "./effect"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(isReadonly = false) {
  return function (target, key) {
    const res = Reflect.get(target, key)
    if (!isReadonly) {
      track(target, key)
    }
    return res
  }
}

function createSetter() {
  return function (target, key, value) {
    const res = Reflect.set(target, key, value)
    // 触发trigger
    trigger(target, key)
    return res
  }
}

export const mutableHandles = {
  get,
  set,
}

export const readonlyHandles = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`key:${key} set失败 因为 target 是 readonly`, target)
    return true
  },
}
