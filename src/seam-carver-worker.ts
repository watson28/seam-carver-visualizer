import SeamCarver from "./seam-carver"

onmessage = function (event: MessageEvent) {
  const { data, width, height } = event.data
  const carver = new SeamCarver(data, width, height)
  const verticalSeams: Array<Array<number>> = []
  while (carver.width() > 1) {
    sendMessage(carver.width())
    const seam = carver.getVerticalSeam()
    verticalSeams.push(seam)
    carver.removeVerticalSeam(seam)
  }
  sendMessage(verticalSeams)
}

function sendMessage(message: any) {
  // @ts-ignore An argument for 'targetOrigin' was not provided.
  postMessage(message)
}