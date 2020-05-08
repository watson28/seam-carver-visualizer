export interface WorkerResponseData {
  type: WorkerResponseDataType,
  response: any
}

export enum WorkerResponseDataType {
  PROGRESS = 0,
  RESULT = 1
}