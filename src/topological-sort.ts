import GridCalculator from "./grid-calculator"

export default class TopologicalSort {
  private grid: GridCalculator
  private verticalOrientation: boolean
  private reversePost: Array<number>
  private marked: Array<Boolean>

  constructor(grid: GridCalculator, verticalOrientitation: boolean) {
    this.grid = grid
    this.verticalOrientation = verticalOrientitation

    this.reversePost = []
    this.marked = []
    /*for (let v = 0; v < this.grid.getLength(); v++)
      if (!this.marked[v]) this.deepFirstSearch(v)*/

    for(let row = 0; row < this.grid.height(); row++) {
      for (let col = 0; col < this.grid.width(); col++) {
        this.reversePost.push(this.grid.getIndex(row, col))
      }
    }
  }

  public order(): Array<number> {
    return this.reversePost
  }

  private deepFirstSearch(v: number) {
    this.marked[v] = true;
    this.adj(v).forEach((w: number) => {
      if (!this.marked[w]) this.deepFirstSearch(w)
    })
    this.reversePost.unshift(v)
  }

  public adj(v: number): Array<number> {
    const col: number = this.grid.getColumnOfIndex(v);
    const row: number = this.grid.getRowOfIndex(v);
    if (this.verticalOrientation) return this.adjDownward(row, col)
    else return this.adjRightward(row, col)
  }

  private adjDownward(row: number, col: number) {
    const neighbors: Array<number> = []

    if (row >= this.grid.height() - 1) return neighbors;

    // bottom neighbor
    neighbors.push(this.grid.getIndex(row + 1, col))

    // bottom-left neighbor
    if (col > 0) {
        neighbors.push(this.grid.getIndex(row + 1, col - 1))
    }
    // bottom-right neighbor.
    if (col < this.grid.width() - 1) {
        neighbors.push(this.grid.getIndex(row + 1, col + 1))
    }
    return neighbors
  }

  private adjRightward(row: number, col: number) {
    const neighbors: Array<number> = [];

    if (col >= this.grid.width() - 1) return neighbors;

    // right neighbor
    neighbors.push(this.grid.getIndex(row, col + 1))

    // top-right neighbor
    if (row > 0) {
        neighbors.push(this.grid.getIndex(row - 1, col + 1))
    }
    // bottom-right neighbor
    if (row < this.grid.height() - 1) {
        neighbors.push(this.grid.getIndex(row + 1, col + 1))
    }
    return neighbors
  }
}
