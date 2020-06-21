import { WorkerResponseDataType } from '../types'
import ExecutorService from './executor-service'

export default class ExecutorServiceWebWorker extends ExecutorService {
  private worker: Worker

  constructor() {
    super()
    this.worker = new Worker('../web-worker.ts')
  }

  public start(imageData: ImageData): void {
    this.worker.addEventListener('message', this.handleWorkerMessage.bind(this))
    this.worker.postMessage({
      picture: imageData.data,
      width: imageData.width,
      height: imageData.height
    })
  }

  handleWorkerMessage(message: MessageEvent): void {
    const data = message.data

    if (data.type === WorkerResponseDataType.PROGRESS) this.notifyProgress(data.response)
    if (data.type === WorkerResponseDataType.RESULT) this.notifyResult(data.response)
  }
}
