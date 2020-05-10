import { initialiseThreeJS } from "./webGL"
import {
  initializeFirebase,
  createRoom,
  joinRoomById,
  hangUp,
  getBubbleLink,
} from "./webRTC"
import { initialiseFaceTracking, getFaceVideoFeed } from "./faceTracking"

initialiseThreeJS()
initializeFirebase()
initialiseFaceTracking()

const createBubble = async () => {
  console.log("Create Bubble")
  createBubbleButton.textContent = "highlight_off"
  await getFaceVideoFeed()
  createRoom()
}

const joinBubble = async (id) => {
  createBubbleButton.textContent = "highlight_off"
  await getFaceVideoFeed()
  console.log("Joining bubble")
  joinRoomById(id)
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
    console.log("Hang up")
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
