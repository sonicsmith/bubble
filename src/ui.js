export const setStatusText = (text) => {
  document.querySelector("#statusText").textContent = "Status: " + text
}

export const setBubbleIsConnected = (isConnected) => {
  document.querySelector("#createBubbleButton").textContent = isConnected
    ? "highlight_off"
    : "add"
}

export const setLoggedIn = (user) => {
  if (user) {
    document.querySelector("#loginBlock").remove()
    const { displayName, photoURL } = user
    document.querySelector("#profileImage").src = photoURL
    console.log(displayName, "Logged in")
  } else {
    //
  }
}
