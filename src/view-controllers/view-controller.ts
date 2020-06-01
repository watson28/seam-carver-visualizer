import ProgressModalController from "./progress-modal-controller"
import CanvasController from "./canvas-controller"
import FileInputController from "./file-input-controller"
import InputRangeController from "./input-range-controller"
import WorkerClient from '../worker-client'

const IDs = {
  canvas: 'image-preview',
  fileInput: 'file-input',
  modal: 'progress-modal',
  progressBar: 'progress-bar',
  widthRange: 'width'
}

const MAX_CANVAS_WIDTH = document.body.offsetWidth * 0.8

export default class ViewController {
  private progressModalController: ProgressModalController
  private canvasController: CanvasController
  private fileInputController: FileInputController
  private widthInputController: InputRangeController
  private verticalSeams: number[][]
  private removedVerticalSeams: number[][]
  private removedVerticalPixels: Uint8Array[]
  private originalWidth: number
  private newWidth: number

  constructor() {
    this.verticalSeams = []
    this.removedVerticalSeams = []
    this.removedVerticalPixels = []
    this.progressModalController = new ProgressModalController(IDs.modal, IDs.progressBar)
    this.canvasController = new CanvasController(IDs.canvas)
    this.fileInputController = new FileInputController(IDs.fileInput)
    this.widthInputController = new InputRangeController(IDs.widthRange)
  }

  public init() {
    this.fileInputController.registerChangeImageListener(this.handleNewImage.bind(this))
    this.widthInputController.setDisabled(true)
    this.widthInputController.registerChangeValueListener(this.handleWidthResize.bind(this))
  }

  private async handleNewImage(image: HTMLImageElement) {
    const scaleFactor = Math.min(MAX_CANVAS_WIDTH, image.width) / image.width
    this.originalWidth = image.width * scaleFactor
    this.canvasController.width = this.originalWidth 
    this.canvasController.height = image.height * scaleFactor
    this.canvasController.drawImage(image)
    
    this.progressModalController.show()
    this.progressModalController.setProgress(0)

    const workerClient = new WorkerClient()
    workerClient.registerProgressListener(
      progress => this.progressModalController.setProgress(progress)
    )
    workerClient.registerResultListener(result => {
      this.verticalSeams = result
      this.progressModalController.hide()
      this.widthInputController.setDisabled(false)
    })
    workerClient.start(this.canvasController.getCanvasPixelData())
  }

  private handleWidthResize(widthPercentage: number) {
    this.newWidth = Math.round(this.originalWidth * widthPercentage/100) 
    console.log(this.newWidth)
    requestAnimationFrame(this.updateCanvasPixels.bind(this))
  }
  
  private updateCanvasPixels() {
    const width = this.canvasController.width
    if (this.newWidth === width) return 

    if (this.newWidth < width) {
      const seam = this.verticalSeams.shift()
      this.removedVerticalSeams.push(seam)
      this.removedVerticalPixels.push(
        this.canvasController.removeVerticalSeam(seam)
      )
  } else {
      const seam = this.removedVerticalSeams.pop()
      const pixels = this.removedVerticalPixels.pop()
      this.verticalSeams.unshift(seam)
      this.canvasController.addVerticalSeam(seam, pixels)
    }

    requestAnimationFrame(this.updateCanvasPixels.bind(this))
  }
}

