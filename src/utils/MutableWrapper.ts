export default class MutableWrapper<T> {
  value: T
  constructor(value: T) {
    this.value = value
  }
  get() {
    return this.value
  }
  set(newValue: T) {
    this.value = newValue
  }
}
