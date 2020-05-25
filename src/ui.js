export const setStatusText = (text) => {
  document.querySelector("#statusText").textContent = "Status: " + text
}

export const setBubbleIsConnected = (isConnected) => {
  document.querySelector("#createBubbleButton").textContent = isConnected
    ? "highlight_off"
    : "add"
}

export const setLoggedIn = (isLoggedIn) => {
  document.querySelector("#createBubbleButton").disabled = !isLoggedIn
  if (isLoggedIn) {
    document.querySelector("#loginBlock").remove()
  }
}
