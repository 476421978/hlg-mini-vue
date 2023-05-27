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
})
