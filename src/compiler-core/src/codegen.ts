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
      getCompoundExpression(node, context)
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

function genElement(node: any, context: any) {
  const { push, helper } = context
  const { tag, children } = node
  push(`${helper(CREATE_ELEMENT_VNODE)}("${tag}"), null, `)
  
  const child = children[0]
  genNode(child, context)

  push(")")
}

function genExpression(node: any, context: any) {
  context.push(node.content, node)
}

function genText(node: any, context: any) {
  const { push } = context
  push(`'${node.content}'`)
}

function getCompoundExpression(node: any, context: any) {
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
