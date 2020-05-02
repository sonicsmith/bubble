import Peer from "simple-peer"
import firebaseConfig from "./firebaseConfig.json"
import firebase from "firebase"

export const joinConnection = (offer, ownStream) => {
  firebase.initializeApp(firebaseConfig)
  const roomRef = await db.collection("rooms").doc()
  console.log("Firestore roomRef", roomRef)
  console.log("Joining connection")
  const peer = new Peer() //({ initiator: false, stream: ownStream })

  peer.on("error", (err) => console.log("error", err))

  peer.signal(offer)

  peer.on("connect", () => {
    console.log("CONNECT")
    peer.send("whatever" + Math.random())
  })

  peer.on("stream", (stream) => {
    // got remote video stream, now let's show it in a video tag
    // const video = document.createElement("video")
    const video = document.querySelector("video")
    console.log("Got Initiator Video stream", stream)
    if ("srcObject" in video) {
      video.srcObject = stream
    } else {
      video.src = window.URL.createObjectURL(stream) // for older browsers
    }

    peer.on("data", (data) => {
      console.log("peer got data: " + data)
    })

    // video.play()
  })
}

export const createConnection = (ownStream) => {
  console.log("Creating connection")

  const peer = new Peer({ initiator: true }) //, stream: ownStream })

  peer.on("error", (err) => console.log("error", err))

  const db = firebase.firestore()
  const roomRef = await db.collection("rooms").doc()

  peer.on("signal", (data) => {
    console.log("signal:", data)
    if (data.type === "offer") {
      const roomWithOffer = {
        offer: {
          type: data.type,
          sdp: data.sdp,
        },
      }
      await roomRef.set(roomWithOffer)
      roomId = roomRef.id
      console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`)
      const url = encodeURI(data.sdp)
      console.log(location.href + "?" + url)
    }
  })

  peer.on("connect", () => {
    console.log("CONNECT")
    peer.send("whatever" + Math.random())
  })

  peer.on("data", (data) => {
    console.log("peer got data: " + data)
  })

  peer.on("stream", (stream) => {
    // got remote video stream, now let's show it in a video tag
    // const video = document.createElement("video")
    const video = document.getElement("video")
    console.log("Got Joiner Video stream", stream)
    if ("srcObject" in video) {
      video.srcObject = stream
    } else {
      video.src = window.URL.createObjectURL(stream) // for older browsers
    }

    video.play()
  })
}
