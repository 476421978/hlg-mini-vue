import { effect } from "../effect"
import { proxyRefs, isRef, ref, unRef } from "../ref"

describe("ref", () => {
  it("happy path", () => {
    const a = ref(1)
    expect(a.value).toBe(1)
  })

  it("it should be reactive", () => {
    const a = ref(1)
    let dummy
    let calls = 0
    effect(() => {
      calls++, (dummy = a.value)
    })

    expect(calls).toBe(1)
    expect(dummy).toBe(1)

    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)

    // same value should not trigger 设置相同的值不触发trigger
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
  })

  it("should make nested properties reactive", () => {
    const a = ref({
      count: 1,
    })
    let dummy
    effect(() => {
      dummy = a.value.count
    })

    expect(dummy).toBe(1)
    a.value.count = 2
    expect(dummy).toBe(2)
  })

  it("isRef", () => {
    const a = ref(1)
    expect(isRef(a)).toBe(true)
    expect(isRef(1)).toBe(false)
  })

  it("unRef", () => {
    const a = ref(1)
    expect(unRef(a)).toBe(1)
    expect(unRef(1)).toBe(1)
  })

  it("proxyRefs", () => {
    const user = {
      age: ref(10),
      name: "name",
    }
    const proxyUser = proxyRefs(user)
    // template 中使用到proxyRefs可以直接读取.age获取value值
    expect(user.age.value).toBe(10)
    expect(proxyUser.age).toBe(10)
    expect(proxyUser.name).toBe("name")


    // 直接赋值数字
    proxyUser.age = 20
    expect(user.age.value).toBe(20)
    expect(proxyUser.age).toBe(20)

    // 直接赋值ref
    proxyUser.age = ref(10)
    expect(proxyUser.age).toBe(10)
    expect(user.age.value).toBe(10)
  })
})
