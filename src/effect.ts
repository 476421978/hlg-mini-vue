class ReactiveEffect {
  private _fn: any
  deps = []
  constructor(fn) {
    this._fn = fn
  }
  run() {
    const r = this._fn()
    return r
  }
}

const targetMap = new Map()
export function track(target, key) {
  // target -> key -> dep
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
  return true
}

export function trigger(target, key) {
  const activeMap = targetMap.get(target)
  const deps = activeMap.get(key)
  deps.forEach((dep) => {
    dep.run()
  })
}

export function effect(fn) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}
