import "/vendor/wasm_exec"
import SeamCarver from "./seam-carver/seam-carver"
import { WorkerRequestData, WorkerResponseData, WorkerResponseDataType } from './types'


onmessage = function (event: MessageEvent<WorkerRequestData>) {
  const { picture, width, height, type } = event.data
  if (type === 'js') executeOnJs(picture, width, height)
  else executeOnWebAssembly(picture, width, height)
}

function executeOnJs(picture: Uint8ClampedArray, width: number, height: number) {
  const carver = new SeamCarver(picture, width, height)
  const verticalSeams: Array<Array<number>> = []

  while (carver.width() > 1) {
    const seam = carver.getVerticalSeam()
    carver.removeVerticalSeam(seam)
    verticalSeams.push(seam)
    sendMessage(WorkerResponseDataType.PROGRESS, 1 - carver.width() / width)
  }

  sendMessage(WorkerResponseDataType.RESULT, verticalSeams)
}

async function executeOnWebAssembly(picture: Uint8ClampedArray, width: number, height: number) {
  const WASM_URL = "seam-carver.wasm";
  const go = new Go();
  if ("instantiateStreaming" in WebAssembly) {
    await WebAssembly.instantiateStreaming(
      fetch(WASM_URL),
      go.importObject
    ).then((obj) => {
      const wasm = obj.instance;
      go.run(wasm);
      return wasm;
    });
  } else {
    await fetch(WASM_URL)
      .then((resp) => resp.arrayBuffer())
      .then((bytes) =>
        WebAssembly.instantiate(bytes, go.importObject).then((obj) => {
          go.run(obj.instance);
        })
      );
  }

  if (typeof (global as any).webassembly_start_seam_carver === "function") {
    (global as any).webassembly_report_progress = (progress: number) => {
      sendMessage(WorkerResponseDataType.PROGRESS, progress)
    };
    const result: number[] = (global as any).webassembly_start_seam_carver(
      picture,
      width,
      height,
    );
    const finalResult: number[][]= [];
    for (let i=0; i< width - 1; i++) {
      finalResult.push(result.slice(i*height, (i+1)*height))
    }
    sendMessage(WorkerResponseDataType.RESULT, finalResult)
  } else {
    throw new Error("Invalid wasm module export");
  }
}

function sendMessage(type: WorkerResponseDataType, response: number | Array<Array<number>>) {
  // @ts-ignore
  postMessage({ type, response } as WorkerResponseData)
}
