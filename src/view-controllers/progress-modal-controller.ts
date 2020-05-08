export default class ProgressModalController {
  private $element: JQuery<HTMLElement>
  private progressBarElement: HTMLElement

  constructor(id: string, progressBarId: string) {
    this.$element = $(`#${id}`)
    this.$element.modal({ keyboard: false, backdrop: 'static', show: false })
    this.progressBarElement = document.getElementById(progressBarId)
  }

  public show() {
    this.$element.modal('show')
  }

  public hide() {
    this.$element.modal('hide')
  }

  public setProgress(progress: number) {
    this.progressBarElement.style.width = `${progress * 100}%`
  }
}