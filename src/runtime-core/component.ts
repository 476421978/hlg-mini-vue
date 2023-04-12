export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
  }
  return component
}

export function setupComponent(instance) {
  // TODO
  // initProps
  // initSlots

  // 初始化节点
  setupStatefulComponent(instance)
}

// 初始化操作
function setupStatefulComponent(instance: any) {
  const Component = instance.type
  const { setup } = Component
  if (setup) {
    // return function || object
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance: any, setupResult: any) {
  if (typeof setupResult === "object") {
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type
  if (Component.render) {
    instance.render = Component.render
  }
}
