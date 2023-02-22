export interface WorkerRequestData {
  picture: Uint8ClampedArray,
  width: number,
  height: number,
  type: 'js' | 'webAssembly'
}

export interface WorkerResponseData {
  type: WorkerResponseDataType,
  response: number | Array<Array<number>>
}

export enum WorkerResponseDataType {
  PROGRESS = 0,
  RESULT = 1
}
