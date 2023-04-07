import { effect, stop } from "../effect"
import { reactive } from "../reactive"

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    })

    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(11)
    user.age++
    expect(user.age).toBe(11)
  })

  it("should return runner when call effect", () => {
    // 1.effect(fn) -> function(runner) -> fn -> return
    let foo = 10
    const runner = effect(() => {
      foo++
      return "foo"
    })

    expect(foo).toBe(11)

    const r = runner()

    expect(foo).toBe(12)
    expect(r).toBe("foo")
  })

  it("scheduler", () => {
    let dummy
    let run: any

    const scheduler = jest.fn(() => {
      run = runner
    })

    const obj = reactive({
      foo: 1,
    })

    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )

    expect(scheduler).not.toHaveBeenCalled() // 第一次没有执行
    expect(dummy).toBe(1)

    // 执行trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1) // 被执行1次

    run()
    expect(dummy).toBe(2)
  })

  it("stop", () => {
    let dummy
    const obj = reactive({
      prop: 1,
    })

    const runner = effect(() => {
      dummy = obj.prop
    })

    obj.prop = 2

    expect(dummy).toBe(2)
    stop(runner)

    obj.prop++ // 触发get set会重新收集，所以应该要禁止收集不然执行fn，dummy就会被更新，增加shouldTrack判断只收集一次

    expect(dummy).toBe(2) // obj.prop = 3 , runner的stop已经删除dep，所以不会执行fn

    runner() // 重新执行fn

    expect(dummy).toBe(3)
  })
})
