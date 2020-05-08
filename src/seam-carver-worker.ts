import SeamCarver from "./seam-carver"

onmessage = function(event: MessageEvent) {
  const { picture, width, height } = event.data
  const carver = new SeamCarver(picture, width, height)
  const verticalSeams: Array<Array<number>> = []

  while(carver.width() > 0) {
    const seam = carver.getVerticalSeam()
    verticalSeams.push(seam)
    carver.removeVerticalSeam(seam)
  }

  this.postMessage(verticalSeams, '*')
}