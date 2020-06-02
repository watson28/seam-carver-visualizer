import { WorkerResponseDataType } from './types'

type ProgressListener = (progress: number) => void
type ResultListener = (result: Array<Array<number>>) => void

export default class WorkerClient {
  private progressListeners: Array<ProgressListener>
  private resultListeners: Array<ResultListener>
  private worker: Worker

  constructor() {
    this.progressListeners = []
    this.resultListeners = []
    this.worker = new Worker('worker.ts')
  }

  public registerProgressListener(listener: ProgressListener): void {
    this.progressListeners.push(listener)
  }

  public registerResultListener(listener: ResultListener): void {
    this.resultListeners.push(listener)
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

    if (data.type === WorkerResponseDataType.PROGRESS) this.progressListeners.forEach(callback => callback(data.response))
    if (data.type === WorkerResponseDataType.RESULT) this.resultListeners.forEach(callback => callback(data.response))
  }
}
