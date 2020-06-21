import { Response, Request } from "express"
import Busboy from 'busboy'
import SeamCarver from "./seam-carver/seam-carver";

interface SeamCarverRequest {
  width: number
  height: number
  data: Uint8ClampedArray
}
export const handler = async (req: Request, res: Response): Promise<void> => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return
  }

  if (req.method !== 'POST') {
    res.status(405).send()
    return
  } 

  const seamCarverRequest = await parseRequestBody(req)

  const carver = new SeamCarver(seamCarverRequest.data, seamCarverRequest.width, seamCarverRequest.height)
  const verticalSeams: Array<Array<number>> = []

  while (carver.width() > 1) {
    const seam = carver.getVerticalSeam()
    carver.removeVerticalSeam(seam)
    verticalSeams.push(seam)
  }

  res.status(200).send(verticalSeams)
}

const parseRequestBody = (req: Request): Promise<SeamCarverRequest> => {
  return new Promise((resolve, reject) => {
    let width: number, height: number
    let fileContent: Promise<Buffer>
    const busboy = new Busboy({ headers: req.headers });
    busboy.on('field', (fieldname, val) => {
      if (fieldname === 'width') width = val
      if (fieldname === 'height') height = val
    })
    .on('file', (_fieldName, stream ) => {
      if (!fileContent) fileContent = readFileStream(stream)
      else stream.resume()
    })
    .on('partsLimit', () => {
      reject(new Error('multiparts request exceeded'))
    })
    .on('filesLimit', () => {
      reject(new Error('file limit request exceeded'))
    })
    .on('fieldsLimit', () => {
      reject(new Error('field limit request exceeded'))
    })
    .on('finish', async () => {
      resolve({
        width,
        height,
        data: new Uint8ClampedArray(await fileContent)
      })
    })
    busboy.end(req.body)
  })
}

const readFileStream = (file: NodeJS.ReadableStream): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const fileChunks: Array<any> = []
    file
      .on('data', data => fileChunks.push(data))
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(fileChunks)))
  })
}
