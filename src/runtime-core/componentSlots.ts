import { ShapeFlags } from "../shared/ShapeFlags"

export function initSlots(instance, children) {
  const { vnode } = instance

  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance.slots)
  }
}

// children 类型 object
function normalizeObjectSlots(children: any, slots: any) {
  for (const key in children) {
    const value = children[key]
    slots[key] = (props) => normalizeSlotValue(value(props))
  }
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value] // 解决 当this.$slots是数组
}
