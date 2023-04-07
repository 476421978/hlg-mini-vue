import { extend } from "../shared"

let activeEffect // 保留ReactiveEffect的实例
let shouldTrack
class ReactiveEffect {
  private _fn: any
  deps = []
  public scheduler: Function | undefined
  constructor(fn, scheduler?: Function) {
    this._fn = fn
    this.scheduler = scheduler
  }
  run() {
    // 应该收集
    shouldTrack = true
    activeEffect = this
    const r = this._fn()
    // 重置
    shouldTrack = false
    return r
  }
  stop() {
    // 删除当前dep的effect（runner.effect的this）
    this.deps.forEach((dep: any) => {
      dep.delete(this)
    })
    this.deps.length = 0
  }
}

const targetMap = new Map()
export function track(target, key) {
  // target -> key -> dep
  // stop 不收集
  if (!isTracking()) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  trackEffects(dep)
}

function trackEffects(dep) {
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  // 需要收集进deps
  activeEffect.deps.push(dep)
}

// 判断是否需要收集
function isTracking() {
  return shouldTrack && activeEffect !== undefined
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)
  triggerEffects(dep)
}

function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)

  extend(_effect, options)

  _effect.run()

  const runner: any = _effect.run.bind(_effect)

  runner.effect = _effect // stop 需要对应的ReactiveEffect示例

  return runner
}

export function stop(runner) {
  runner.effect.stop()
}
