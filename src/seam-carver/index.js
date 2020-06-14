import ExecutorServiceWebWorker from './executor-service-web-worker'
import ExecutorService from './executor-service'

export const createWebWorkerExecutor = (): ExecutorService => new ExecutorServiceWebWorker()

