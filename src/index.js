import { initialiseThreeJS } from "./webGL"
import {
  initializeFirebase,
  createRoom,
  joinRoomById,
  hangUp,
  getBubbleLink,
} from "./webRTC"
import { initialiseFaceTracking, getFaceVideoFeed } from "./faceTracking"
import { setStatusText } from "./ui"

initialiseThreeJS()
initializeFirebase()
initialiseFaceTracking()

const createBubble = async () => {
  setStatusText("Creating bubble...")
  console.log("Create Bubble")
  createBubbleButton.textContent = "highlight_off"
  await getFaceVideoFeed()
  createRoom()
  setStatusText("Inside bubble")
}

const joinBubble = async (id) => {
  setStatusText("Joining bubble...")
  createBubbleButton.textContent = "highlight_off"
  await getFaceVideoFeed()
  console.log("Joining bubble")
  joinRoomById(id)
  setStatusText("Inside bubble")
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
    hangUp()
    createBubbleButton.textContent = "add"
  } else {
    createBubble()
  }
}

const showBubbleInfo = () => {
  const bubbleLink = getBubbleLink()
  alert(bubbleLink)
}

document
  .querySelector("#createBubbleButton")
  .addEventListener("click", toggleConnection)
document.querySelector("#shareBubble").style.visibility = "hidden"
document.querySelector("#shareBubble").addEventListener("click", showBubbleInfo)
