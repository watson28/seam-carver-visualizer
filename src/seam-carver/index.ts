import ExecutorServiceWebWorker from './executor-service-web-worker'
import ExecutorService from './executor-service'
import ExecutorServiceCloudFunction from './executor-service-cloud-function'

export const createWebWorkerExecutor = (): ExecutorService => new ExecutorServiceWebWorker()

export const createCloudFunctionExecutor = (): ExecutorService => new ExecutorServiceCloudFunction(process.env.CLOUD_FUNCTION_URL)

