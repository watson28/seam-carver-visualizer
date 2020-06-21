import SeamCarver from "./seam-carver/seam-carver"
import { WorkerResponseData, WorkerResponseDataType } from './types'

onmessage = function (event: MessageEvent) {
  const { picture, width, height } = event.data
  const carver = new SeamCarver(picture, width, height)
  const verticalSeams: Array<Array<number>> = []

  while (carver.width() > 1) {
    const seam = carver.getVerticalSeam()
    carver.removeVerticalSeam(seam)
    verticalSeams.push(seam)
    sendMessage(WorkerResponseDataType.PROGRESS, 1 - carver.width() / width)
  }

  sendMessage(WorkerResponseDataType.RESULT, verticalSeams)
}

function sendMessage(type: WorkerResponseDataType, response: number | Array<Array<number>>) {
  // @ts-ignore
  postMessage({ type, response } as WorkerResponseData)
}
