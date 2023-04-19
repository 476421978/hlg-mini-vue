import { camelize, toHandleKey } from "../shared/index"

export function emit(instance, event, ...args) {
  // instance.props => event
  const { props } = instance
  const handleName = toHandleKey(camelize(event))
  const handel = props[handleName]
  handel && handel(...args)
}
