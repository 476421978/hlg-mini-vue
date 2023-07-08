import { NodeType } from "./ast"
import { CREATE_ELEMENT_VNODE, TO_DISPLAY_STRING } from "./runtimeHelpers"

export function transform(root, options = {}) {
  const context = createTransformContext(root, options)

  traverseNode(root, context)

  createRootCodegen(root)

  root.helpers = [...context.helpers.keys()]
}

function createRootCodegen(root: any) {
  root.codegenNode = root.children[0]
}

function traverseNode(node: any, context) {
  // 优化变成外部扩展
  const nodeTransforms = context.nodeTransforms
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i]
    transform(node, context)
  }

  switch (node.type) {
    case NodeType.INTERPOLATION:
      context.helper(TO_DISPLAY_STRING)
      break

    case NodeType.ROOT:
    case NodeType.ELEMENT: // root
      traverseChildren(node, context)
      break

    default:
      break
  }
}

// 深度优先搜索 递归
function traverseChildren(node: any, context: any) {
  const children = node.children
  for (let i = 0; i < children.length; i++) {
    const node = children[i]
    traverseNode(node, context)
  }
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1)
    },
  }
  return context
}
