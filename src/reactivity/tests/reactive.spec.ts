import { isProxy, isReactive, reactive } from "../reactive"

describe("reactive", () => {
  it("happy path", () => {
    const original = { foo: 1 }
    const observed = reactive(original)
    expect(observed).not.toBe(original)
    expect(observed.foo).toBe(1)

    expect(isReactive(observed)).toBe(true)
    expect(isProxy(observed)).toBe(true)
  })

  // 多次嵌套的reactive
  it("nested reactive", () => {
    const original = {
      nested: { foo: 1 },
      arr: [{ bar: 1 }],
    }
    const observed = reactive(original)

    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.arr)).toBe(true)
    expect(isReactive(observed.arr[0])).toBe(true)
    expect(isProxy(observed)).toBe(true)
  })
})
