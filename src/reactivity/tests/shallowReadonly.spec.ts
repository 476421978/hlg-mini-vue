import { isReadonly, shallowReadonly } from "../reactive"

describe("shallowReadonly", () => {
  // 整体才是响应式
  it("should not make non-reactive properties reactive", () => {
    const props = shallowReadonly({
      n: { foo: 1 },
    })
    expect(isReadonly(props)).toBe(true)
    expect(isReadonly(props.n)).toBe(false)
  })
})
