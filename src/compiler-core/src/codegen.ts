import { NodeType } from "./ast"
import { helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers"

export function generate(ast) {
  const context = createCodegenContext()
  const { push } = context

  genFunctionPreamble(ast, context)

  const functionName = "render"
  const args = ["_ctx", "_cache"]
  const signature = args.join(", ")

  push(`function ${functionName}(${signature}) {`)

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
  const { push } = context

  switch (node.type) {
    case NodeType.TEXT:
      push(`return "${node.content}"`)
      break
    case NodeType.INTERPOLATION:
      genInterpolation(node, context)
      break
    case NodeType.SIMPLE_INTERPOLATION:
      genExpression(node, context)
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
    }
  }
  return context
}

function genInterpolation(node: any, context: any) {
  const { push, helper} = context
  push('return ')
  push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(")")
  
}

function genExpression(node: any, context: any) {
  const { push } = context
  push(`${node.content}`)
}
