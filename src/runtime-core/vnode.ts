import { ShapeFlags } from "../shared/ShapeFlags"

export function createVnode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    shapeFlag: getShapeFlag(type),
    el: null,
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
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN
  }

  return vnode
}

function getShapeFlag(type: any) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}
