package main

import "syscall/js"

func startSeamCarver(this js.Value, args []js.Value) interface{} {
	pictureLength := args[0].Length()
	picture := make([]uint8, pictureLength)
	for i := 0; i < pictureLength; i++ {
		picture[i] = uint8(args[0].Index(i).Int())
	}
	width := args[1].Int()
	height := args[2].Int()

	seamCarver := NewSeamCarver(picture, width, height)

	result := make([]interface{}, height*(width-1))
	var seam []uint16

	i := 0
	for i < height*(width-1) {
		seam = seamCarver.GetVerticalSeam()
		for j := 0; j < height; j++ {
			result[i] = seam[j]
			i = i + 1
		}
		seamCarver.RemoveVerticalSeam(seam)
		if i%10 == 0 {
			js.Global().Call("webassembly_report_progress", 1-float32(seamCarver.grid.width)/float32(width))
		}
	}
	return result
}

func main() {
	wait := make(chan struct{})
	js.Global().Set("webassembly_start_seam_carver", js.FuncOf(startSeamCarver))
	<-wait
}
