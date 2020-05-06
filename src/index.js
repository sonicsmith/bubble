import { initialiseThreeJS, animate, addAvatar } from "./webGL"
import {
  initializeFirebase,
  createRoom,
  openWebcam,
  joinRoomById,
  hangUp,
} from "./webRTC"
import { initialiseFaceTracking, getFaceVideoFeed } from "./faceTracking"

// initialiseThreeJS()
// initializeFirebase()
initialiseFaceTracking()

// animate()

if (window.location.search) {
  const urlParams = new URLSearchParams(window.location.search)
  const id = urlParams.get("id")
  console.log("Room detected", id)
  joinRoomById(id)
}

const createBubble = async () => {
  const createBubbleButton = document.querySelector("#createBubbleButton")
  if (createBubbleButton.textContent === "highlight_off") {
    console.log("Hang up")
    hangUp()
    createBubbleButton.textContent = "add"
  } else {
    console.log("createBubble")
    createBubbleButton.textContent = "highlight_off"
    // createRoom()
    // await openWebcam()
    await getFaceVideoFeed()
    // addAvatar()
  }
}

document
  .querySelector("#createBubbleButton")
  .addEventListener("click", createBubble)
