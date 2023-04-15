import { isObject } from "../shared/index"
import {
  mutableHandles,
  readonlyHandles,
  shallowReadonlyHandles,
} from "./baseHandles"

// 利用get获取的key信息判断
export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly",
}

export function reactive(raw) {
  return createReactiveObject(raw, mutableHandles)
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandles)
}

export function shallowReadonly(raw) {
  return createReactiveObject(raw, shallowReadonlyHandles)
}

function createReactiveObject(target: any, baseHandles) {
  if(!isObject(target)) {
    console.warn(`target ${target} 必须是一个对象`)
    return target
  }
  return new Proxy(target, baseHandles)
}

// 检查一个对象是否是由 reactive() 或 shallowReactive() 创建的代理。
export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE] // !! 避免返回对象,转布尔值
}

// 检查传入的值是否为只读对象
export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}

// 检查一个对象是否是由 reactive()、readonly()、shallowReactive() 或 shallowReadonly() 创建的代理
export function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}