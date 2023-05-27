import { NodeType } from "./ast"

const enum TagType {
  START,
  END,
}

export function baseParse(content) {
  const context = createParseContext(content)

  return createRoot(parseChildren(context))
}

function parseChildren(context) {
  const nodes: any = []

  // {{}}
  let node
  const s = context.source
  if (s.startsWith("{{")) {
    node = parseInterpolation(context)
  } else if (s[0] === "<") {
    if (/[a-z]/i.test(s[1])) {
      node = parseElement(context)
    }
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
  context.source = advanceBy(context, rawContentLength + closeDelimiter.length)

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

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length)
}

function parseElement(context: any) {
  // 1.解析tag
  const element = parseTag(context, TagType.START) // 开始标签
  parseTag(context, TagType.END) // 结束标签
  // context.source 为空表示处理完成
  console.log("——————", context.source)

  return element
}

function parseTag(context: any, type: TagType) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source)
  //  [ '<div', 'div', index: 0, input: '<div></div>', groups: undefined ]
  const tag = match[1]
  // 2.删除处理完的代码
  advanceBy(context, match[0].length) // ></div>
  advanceBy(context, 1) // </div>

  if (type === TagType.END) return

  return {
    type: NodeType.ELEMENT,
    tag: tag,
  }
}
