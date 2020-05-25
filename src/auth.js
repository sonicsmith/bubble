import firebase from "firebase/app"
import * as firebaseui from "firebaseui"
import * as ui from "./ui"

const uiConfig = {
  signInSuccessUrl: "https://bubble-vr.web.app/",
  signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
}

export const initialiseSignIn = () => {
  firebase.auth().onAuthStateChanged((user) => {
    ui.setLoggedIn(!!user)
    if (user) {
      console.log("Logged in", user)
    } else {
      const ui = new firebaseui.auth.AuthUI(firebase.auth())
      ui.start("#auth-container", uiConfig)
    }
  })
}
