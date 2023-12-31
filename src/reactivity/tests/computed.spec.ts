import { computed } from "../computed"
import { reactive } from "../reactive"

describe("computed", () => {
  it("happy path", () => {
    // 基本实现computed
    const user = reactive({
      age: 1,
    })
    const age = computed(() => {
      return user.age
    })
    expect(user.age).toBe(1)
    expect(age.value).toBe(1)
  })

  it("should computed lazily", () => {
    const value = reactive({
      foo: 1,
    })

    const getter = jest.fn(() => {
      return value.foo
    })

    const cValue = computed(getter)
    // lazy
    expect(getter).not.toHaveBeenCalled()

    expect(cValue.value).toBe(1)

    // // should not computed again
    cValue.value // get
    expect(getter).toHaveBeenCalledTimes(1)

    // // should not computed until needed
    value.foo = 2 // trigger => effect => get 重新执行了
    expect(getter).toHaveBeenCalledTimes(1)

    // // now it should computed
    expect(cValue.value).toBe(2)
    expect(getter).toHaveBeenCalledTimes(2)

    // // should not computed again
    cValue.value
    expect(getter).toHaveBeenCalledTimes(2)
  })
})
