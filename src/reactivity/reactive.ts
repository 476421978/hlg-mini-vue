import { mutableHandles, readonlyHandles } from "./baseHandles"

export function reactive(raw) {
  return new Proxy(raw, mutableHandles)
}

export function readonly(raw) {
  return new Proxy(raw, readonlyHandles)
}
