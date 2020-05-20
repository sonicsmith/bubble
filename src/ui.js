export const setStatusText = (text) => {
  document.querySelector("#statusText").textContent = "Status: " + text
}

export const setBubbleIsConnected = (isConnected) => {
  document.querySelector("#createBubbleButton").textContent = isConnected
    ? "highlight_off"
    : "add"
}
