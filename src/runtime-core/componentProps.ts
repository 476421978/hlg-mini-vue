export function initProps(instance, rawProps) {
  instance.props = rawProps || {} // 避免undefined
}
