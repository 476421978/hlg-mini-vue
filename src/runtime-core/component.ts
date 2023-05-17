import { proxyRefs } from "../reactivity"
import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { publicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"

export function createComponentInstance(vnode, parent) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    next: null,
    component: null,
    props: {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent: parent || {},
    isMounted: false,
    subTree: {},
    emit: () => {},
  }

  component.emit = emit.bind(null, component) as any

  return component
}

export function setupComponent(instance) {
  // TODO
  // 初始化props
  initProps(instance, instance.vnode.props) // instance.vnode.props 虚拟节点提上instance
  initSlots(instance, instance.vnode.children) // 插槽初始化
  // 初始化节点
  setupStatefulComponent(instance)
}

// 初始化操作
function setupStatefulComponent(instance: any) {
  const Component = instance.type
  // ctx
  instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers)

  const { setup } = Component
  if (setup) {
    setCurrentInstance(instance)
    // return function || object
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    })
    setCurrentInstance(null)
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance: any, setupResult: any) {
  if (typeof setupResult === "object") {
    instance.setupState = proxyRefs(setupResult)
  }
  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type
  if (Component.render) {
    instance.render = Component.render
  }
}

let currentInstance = null
export function getCurrentInstance() {
  return currentInstance
}

function setCurrentInstance(instance) {
  currentInstance = instance
}
