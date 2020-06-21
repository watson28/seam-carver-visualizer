export default class RadioInputController {
  private nameAttr: string
  constructor(name: string) {
    this.nameAttr = name
  }

  get value(): string {
    let selectedValue = null
    document.querySelectorAll(`input[name="${this.nameAttr}"]`).forEach(el => {
      const inputElement = el as HTMLInputElement
     if(inputElement.checked) selectedValue = inputElement.value
    })
    return selectedValue
  }
}
