import { get, readonlyGet, set } from "./baseHandles"

export function reactive(raw) {
  return new Proxy(raw, {
    get,
    set,
  })
}

export function readonly(raw) {
  return new Proxy(raw, {
    get: readonlyGet,
    set(target, key, value) {
      console.warn(`key:${key} set失败 因为 target 是 readonly`, target)
      return true
    },
  })
}
