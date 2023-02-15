import GridCalculator from '../grid-calculator'

export default class CanvasController {
  private canvasEl: HTMLCanvasElement
  private _width: number
  private _height: number
  private static PIXEL_BYTES = 4 // [red, green, blue, alpha]

  constructor(id: string) {
    this.canvasEl = <HTMLCanvasElement> document.getElementById(id)
  }

  private get context() {
    return this.canvasEl.getContext('2d')
  }

  public set width(width: number) {
    this._width = width
    this.canvasEl.width = width
  }

  public get width(): number {
    return Math.round(this._width)
  }


  public set parentWidth(width: number) {
    // Container to center canvas
    const parentElement = this.canvasEl.parentElement
    parentElement.classList.remove('invisible')
    parentElement.setAttribute('style', `${parentElement.getAttribute('style')}; width: ${width}px`) 
  }

  public set height(height: number) {
    this._height = height
    this.canvasEl.height = height
  }

  public get height(): number {
    return Math.round(this._height)
  }

  public drawImage(image: HTMLImageElement): void {
    this.context.drawImage(image, 0, 0, this._width, this._height)
  }

  public getCanvasPixelData(): ImageData {
    return this.context.getImageData(0, 0, this._width, this._height)
  }

  public removeVerticalSeam(seam: number[]): Uint8Array {
    const imageData = this.getCanvasPixelData()
    const newImageData = this.context.createImageData(imageData.width - 1, imageData.height)
    const removedPixels = new Uint8Array(seam.length * CanvasController.PIXEL_BYTES)

    const grid = new GridCalculator(imageData.width, imageData.height)
    let copyOffset = 0, sliceStart = 0, sliceEnd = 0
    for (let row = 0; row < seam.length; row++) {
      sliceEnd = grid.getIndex(row, seam[row]) * CanvasController.PIXEL_BYTES
      newImageData.data.set(imageData.data.slice(sliceStart, sliceEnd), copyOffset)
      copyOffset += (sliceEnd - sliceStart)
      sliceStart = sliceEnd + CanvasController.PIXEL_BYTES
      removedPixels.set(imageData.data.subarray(sliceEnd, sliceStart), row * CanvasController.PIXEL_BYTES)
    }
    this.context.clearRect(0, 0, this._width, this._height)
    this.width = this.width - 1
    this.context.putImageData(newImageData, 0, 0)

    return removedPixels
  }

  public addVerticalSeam(seam: number[], pixels: Uint8Array): void {
    const imageData = this.getCanvasPixelData()
    const newImageData = this.context.createImageData(imageData.width + 1, imageData.height)

    const grid = new GridCalculator(imageData.width, imageData.height)
    let copyOffset = 0, sliceStart = 0, sliceEnd = 0
    for (let row = 0; row < seam.length; row++) {
      sliceEnd = grid.getIndex(row, seam[row]) * CanvasController.PIXEL_BYTES

      newImageData.data.set(imageData.data.slice(sliceStart, sliceEnd), copyOffset)
      copyOffset += (sliceEnd - sliceStart)

      newImageData.data.set(
        pixels.subarray(row * CanvasController.PIXEL_BYTES, (row + 1) * CanvasController.PIXEL_BYTES),
        copyOffset
      )
      copyOffset += CanvasController.PIXEL_BYTES
      sliceStart = sliceEnd 
    }
    this.context.clearRect(0, 0, this._width, this._height)
    this.width = this.width + 1
    this.context.putImageData(newImageData, 0, 0)
  }
}
