import ViewController from "./view-controller";

const worker: Worker = window.Worker ? new Worker('seam-carver-worker.ts') : null
const IDs = {
  canvas: 'image-preview',
  fileInput: 'file-input'
}
const MAX_CANVAS_WIDTH = document.body.offsetWidth * 0.8

window.addEventListener('load', init)

function init() {
  const controller = new ViewController(IDs.canvas, IDs.fileInput)
  controller.registerChangeImageListener(async image => {
    const scaleFactor = Math.min(MAX_CANVAS_WIDTH, image.width) / image.width
    const canvasWidth = image.width * scaleFactor
    const canvasHeight = image.height * scaleFactor
    controller.setCanvasDimensions(canvasWidth, canvasHeight)
    controller.drawImage(image)
    
    const seams = await generateSeamCarvers(controller.getCanvasPixelData())
    console.log(seams)
  })
}

function generateSeamCarvers(imageDate: ImageData): Promise<Array<Array<number>>> {
  return new Promise((resolve, reject) => {
    worker.onmessage = event => resolve(event.data)
    worker.onerror = errorEvent => reject(errorEvent) 
    worker.postMessage(imageDate)
  })
}
