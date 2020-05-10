import GridCalculator from "./grid-calculator"
import TopologicalSort from "./topological-sort"

interface Color {
  red: number
  green: number
  blue: number
  alpha: number
}

export default class SeamCarver {
  private static BORDER_ENERGY: number = 1000 * 1000
  private static ERROR_MSG_INVALID_SEAM = 'Invalid seam input.'
  distTo: Array<number>
  edgeTo: Array<number>
  pictureColors: Uint8ClampedArray
  grid: GridCalculator

  constructor(picture: Uint8ClampedArray, pictureWidth: number, pictureHeight: number) {
    this.pictureColors = picture
    this.grid = new GridCalculator(pictureWidth, pictureHeight)
  }

  public width(): number {
    return this.grid.width()
  }

  public height(): number {
    return this.grid.height()
  }

  public getVerticalSeam(): Array<number> {
    const topologicalSort = new TopologicalSort(this.grid, true)
    this.initDistTo(true);
    this.initEdgeTo();

    for (let v of topologicalSort.order()) {
      for (let w of topologicalSort.adj(v)) this.relax(v, w);
    }

    let minIndex = -1;
    let minValue = Number.POSITIVE_INFINITY;
    let lastRow = this.grid.height() - 1;
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

  public removeVerticalSeam(seam: Array<number>) {
    if (seam == null || seam.length !== this.grid.height() || this.grid.width() <= 1) throw new Error(SeamCarver.ERROR_MSG_INVALID_SEAM);
    for (let i = 0; i < seam.length; i++) {
      if (seam[i] < 0 || seam[i] > this.grid.width() - 1 || (i < seam.length - 1 && Math.abs(seam[i] - seam[i + 1]) > 1)) {
        throw new Error(SeamCarver.ERROR_MSG_INVALID_SEAM);
      }
    }

    const newWidth = this.grid.width() - 1;
    const newPictureColors = new Uint8ClampedArray(newWidth * this.grid.height() * 4);
    let copyOffset = 0, sliceStart = 0, sliceEnd = 0
    for (let row = 0; row < seam.length; row++) {
      sliceEnd = this.getPixelColorsIndex(seam[row], row)
      const arraySlice = this.pictureColors.slice(sliceStart, sliceEnd)
      newPictureColors.set(arraySlice, copyOffset)
      copyOffset += arraySlice.length
      sliceStart = sliceEnd + 4
    }
    this.pictureColors = newPictureColors;
    this.grid = new GridCalculator(newWidth, this.grid.height())
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
    const wEnergy = this.energy(this.grid.getColumnOfIndex(w), this.grid.getRowOfIndex(w));
    if (this.distTo[w] > this.distTo[v] + wEnergy) {
      this.distTo[w] = this.distTo[v] + wEnergy;
      this.edgeTo[w] = v;
    }
  }

  public energy(col: number, row: number) {
    if (col < 0 || col > this.grid.width() - 1 || row < 0 || row > this.grid.height() - 1)
      throw new Error('Invalid argument');
    if (row == 0 || row == this.grid.height() - 1 || col == 0 || col == this.grid.width() - 1) {
      return SeamCarver.BORDER_ENERGY;
    }

    const deltaRow = this.getColorDelta(this.getColor(col, row + 1), this.getColor(col, row - 1));
    const deltaCol = this.getColorDelta(this.getColor(col + 1, row), this.getColor(col - 1, row));

    return Math.sqrt(deltaRow + deltaCol);
  }

  private getColorDelta(rgbaA: Color, rgbaB: Color) {
    return (
      Math.pow(rgbaA.red - rgbaB.red, 2) +
      Math.pow(rgbaA.green - rgbaB.green, 2) +
      Math.pow(rgbaA.blue - rgbaB.blue, 2)
    );
  }

  private getColor(col: number, row: number): Color {
    const redIndex = this.getPixelColorsIndex(col, row)
    return {
      red: this.pictureColors[redIndex],
      green: this.pictureColors[redIndex + 1],
      blue: this.pictureColors[redIndex + 2],
      alpha: this.pictureColors[redIndex + 3]
    }
  }

  private getPixelColorsIndex(col: number, row: number, width = this.grid.width()): number {
    return row * (width * 4) + col * 4
  }
}