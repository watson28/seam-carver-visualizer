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
}
