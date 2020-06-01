export default class InputRangeController {
  private element: HTMLInputElement
  private changeValueListeners: Array<Function>

  constructor(id: string) {
    this.changeValueListeners = []
    this.element = <HTMLInputElement> document.getElementById(id)
    this.element.value = '100' 
    this.element.addEventListener('change', this.handleNewValueEvent.bind(this))
  }

  public registerChangeValueListener(callback: (this: void, value: Number) => void) {
    this.changeValueListeners.push(callback)
  }

  public setDisabled(disabled: boolean) {
    if (disabled) this.element.setAttribute('disabled', 'disabled')
    else this.element.removeAttribute('disabled')
  }

  private handleNewValueEvent(event: Event) {
    const { value } = event.target as HTMLInputElement
    const numericValue = parseInt(value, 10)
    this.changeValueListeners.forEach(callback => callback(numericValue))
  }
}
