import * as faceapi from "face-api.js"

export const initialiseFaceTracking = async () => {
  // load the models
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models")
  console.log("Loaded face recognition")
}

const isFaceDetectionModelLoaded = () => {
  return !!faceapi.nets.tinyFaceDetector.params
}

export const getFaceTracking = (input) => {
  // const input = document.getElementById("localCanvas")

  if (input.paused || input.ended || !isFaceDetectionModelLoaded()) {
    console.log("Face tracking not ready")
    return
  }

  return faceapi.detectSingleFace(input, new faceapi.TinyFaceDetectorOptions())
}

let faceBox = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
}

const startFaceTracking = (input) => {
  if (input.paused || input.ended || !isFaceDetectionModelLoaded()) {
    console.log("Face tracking not ready")
    startFaceTracking(input)
  }
  console.log("Face tracking ready")
  faceapi
    .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions())
    .run()
    .then((res) => {
      console.log(res)
      if (res) {
        faceBox = res.box
      }
      startFaceTracking(input)
    })
}

const draw = (video, canvas, context, canvasFaceCrop) => {
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  // getFaceTracking(video).then((res) => {
  const croppedImage = canvas
    .getContext("2d")
    .getImageData(faceBox.x, faceBox.y, faceBox.width, faceBox.height)
  const ctxfc = canvasFaceCrop.getContext("2d")
  ctxfc.clearRect(0, 0, canvasFaceCrop.width, canvasFaceCrop.height)
  ctxfc.beginPath()
  ctxfc.putImageData(croppedImage, 0, 0)
  // })
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

    localCanvas.width = 640
    localCanvas.height = 480

    localVideo.addEventListener(
      "play",
      () => {
        draw(localVideo, localCanvas, context, canvasFaceCrop)
        startFaceTracking(localCanvas)
      },
      false
    )

    resolve()
  })
}
