import ExecutorService from './executor-service'

export default class ExecutorServiceCloudFunction extends ExecutorService {
  private cloudFunctionUrl: string
  startTime: number
  timerId: NodeJS.Timeout

  constructor(cloudFunctionUrl: string) {
    super()
    this.cloudFunctionUrl = cloudFunctionUrl
  }
  public start(imageData: ImageData): void {
    const formData = new FormData()
    formData.append('width', imageData.width.toString())
    formData.append('height', imageData.height.toString())
    formData.append('data', new Blob([imageData.data.buffer]))
    fetch(this.cloudFunctionUrl, {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => { 
      clearTimeout(this.timerId)
      this.notifyResult(data)
    })

    this.startProgressSimulation()
  }

  private startProgressSimulation(): void {
    this.startTime = new Date().getTime()
    this.scheduleProgressUpdate()
  }

  private scheduleProgressUpdate(): void {
    this.timerId = setTimeout(() => {
      this.notifyProgress(this.getProgress())
      this.scheduleProgressUpdate()
    }, 1000)
  }

  private getProgress(): number {
    const x = (new Date().getTime() - this.startTime)/1000
    console.log(x)
    return -1 / (0.1*x + 1) + 1
  }
}
