import { hasChanged, isObject } from "../shared"
import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from "./reactive"

class RefImpl {
  private _value: any
  private dep
  private rawValue
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
    if (hasChanged(newValue, this.rawValue)) { // 判断值是否有改变
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
