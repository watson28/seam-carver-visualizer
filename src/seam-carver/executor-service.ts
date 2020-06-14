type ProgressListener = (progress: number) => void
type ResultListener = (result: Array<Array<number>>) => void

export default abstract class ExecutorService {
  private progressListeners: Array<ProgressListener>
  private resultListeners: Array<ResultListener>

  constructor() {
    this.progressListeners = []
    this.resultListeners = []
  }

  public registerProgressListener(listener: ProgressListener): void {
    this.progressListeners.push(listener)
  }

  public registerResultListener(listener: ResultListener): void {
    this.resultListeners.push(listener)
  }

  public abstract start(imageData: ImageData): void

  protected notifyProgress(progress: number): void {
    if (progress < 0 || progress > 1) throw new Error('invalid progress received')
    this.progressListeners.forEach(callback => callback(progress))
  }

  protected notifyResult(result: Array<Array<number>>): void {
    this.resultListeners.forEach(callback => callback(result))
  }
}
