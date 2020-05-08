import ViewController from './view-controllers/view-controller'
import WorkerClient from './worker-client'

const MAX_CANVAS_WIDTH = document.body.offsetWidth * 0.8

window.addEventListener('load', init)

function init() {
  const controller = new ViewController()
  const workerClient = new WorkerClient()

  controller.registerChangeImageListener(async image => {
    const scaleFactor = Math.min(MAX_CANVAS_WIDTH, image.width) / image.width
    const canvasWidth = image.width * scaleFactor
    const canvasHeight = image.height * scaleFactor
    controller.setCanvasDimensions(canvasWidth, canvasHeight)
    controller.drawImage(image)
    
    controller.progressModal.show()
    controller.progressModal.setProgress(0)

    workerClient.registerProgressListener(
      progress => controller.progressModal.setProgress(progress)
    )
    workerClient.registerResultListener(result => {
      console.log(result)
      controller.progressModal.hide()
    })
    workerClient.start(controller.getCanvasPixelData())
  })
}
