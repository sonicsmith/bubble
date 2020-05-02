import { initialiseEngine, animate, addAvatar } from "./webGL"
import { initializeFirebase, createRoom, joinRoomById, hangUp } from "./webRTC"

// initialiseEngine()
// animate()

initializeFirebase()

if (window.location.search) {
  const urlParams = new URLSearchParams(window.location.search)
  const id = urlParams.get("id")
  console.log("Room detected", id)
  joinRoomById(id)
}

const createBubble = () => {
  const createBubbleButton = document.querySelector("#createBubbleButton")
  if (createBubbleButton.textContent === "highlight_off") {
    console.log("Hang up")
    hangUp()
    createBubbleButton.textContent = "add"
  } else {
    console.log("createBubble")
    createBubbleButton.textContent = "highlight_off"
    createRoom()
  }
}

document
  .querySelector("#createBubbleButton")
  .addEventListener("click", createBubble)
