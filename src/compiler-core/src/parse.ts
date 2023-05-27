import { NodeType } from "./ast"

export function baseParse(content) {
  const context = createParseContext(content)

  return createRoot(parseChildren(context))
}

function parseChildren(context) {
  const nodes: any = []

  // {{}}
  let node
  if (context.source.startsWith("{{")) {
    node = parseInterpolation(context)
  }

  nodes.push(node)
  return nodes
}

function parseInterpolation(context) {
  // {{ message }}

  const openDelimiter = "{{"
  const closeDelimiter = "}}"

  // 找到 }} 下标
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    closeDelimiter.length
  )
  // 去掉{{
  context.source = context.source.slice(openDelimiter.length) // message}}
  // 获取 中间内容长度
  const rawContentLength = closeIndex - openDelimiter.length // message的长度

  const rawContent = context.source.slice(0, rawContentLength) // 获取message内容
  const content = rawContent.trim()

  // 移动下标到最右边表示结束
  context.source = context.source.slice(
    rawContentLength + closeDelimiter.length
  )

  return {
    type: NodeType.INTERPOLATION,
    content: {
      type: NodeType.SIMPLE_INTERPOLATION,
      content: content,
    },
  }
}

function createParseContext(content: any) {
  return {
    source: content,
  }
}

function createRoot(children) {
  return {
    children,
  }
}
