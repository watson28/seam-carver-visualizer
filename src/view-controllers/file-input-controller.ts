type FileEventTarget = EventTarget & { files: FileList }

export default class FileInputController {
  private changeImageListeners: Array<(this: void, image: HTMLImageElement) => void>
  private fileInputEl: HTMLInputElement

  constructor(id: string) {
    this.changeImageListeners = []
    this.fileInputEl = <HTMLInputElement> document.getElementById(id)
    this.fileInputEl.addEventListener('change', this.handleNewFileEvent.bind(this))
  }
  public registerChangeImageListener(callback: (this: void, image: HTMLImageElement) => void): void {
    this.changeImageListeners.push(callback)
  }

  private async handleNewFileEvent(event: Event): Promise<void> {
    const { files } = event.target as FileEventTarget
    if (!files.length) return

    const image = await this.createImage(files[0])
    this.changeImageListeners.forEach(callback => callback(image))
  }

  private createImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', reject)
      image.src = URL.createObjectURL(file)
    })
  }
}
