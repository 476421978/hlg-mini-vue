import { NodeType } from "../src/ast"
import { baseParse } from "../src/parse"

describe("Parse", () => {
  describe("interpolation", () => {
    test("simple interpolation", () => {
      const ast: any = baseParse("{{ message }}")
      expect(ast.children[0]).toStrictEqual({
        type: NodeType.INTERPOLATION,
        content: {
          type: NodeType.SIMPLE_INTERPOLATION,
          content: "message",
        },
      })
    })
  })

  describe("element", () => {
    it("simple element div", () => {
      const ast: any = baseParse("<div></div>")
      expect(ast.children[0]).toStrictEqual({
        type: NodeType.ELEMENT,
        tag: "div",
        children: [],
      })
    })
  })

  describe("text", () => {
    it("simple text", () => {
      const ast: any = baseParse("some text")
      expect(ast.children[0]).toStrictEqual({
        type: NodeType.TEXT,
        content: "some text",
      })
    })
    // 综合
    test("hello world", () => {
      const ast: any = baseParse("<div>hi,{{message}}</div>")
      expect(ast.children[0]).toStrictEqual({
        type: NodeType.ELEMENT,
        tag: "div",
        children: [
          {
            type: NodeType.TEXT,
            content: "hi,",
          },
          {
            type: NodeType.INTERPOLATION,
            content: {
              type: NodeType.SIMPLE_INTERPOLATION,
              content: "message",
            },
          },
        ],
      })
    })

    test("Nest element", () => {
      const ast: any = baseParse("<div><p>hi</p>{{message}}</div>")
      expect(ast.children[0]).toStrictEqual({
        type: NodeType.ELEMENT,
        tag: "div",
        children: [
          {
            type: NodeType.ELEMENT,
            tag: "p",
            children: [
              {
                type: NodeType.TEXT,
                content: "hi",
              },
            ],
          },
          {
            type: NodeType.INTERPOLATION,
            content: {
              type: NodeType.SIMPLE_INTERPOLATION,
              content: "message",
            },
          },
        ],
      })
    })

    test("should throw error when lack end tag  ", () => {
      expect(() => {
        baseParse("<div><span></div>")
      }).toThrow("缺失结束标签:span")
    })
  })
})
