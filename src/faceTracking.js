import * as faceapi from "face-api.js"
import { setStreams } from "./webRTC"

export const initialiseFaceTracking = async () => {
  // load the models
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models")
  console.log("Loaded face recognition")
}

const isFaceDetectionModelLoaded = () => {
  return !!faceapi.nets.tinyFaceDetector.params
}

// This is the position of the face
let faceBox = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
}

// This is the position of the current crop
let cropBox

const getFaceTracking = (input) => {
  if (input.paused || input.ended || !isFaceDetectionModelLoaded()) {
    console.log("Face tracking not ready")
    getFaceTracking(input)
  }
  faceapi
    .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions())
    .run()
    .then((res) => {
      if (res) {
        faceBox = res.box
      }
      getFaceTracking(input)
    })
}

const draw = (video, canvas, context, canvasFaceCrop) => {
  context.drawImage(video, 0, 0, canvas.width, canvas.height)

  if (!cropBox) {
    cropBox = faceBox
  } else {
    // const width = faceBox.width
    cropBox = {
      x: cropBox.x + (faceBox.x - cropBox.x) / 5,
      y: cropBox.y + (faceBox.y - cropBox.y) / 5,
      width: cropBox.width + (faceBox.width - cropBox.width) / 5,
      height: cropBox.height + (faceBox.height - cropBox.height) / 5,
    }
  }

  const croppedImage = canvas
    .getContext("2d")
    .getImageData(cropBox.x, cropBox.y, cropBox.width, cropBox.height)
  const ctxfc = canvasFaceCrop.getContext("2d")
  ctxfc.clearRect(0, 0, canvasFaceCrop.width, canvasFaceCrop.height)
  ctxfc.beginPath()
  ctxfc.putImageData(croppedImage, 0, 0)
  setTimeout(draw, 1, video, canvas, context, canvasFaceCrop)
}

export const getFaceVideoFeed = () => {
  return new Promise(async (resolve, reject) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    })
    const localVideo = document.querySelector("#localVideo")
    localVideo.srcObject = stream
    const localCanvas = document.querySelector("#localCanvas")
    const context = localCanvas.getContext("2d")

    const canvasFaceCrop = document.querySelector("#localCanvasCropped")

    const remoteStream = new MediaStream()
    const remoteVideo = document.querySelector("#remoteVideo")
    remoteVideo.srcObject = remoteStream

    localVideo.addEventListener(
      "play",
      () => {
        localCanvas.width = localVideo.videoWidth
        localCanvas.height = localVideo.videoHeight
        draw(localVideo, localCanvas, context, canvasFaceCrop)
        getFaceTracking(localCanvas)
      },
      false
    )

    setStreams(canvasFaceCrop.captureStream(), remoteStream)

    resolve()
  })
}
