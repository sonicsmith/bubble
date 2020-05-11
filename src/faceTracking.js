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

// Get the coordinates of the face, and set faceBox variables
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
  // Draw on to starting canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  if (!cropBox) {
    cropBox = faceBox
  } else {
    cropBox = {
      x: cropBox.x + (faceBox.x - cropBox.x) / 5,
      y: cropBox.y + (faceBox.y - cropBox.y) / 5,
      width: cropBox.width + (faceBox.width - cropBox.width) / 5,
      height: cropBox.height + (faceBox.height - cropBox.height) / 5,
    }
  }
  // Create cropped canvas based on face
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

    // Stream to send
    const localVideo = document.querySelector("#localVideo")
    localVideo.srcObject = stream
    const localCanvas = document.querySelector("#localCanvas")
    const context = localCanvas.getContext("2d")

    // This is the incoming video stream
    const remoteStream = new MediaStream()
    const remoteVideo = document.querySelector("#remoteVideo")
    remoteVideo.srcObject = remoteStream

    localVideo.addEventListener(
      "play",
      () => {
        localCanvas.width = localVideo.videoWidth
        localCanvas.height = localVideo.videoHeight
        const canvasFaceCrop = document.querySelector("#localCanvasCropped")
        draw(localVideo, localCanvas, context, canvasFaceCrop)
        getFaceTracking(localCanvas)

        // Combine canvas stream with
        const ctx = new AudioContext()
        const dest = ctx.createMediaStreamDestination()
        const sourceNode = ctx.createMediaElementSource(localVideo)
        sourceNode.connect(dest)
        sourceNode.connect(ctx.destination)
        const audioTrack = dest.stream.getAudioTracks()[0]
        const localStream = canvasFaceCrop.captureStream()
        localStream.addTrack(audioTrack)

        setStreams(localStream, remoteStream)
        resolve()
      },
      false
    )
  })
}
