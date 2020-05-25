import firebase from "firebase/app"
import firebaseConfig from "./../firebaseConfig.json"
import * as auth from "./auth"
import * as webGL from "./webGL"
import * as webRTC from "./webRTC"
import * as faceTracking from "./faceTracking"
import * as ui from "./ui"

firebase.initializeApp(firebaseConfig)

webGL.initialiseThreeJS()
faceTracking.initialiseFaceTracking()
auth.initialiseSignIn()

const createBubble = async () => {
  ui.setStatusText("Creating bubble...")
  await faceTracking.getFaceVideoFeed()
  await webRTC.createRoom()
  ui.setStatusText("Inside bubble")
  ui.setBubbleIsConnected(true)
}

const joinBubble = async (id) => {
  ui.setStatusText("Joining bubble...")
  await faceTracking.getFaceVideoFeed()
  await webRTC.joinRoomById(id)
  ui.setStatusText("Inside bubble")
  ui.setBubbleIsConnected(true)
}

if (window.location.search) {
  const urlParams = new URLSearchParams(window.location.search)
  const id = urlParams.get("id")
  console.log("Room detected", id)
  joinBubble(id)
}

const toggleConnection = () => {
  const createBubbleButton = document.querySelector("#createBubbleButton")
  if (createBubbleButton.textContent === "highlight_off") {
    webRTC.hangUp()
  } else {
    createBubble()
  }
}

const showBubbleInfo = () => {
  const bubbleLink = webRTC.getBubbleLink()
  alert(bubbleLink)
}

document
  .querySelector("#createBubbleButton")
  .addEventListener("click", toggleConnection)
document.querySelector("#shareBubble").style.visibility = "hidden"
document.querySelector("#shareBubble").addEventListener("click", showBubbleInfo)
