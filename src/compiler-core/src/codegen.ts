export function generate(ast) {
  const context = createCodegenContext()
  const { push } = context
  push("return ")

  const functionName = "render"
  const args = ["_ctx", "_cache"]
  const signature = args.join(", ")

  push(`function ${functionName}(${signature}) {`)

  getNode(ast.codegenNode, context)

  push(`}`)

  return {
    code: context.code,
  }

  // return function render(_ctx, _cache) {
  //   return "hi"
  // }
}

function getNode(node, context) {
  const { push } = context
  push(`return "${node.content}"`)
}

function createCodegenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source
    },
  }
  return context
}
