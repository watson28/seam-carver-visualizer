type FileEventTarget = EventTarget & { files: FileList }

export default class ViewController {
  private canvasEl: HTMLCanvasElement
  private fileInputEl: HTMLInputElement
  private changeImageListeners: Array<Function>

  constructor(canvasId: string, fileInputId: string) {
    this.changeImageListeners = []
    this.canvasEl = <HTMLCanvasElement> document.getElementById(canvasId)
    this.fileInputEl = <HTMLInputElement> document.getElementById(fileInputId)

    if (this.canvasEl === null || this.fileInputEl == null) throw new Error('Invalid id element')

    this.fileInputEl.addEventListener('change', this.handleNewFileEvent.bind(this))
  }

  public get canvasElement() {
    return this.canvasEl
  }

  public get fileInputElement() {
    return this.fileInputEl
  }

  public registerChangeImageListener(callback: (this: void, image: HTMLImageElement) => void) {
    this.changeImageListeners.push(callback)
  }

  public setCanvasDimensions(width: number, height: number) {
    this.canvasEl.width = width
    this.canvasElement.height = height
  }

  public drawImage(image: HTMLImageElement): void {
    this.canvasElement.getContext('2d')
      .drawImage(image, 0, 0, this.canvasElement.width, this.canvasElement.height)
  }

  public getCanvasPixelData(): ImageData {
    return this.canvasElement.getContext('2d')
    .getImageData(0, 0, this.canvasElement.width, this.canvasElement.height)
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