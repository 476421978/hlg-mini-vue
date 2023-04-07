import { track, trigger } from "./effect"

export function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      const res = Reflect.get(target, key)
      // 收集track
      track(target, key)
      return res
    },
    set(target, key, value) {
      const res = Reflect.set(target, key, value)
      // 触发trigger
      trigger(target, key)
      return res
    },
  })
}

export function readonly(raw) {
  return new Proxy(raw, {
    get(target, key) {
      const res = Reflect.get(target, key)
      return res
    },
    set(target, key, value) {
      console.warn(`key:${key} set失败 因为 target 是 readonly`, target)
      return true
    },
  })
}