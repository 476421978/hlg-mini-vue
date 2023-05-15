import { extend, isObject } from "../shared/index"
import { track, trigger } from "./effect"
import { reactive, ReactiveFlags, readonly } from "./reactive"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly = false, shallow = false) {
  return function (target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }

    const res = Reflect.get(target, key)

    if (shallow) return res

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

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

// 利用Object.assign重写readonlyHandles的get方法
export const shallowReadonlyHandles = extend({}, readonlyHandles, {
  get: shallowReadonlyGet,
})
