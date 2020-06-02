export default class GridCalculator {
  private _width: number
  private _height: number

  constructor(width: number, height: number) {
    this._width = width
    this._height = height
  }

  public width(): number {
    return this._width
  }

  public height(): number {
    return this._height
  }

  public getLength(): number {
    return this._width * this._height
  }

  public getColumnOfIndex(index: number): number {
    return index % this._width
  }

  public getRowOfIndex(index: number): number {
    return Math.floor(index / this._width)
  }

  public getIndex(row: number, col: number): number {
    return (this._width * row) + col;
  }

  public getIndexFromPosition(col: number, row: number, width:number): number {
    return row * width + col;
  }

  public adjDownward(index: number): number[] {
    const row = this.getRowOfIndex(index)
    const col = this.getColumnOfIndex(index)
    const neighbors: Array<number> = []

    if (row >= this.height() - 1) return neighbors;

    // bottom neighbor
    neighbors.unshift(this.getIndex(row + 1, col))

    // bottom-left neighbor
    if (col > 0) {
        neighbors.unshift(this.getIndex(row + 1, col - 1))
    }
    // bottom-right neighbor.
    if (col < this.width() - 1) {
        neighbors.unshift(this.getIndex(row + 1, col + 1))
    }
    return neighbors
  }
}
