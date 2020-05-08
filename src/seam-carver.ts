import GridCalculator from "./grid-calculator"
import TopologicalSort from "./topological-sort"

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
      seam[i] = seamIter % this.grid.width();
      seamIter = this.edgeTo[seamIter];
    }

    return seam;
  }

  public removeVerticalSeam(seam: Array<number>) {
    if (seam == null || seam.length != this.grid.height() || this.grid.width() <= 1) throw new Error(SeamCarver.ERROR_MSG_INVALID_SEAM);
    for (let i = 0; i < seam.length; i++) {
      if (seam[i] < 0 || seam[i] > this.grid.width() - 1 || (i < seam.length - 1 && Math.abs(seam[i] - seam[i + 1]) > 1)) {
        throw new Error(SeamCarver.ERROR_MSG_INVALID_SEAM);
      }
    }

    // TODO: improve remove using array slice.
    const newWidth = this.grid.width() - 1;
    const newPictureColors = new Uint8ClampedArray(newWidth * this.grid.height());
    for (let row = 0; row < this.grid.height(); row++) {
      for (let col = 0; col < this.grid.width(); col++) {
        const colToRemove = seam[row];
        if (col < colToRemove)
          newPictureColors[this.grid.getIndexFromPosition(col, row, newWidth)] = this.getColor(col, row);
        else if (col > colToRemove)
          newPictureColors[this.grid.getIndexFromPosition(col - 1, row, newWidth)] = this.getColor(col, row);
      }
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
    const wEnergy = this.energy(this.grid.getColumnOfIndex(v), this.grid.getRowOfIndex(w));
    if (this.distTo[w] > this.distTo[v] + wEnergy) {
      this.distTo[w] = this.distTo[v] + wEnergy;
      this.edgeTo[w] = v;
    }
  }

  private energy(col: number, row: number) {
    return Math.sqrt(this.deltaEnergy(col, row));
  }

  private deltaEnergy(col: number, row: number) {
    if (col < 0 || col > this.grid.width() - 1 || row < 0 || row > this.grid.height() - 1)
      throw new Error();
    if (row == 0 || row == this.grid.height() - 1 || col == 0 || col == this.grid.width() - 1) {
      return SeamCarver.BORDER_ENERGY;
    }

    const deltaRow = this.getColorDelta(this.getColor(col, row + 1), this.getColor(col, row - 1));
    const deltaCol = this.getColorDelta(this.getColor(col + 1, row), this.getColor(col - 1, row));

    return deltaRow + deltaCol;
  }

  private getColorDelta(rgbaA: number, rgbaB: number) {
    return (
      Math.pow(this.getRed(rgbaA) - this.getRed(rgbaB), 2) +
      Math.pow(this.getGreen(rgbaA) - this.getGreen(rgbaB), 2) +
      Math.pow(this.getBlue(rgbaA) - this.getBlue(rgbaB), 2)
    );
  }

  private getRed(rgb: number) {
    return (rgb >> 16) & 0xFF;
  }

  private getGreen(rgb: number) {
    return (rgb >> 8) & 0xFF;
  }

  private getBlue(rgb: number) {
    return (rgb >> 0) & 0xFF;
  }

  private getColor(col: number, row: number) {
    return this.pictureColors[this.grid.getIndex(col, row)];
  }
}