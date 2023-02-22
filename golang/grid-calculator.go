package main

import "math"

type GridCalculator struct {
  width int
  height int
}

func (g GridCalculator) GetLength() int {
  return g.width * g.height;
}

func (g GridCalculator) GetColumnFromIndex(index int) int {
  return index % g.width;
}

func (g GridCalculator) GetRowFromIndex(index int) int {
  return int(math.Floor(float64(index / g.width)));
}

func (g GridCalculator) GetIndex(row int, col int) int {
  return (g.width * row) + col;
}
