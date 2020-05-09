import { initialiseThreeJS } from "./webGL"
import { initializeFirebase, createRoom, joinRoomById, hangUp } from "./webRTC"
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
  await getFaceVideoFeed()
  createBubbleButton.textContent = "highlight_off"
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

document
  .querySelector("#createBubbleButton")
  .addEventListener("click", toggleConnection)
