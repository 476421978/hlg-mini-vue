import { hasChanged, isObject } from "../shared"
import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from "./reactive"

class RefImpl {
  private _value: any
  private dep
  private rawValue
  public __v_isRef = true
  constructor(value) {
    this.rawValue = value // 保留原值
    this._value = convert(value)
    this.dep = new Set()
  }

  get value() {
    trackRefValue(this)
    return this._value
  }
  set value(newValue) {
    if (hasChanged(newValue, this.rawValue)) {
      // 判断值是否有改变
      this.rawValue = newValue // 更新原值
      this._value = convert(newValue)
      triggerEffects(this.dep)
    }
  }
}

// 判断是否对象
function convert(value) {
  return isObject(value) ? reactive(value) : value
}

// 判断是否需要收集
function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

export function ref(value) {
  return new RefImpl(value)
}

// 检查某个值是否为 ref。
export function isRef(ref) {
  return !!ref.__v_isRef
}

// 如果参数是 ref，则返回内部值，否则返回参数本身。
export function unRef(ref) {
  return isRef(ref) ? ref.value : ref
}
