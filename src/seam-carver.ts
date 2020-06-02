import GridCalculator from "./grid-calculator"

export default class SeamCarver {
  private static BORDER_ENERGY = 1000
  distTo: Array<number>
  edgeTo: Array<number>
  picture: Uint8ClampedArray
  pixelEnergies: Uint16Array
  grid: GridCalculator

  constructor(picture: Uint8ClampedArray, pictureWidth: number, pictureHeight: number) {
    this.grid = new GridCalculator(pictureWidth, pictureHeight)
    this.pixelEnergies = new Uint16Array(this.grid.getLength())
    this.picture = picture
    for(let v = 0; v < this.grid.getLength(); v++) {
      this.pixelEnergies[v] = this.getVertexEnergy(v)
    }
  }

  public width(): number {
    return this.grid.width()
  }

  public height(): number {
    return this.grid.height()
  }

  public getVerticalSeam(): Array<number> {
    this.initDistTo(true);
    this.initEdgeTo();

    for(let v = 0; v < this.grid.getLength(); v++) {
      for (const w of this.grid.adjDownward(v)) this.relax(v, w);
    }

    let minIndex = -1;
    let minValue = Number.POSITIVE_INFINITY;
    const lastRow = this.grid.height() - 1;
    for (let col = 0; col < this.grid.width(); col++) {
      const index = this.grid.getIndex(lastRow, col);
      if (this.distTo[index] < minValue) {
        minValue = this.distTo[index];
        minIndex = index;
      }
    }

    const seam: Array<number> = []
    let seamIter: number = minIndex;
    for (let i = this.grid.height() - 1; i >= 0; i--) {
      seam[i] = this.grid.getColumnOfIndex(seamIter);
      seamIter = this.edgeTo[seamIter];
    }

    return seam;
  }

  public removeVerticalSeam(seam: Array<number>): void {
    const newWidth = this.grid.width() - 1;
    const newPictureColors = new Uint8ClampedArray(newWidth * this.grid.height() * 4);
    let copyOffset = 0, sliceStart = 0, sliceEnd = 0
    for (let row = 0; row < seam.length; row++) {
      sliceEnd = this.grid.getIndex(row, seam[row]) * 4
      newPictureColors.set(this.picture.slice(sliceStart, sliceEnd), copyOffset)
      copyOffset += (sliceEnd - sliceStart)
      sliceStart = sliceEnd + 4
    }
    this.picture = newPictureColors;
    this.removePixelEnergySeam(seam, newWidth)
    this.grid = new GridCalculator(newWidth, this.grid.height())
  }

  private removePixelEnergySeam(seam: Array<number>, newWidth: number) {
    const newPixelEnergies = new Uint16Array(newWidth * this.grid.height())
    let copyOffset = 0, sliceStart = 0, sliceEnd = 0
    for(let row = 0; row < seam.length; row++) {
      sliceEnd = this.grid.getIndex(row, seam[row])
      newPixelEnergies.set(this.pixelEnergies.slice(sliceStart, sliceEnd), copyOffset)
      copyOffset += (sliceEnd - sliceStart)
      sliceStart = sliceEnd + 1 
    }
    this.pixelEnergies = newPixelEnergies
  }

  private initDistTo(verticalOrientation: boolean) {
    this.distTo = []
    for (let i = 0; i < this.grid.getLength(); i++) {
      this.distTo[i] = Number.MAX_VALUE
      if (verticalOrientation) { // vertical orientation => first row dist = 0
        if (i < this.grid.width()) {
          this.distTo[i] = 0;
        }
      } else if (i % this.grid.width() == 0) { // horizontal orientation => first col dist = 0
        this.distTo[i] = 0;
      }
    }
  }

  private initEdgeTo() {
    this.edgeTo = []
    for (let i = 0; i < this.grid.getLength(); i++) {
      this.edgeTo[i] = -1;
    }
  }

  private relax(v: number, w: number) {
    const wEnergy = this.pixelEnergies[w];
    if (this.distTo[w] > this.distTo[v] + wEnergy) {
      this.distTo[w] = this.distTo[v] + wEnergy;
      this.edgeTo[w] = v;
    }
  }

  public energy(col: number, row: number): number {
    if (row == 0 || row == this.grid.height() - 1 || col == 0 || col == this.grid.width() - 1) {
      return SeamCarver.BORDER_ENERGY
    }

    const deltaRow = this.getColorDelta(this.getColor(col, row + 1), this.getColor(col, row - 1))
    const deltaCol = this.getColorDelta(this.getColor(col + 1, row), this.getColor(col - 1, row))

    return Math.sqrt(deltaRow + deltaCol);
  }

  private getVertexEnergy(vertex: number) {
    return this.energy(this.grid.getColumnOfIndex(vertex), this.grid.getRowOfIndex(vertex))
  }

  private getColorDelta(rgbaA: Uint8ClampedArray, rgbaB: Uint8ClampedArray) {
    return (
      Math.pow((rgbaA[0]) - (rgbaB[0]), 2) +
      Math.pow((rgbaA[1]) - (rgbaB[1]), 2) +
      Math.pow((rgbaA[2]) - (rgbaB[2]), 2)
    )
  }

  private getColor(col: number, row: number): Uint8ClampedArray {
    const redIndex = this.grid.getIndex(row, col) * 4
    return this.picture.slice(redIndex, redIndex + 4)
  }
}
