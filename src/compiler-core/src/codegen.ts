import { NodeTypes } from "./ast"
import { CREATE_ELEMENT_VNODE, helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers"

import { isString } from "../../shared/index"

export function generate(ast) {
  const context = createCodegenContext()
  const { push } = context

  genFunctionPreamble(ast, context)

  const functionName = "render"
  const args = ["_ctx", "_cache"]
  const signature = args.join(", ")

  push(`function ${functionName}(${signature}) {`)

  push("return ")
  genNode(ast.codegenNode, context)

  push(`}`)

  return {
    code: context.code,
  }

  // return function render(_ctx, _cache) {
  //   return "hi"
  // }
}

function genFunctionPreamble(ast: any, context: any) {
  const { push } = context
  const vueBinging = "Vue"
  const aliasHelper = (s) => `${helperMapName[s]}:_${helperMapName[s]}` // toDisplayString:_toDisplayString

  if (ast.helpers.length > 0) {
    push(`{ ${ast.helpers.map(aliasHelper).join(", ")} } = ${vueBinging}`)
  }
  push("\n")
  push("return ")
}

function genNode(node, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context)
      break
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context)
      break
    case NodeTypes.SIMPLE_INTERPOLATION:
      genExpression(node, context)
      break
    case NodeTypes.ELEMENT:
      genElement(node, context)
      break
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context)
      break
    default:
      break
  }
}

function createCodegenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source
    },
    helper(key) {
      return `_${helperMapName[key]}`
    },
  }
  return context
}

function genInterpolation(node: any, context: any) {
  const { push, helper } = context
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(")")
}

function genNodeList(nodes: any, context: any) {
  const { push } = context
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]

    if (isString(node)) {
      push(`${node}`)
    } else {
      genNode(node, context)
    }
    // node 和 node 之间需要加上 逗号(,)
    // 但是最后一个不需要 "div", [props], [children]
    if (i < nodes.length - 1) {
      push(", ")
    }
  }
}

function genNullableArgs(args) {
  // 把末尾为null 的都删除掉
  // vue3源码中，后面可能会包含 patchFlag、dynamicProps 等编译优化的信息
  // 而这些信息有可能是不存在的，所以在这边的时候需要删除掉
  let i = args.length
  // 这里 i-- 用的还是特别的巧妙的
  // 当为0 的时候自然就退出循环了
  while (i--) {
    if (args[i] != null) break
  }

  // 把为 falsy 的值都替换成 "null"
  return args.slice(0, i + 1).map((arg) => arg || "null")
}

function genElement(node, context) {
  const { push, helper } = context
  const { tag, props, children } = node

  push(`${helper(CREATE_ELEMENT_VNODE)}(`)

  genNodeList(genNullableArgs([tag, props, children]), context)

  push(`)`)
}

function genExpression(node: any, context: any) {
  context.push(node.content, node)
}

function genText(node: any, context: any) {
  const { push } = context
  push(`'${node.content}'`)
}

function genCompoundExpression(node: any, context: any) {
  const { push } = context
  const children = node.children
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (isString(child)) {
      push(child)
    } else {
      genNode(child, context)
    }
  }
}
