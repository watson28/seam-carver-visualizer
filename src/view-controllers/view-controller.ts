import debounce from 'lodash/debounce'
import range from 'lodash/range'
import ProgressModalController from "./progress-modal-controller"
import CanvasController from "./canvas-controller"
import FileInputController from "./file-input-controller"
import InputRangeController from "./input-range-controller"
import { createWebWorkerExecutor } from '../seam-carver'

const IDs = {
  canvas: 'image-preview',
  fileInput: 'file-input',
  modal: 'progress-modal',
  progressBar: 'progress-bar',
  widthRange: 'width'
}

const MAX_CANVAS_WIDTH = document.body.offsetWidth * 0.8

export default class ViewController {
  private static VELOCITY = 3 // numbers of seams added/removed per update cicle
  private progressModalController: ProgressModalController
  private canvasController: CanvasController
  private fileInputController: FileInputController
  private widthInputController: InputRangeController
  private verticalSeams: number[][]
  private removedVerticalSeams: number[][]
  private removedVerticalPixels: Uint8Array[]
  private originalWidth: number
  private newWidth: number
  private updatingCanvas: boolean
  private handleWidthResizeDebounced = debounce(
    this.handleWidthResize.bind(this), 
    0
  )

  constructor() {
    this.verticalSeams = []
    this.removedVerticalSeams = []
    this.removedVerticalPixels = []
    this.progressModalController = new ProgressModalController(IDs.modal, IDs.progressBar)
    this.canvasController = new CanvasController(IDs.canvas)
    this.fileInputController = new FileInputController(IDs.fileInput)
    this.widthInputController = new InputRangeController(IDs.widthRange)
    this.updatingCanvas = false
  }

  public init(): void {
    this.fileInputController.registerChangeImageListener(this.handleNewImage.bind(this))
    this.widthInputController.setDisabled(true)
    this.widthInputController.registerChangeValueListener(this.handleWidthResizeDebounced)
  }

  private async handleNewImage(image: HTMLImageElement) {
    const scaleFactor = Math.min(MAX_CANVAS_WIDTH, image.width) / image.width
    this.originalWidth = image.width * scaleFactor
    this.canvasController.width = this.originalWidth 
    this.canvasController.height = image.height * scaleFactor
    this.canvasController.drawImage(image)
    
    this.progressModalController.show()
    this.progressModalController.setProgress(0)

    const executorService = createWebWorkerExecutor()
    executorService.registerProgressListener(
      progress => this.progressModalController.setProgress(progress)
    )
    executorService.registerResultListener(result => {
      this.verticalSeams = result
      this.progressModalController.hide()
      this.widthInputController.setDisabled(false)
    })
    executorService.start(this.canvasController.getCanvasPixelData())
  }

  private handleWidthResize(widthPercentage: number) {
    this.newWidth = Math.round(this.originalWidth * widthPercentage/100) 
    if (this.updatingCanvas) return
    this.updatingCanvas = true
    requestAnimationFrame(this.updateCanvasPixels.bind(this))
  }
  
  private updateCanvasPixels() {
    const columnDiff = this.newWidth - this.canvasController.width
    if (columnDiff === 0) {
      this.updatingCanvas = false
      return
    } 

    const operation = columnDiff < 0 ? this.removeVerticalSeam : this.addVerticalSeam
    range(
      Math.min(ViewController.VELOCITY, Math.abs(columnDiff))
    ).forEach(operation.bind(this))
    requestAnimationFrame(this.updateCanvasPixels.bind(this))
  }

  private removeVerticalSeam() {
    if(this.verticalSeams.length === 0) {
      this.updatingCanvas = false
      return
    }
    const seam = this.verticalSeams.shift()
    this.removedVerticalSeams.push(seam)
    this.removedVerticalPixels.push(
      this.canvasController.removeVerticalSeam(seam)
    )
  }

  private addVerticalSeam() {
    if (this.removedVerticalSeams.length === 0) {
      this.updatingCanvas = false
      return
    }
    const seam = this.removedVerticalSeams.pop()
    const pixels = this.removedVerticalPixels.pop()
    this.verticalSeams.unshift(seam)
    this.canvasController.addVerticalSeam(seam, pixels)
  }
}

