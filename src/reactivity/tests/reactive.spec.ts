import { reactive } from "../reactive"

describe("reactive", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    })
    expect(user.age).toBe(10)
  })
})
