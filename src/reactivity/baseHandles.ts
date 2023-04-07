import { track, trigger } from "./effect"

export const get = function (target, key) {
  const res = Reflect.get(target, key)
  // 收集track
  track(target, key)
  return res
}

export const set = function (target, key, value) {
  const res = Reflect.set(target, key, value)
  // 触发trigger
  trigger(target, key)
  return res
}

export const readonlyGet = function (target, key) {
  const res = Reflect.get(target, key)
  return res
}
