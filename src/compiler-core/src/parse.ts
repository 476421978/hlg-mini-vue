import { NodeTypes } from "./ast"

const enum TagType {
  START,
  END,
}

export function baseParse(content) {
  const context = createParseContext(content)

  return createRoot(parseChildren(context, []))
}

function parseChildren(context, ancestors) {
  const nodes: any = []

  while (!isEnd(context, ancestors)) {
    let node
    const s = context.source
    if (s.startsWith("{{")) {
      node = parseInterpolation(context)
    } else if (s[0] === "<") {
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors)
      }
    }
    if (!node) {
      node = parseText(context)
    }
    nodes.push(node)
  }
  return nodes
}

function parseText(context) {
  const endTokens = ["<", "{{"]
  let endIndex = context.source.length

  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i])
    // endIndex > index 是需要要 endIndex 尽可能的小
    // 比如说：
    // hi, {{123}} <div></div>
    // 那么这里就应该停到 {{ 这里，而不是停到 <div 这里
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }

  const content = parseTextData(context, endIndex)

  return {
    type: NodeTypes.TEXT,
    content,
  }
}

function parseTextData(context: any, length) {
  const content = context.source.slice(0, length)
  advanceBy(context, length) // 推进下标
  return content
}

function parseInterpolation(context) {
  // 1. 先获取到结束的index
  // 2. 通过 closeIndex - startIndex 获取到内容的长度 contextLength
  // 3. 通过 slice 截取内容

  const openDelimiter = "{{"
  const closeDelimiter = "}}"

  // 找到 }} 下标
  const closeIndex = context.source.indexOf(
    closeDelimiter,
    closeDelimiter.length
  )
  // 去掉{{
  advanceBy(context, 2)

  // 获取 中间内容长度
  const rawContentLength = closeIndex - openDelimiter.length // message的长度
  const rawContent = context.source.slice(0, rawContentLength)

  const preTrimContent = parseTextData(context, rawContent.length) // 获取message内容
  const content = preTrimContent.trim()

  // 最后在让代码前进2个长度，可以把 }} 干掉
  advanceBy(context, closeDelimiter.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_INTERPOLATION,
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
    type: NodeTypes.ROOT
  }
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length)
}

function parseElement(context: any, ancestors) {
  // 应该如何解析 tag 呢
  // <div></div>
  // 先解析开始 tag
  // 1.解析tag
  const element: any = parseTag(context, TagType.START) // 开始标签

  ancestors.push(element)

  const children = parseChildren(context, ancestors)

  ancestors.pop()

  // 解析 end tag 是为了检测语法是不是正确的
  // 检测是不是和 start tag 一致
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.END) // 结束标签
  } else {
    throw new Error(`缺失结束标签:${element.tag}`)
  }

  // 正常结束标签才添加children
  element.children = children

  // context.source 为空表示处理完成
  return element
}

function parseTag(context: any, type: TagType) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source)
  const tag = match[1]
  // 移动光标
  // <div
  advanceBy(context, match[0].length)
  // 暂时不处理 selfClose 标签的情况 ，所以可以直接 advanceBy 1个坐标 <  的下一个就是 >
  advanceBy(context, 1)

  if (type === TagType.END) return

  return {
    type: NodeTypes.ELEMENT,
    tag,
  }
}

function isEnd(context: any, ancestors) {
  // 2、遇到结束标签
  const s = context.source
  // </div>
  if (startsWith(s, `</`)) {
    // 从后面往前面查
    // 因为便签如果存在的话 应该是 ancestors 最后一个元素
    for (let i = ancestors.length - 1; i >= 0; --i) {
      if (startsWithEndTagOpen(s, ancestors[i].tag)) {
        return true
      }
    }
  }

  return !s
}

function startsWithEndTagOpen(source: string, tag: string) {
  // 1. 头部 是不是以  </ 开头的
  // 2. 看看是不是和 tag 一样
  return (
    startsWith(source, "</") &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
  )
}

function startsWith(source: string, searchString: string): boolean {
  return source.startsWith(searchString)
}
