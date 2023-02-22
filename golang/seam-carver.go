package main

import (
	"math"
)

const BORDER_ENERGY = 1000

type Color = [4]uint8

type SeamCarver struct {
	distTo        []int
	edgeTo        []int
	picture       []uint8
	pixelEnergies []uint16
	grid          GridCalculator
}

func NewSeamCarver(picture []uint8, pictureWidth int, pictureHeight int) SeamCarver {
	seamCarver := SeamCarver{
		picture: picture,
		grid:    GridCalculator{width: pictureWidth, height: pictureHeight},
	}
	seamCarver.initPixelEnergies()

	return seamCarver
}

func (sc SeamCarver) GetVerticalSeam() []uint16 {
	sc.initDistTo(true)
	sc.initEdgeTo()

	length := sc.grid.GetLength()
	for v := 0; v < length; v++ {
		sc.relaxNeighbors(v)
	}

	minIndex := -1
	minValue := math.MaxInt
	lastRow := sc.grid.height - 1
	for col := 0; col < sc.grid.width; col++ {
		index := sc.grid.GetIndex(lastRow, col)
		if sc.distTo[index] < minValue {
			minValue = sc.distTo[index]
			minIndex = index
		}
	}

	seam := make([]uint16, sc.grid.height)
	seamIter := minIndex
	for i := sc.grid.height - 1; i >= 0; i-- {
		seam[i] = uint16(sc.grid.GetColumnFromIndex(seamIter))
		seamIter = sc.edgeTo[seamIter]
	}

	return seam
}

func (sc *SeamCarver) RemoveVerticalSeam(seam []uint16) {
	newWidth := sc.grid.width - 1
	newPictureColors := make([]uint8, newWidth*sc.grid.height*4)
	copyOffset := 0
	sliceStart := 0
	sliceEnd := 0
	for row := 0; row < len(seam); row++ {
		sliceEnd = sc.grid.GetIndex(row, int(seam[row])) * 4
		copy(newPictureColors[copyOffset:], sc.picture[sliceStart:sliceEnd])
		copyOffset += (sliceEnd - sliceStart)
		sliceStart = sliceEnd + 4
	}
	sc.picture = newPictureColors
	sc.removePixelEnergySeam(seam, newWidth)
	sc.grid = GridCalculator{width: newWidth, height: sc.grid.height}
}

func (sc *SeamCarver) initPixelEnergies() {
	length := sc.grid.GetLength()
	sc.pixelEnergies = make([]uint16, length)

	for v := 0; v < length; v++ {
		sc.pixelEnergies[v] = sc.getVertexEnergy(sc.grid.GetColumnFromIndex(v), sc.grid.GetRowFromIndex(v))
	}
}

func (sc SeamCarver) getVertexEnergy(col int, row int) uint16 {
	if row == 0 || row == sc.grid.height-1 || col == 0 || col == sc.grid.width-1 {
		return BORDER_ENERGY
	}

	deltaRow := sc.getColorDelta(sc.getColor(col, row+1), sc.getColor(col, row-1))
	deltaCol := sc.getColorDelta(sc.getColor(col+1, row), sc.getColor(col-1, row))

	// TODO add check conversion is not overflowing uint16
	return uint16(math.Sqrt(deltaRow + deltaCol))
}

func (sc SeamCarver) getColor(col int, row int) Color {
	redIndex := sc.grid.GetIndex(row, col) * 4
	return Color{
		sc.picture[redIndex],
		sc.picture[redIndex+1],
		sc.picture[redIndex+2],
		sc.picture[redIndex+3],
	}
}

func (sc SeamCarver) getColorDelta(a Color, b Color) float64 {
	// TODO add alpha diff?
	return math.Pow(float64(subsUint8(a[0], b[0])), 2) +
		math.Pow(float64(subsUint8(a[1], b[1])), 2) +
		math.Pow(float64(subsUint8(a[2], b[2])), 2)
}

func subsUint8(a uint8, b uint8) uint8 {
	if a > b {
		return a - b
	} else {
		return b - a
	}
}

func (sc *SeamCarver) removePixelEnergySeam(seam []uint16, newWidth int) {
	newPixelEnergies := make([]uint16, newWidth*sc.grid.height)
	copyOffset := 0
	sliceStart := 0
	sliceEnd := 0
	for row := 0; row < len(seam); row++ {
		sliceEnd = sc.grid.GetIndex(row, int(seam[row]))
		copy(newPixelEnergies[copyOffset:], sc.pixelEnergies[sliceStart:sliceEnd])
		copyOffset += (sliceEnd - sliceStart)
		sliceStart = sliceEnd + 1
	}
	sc.pixelEnergies = newPixelEnergies
}

func (sc *SeamCarver) initDistTo(verticalOrientation bool) {
	length := sc.grid.GetLength()
	sc.distTo = make([]int, length)
	for i := 0; i < sc.grid.GetLength(); i++ {
		sc.distTo[i] = math.MaxInt
		if verticalOrientation { // vertical orientation => first row dist = 0
			if i < sc.grid.width {
				sc.distTo[i] = 0
			}
		} else if i%sc.grid.width == 0 { // horizontal orientation => first col dist = 0
			sc.distTo[i] = 0
		}
	}
}

func (sc *SeamCarver) initEdgeTo() {
	length := sc.grid.GetLength()
	sc.edgeTo = make([]int, length)
	for i := 0; i < length; i++ {
		sc.edgeTo[i] = -1
	}
}

func (sc *SeamCarver) relaxNeighbors(v int) {
	row := sc.grid.GetRowFromIndex(v)
	col := sc.grid.GetColumnFromIndex(v)

	if row >= sc.grid.height-1 {
		return
	}

	// bottom neighbor
	sc.relax(v, sc.grid.GetIndex(row+1, col))

	// bottom-left neighbor
	if col > 0 {
		sc.relax(v, sc.grid.GetIndex(row+1, col-1))
	}
	// bottom-right neighbor.
	if col < sc.grid.width-1 {
		sc.relax(v, sc.grid.GetIndex(row+1, col+1))
	}
}

func (sc *SeamCarver) relax(v int, w int) {
	wEnergy := int(sc.pixelEnergies[w])
	if sc.distTo[w] > sc.distTo[v]+wEnergy {
		sc.distTo[w] = sc.distTo[v] + wEnergy
		sc.edgeTo[w] = v
	}
}
