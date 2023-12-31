import { ShapeFlags } from "../shared/ShapeFlags"

export const Fragment = Symbol("Fragment")
export const Text = Symbol("Text")

export function createVnode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type),
    el: null,
    key: props && props.key,
  }

  // 运算规则
  // &	与	两个位都为1时，结果才为1
  // |	或	两个位都为0时，结果才为0
  // 示例
  // 0001       0001
  // |           &
  // 0100       0100
  // =          =
  // 0101       0000

  if (typeof children === "string") {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  // 组件 + children object
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === "object") {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }

  return vnode
}

export function createTextVNode(text: string) {
  return createVnode(Text, {}, text)
}

function getShapeFlag(type: any) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}
