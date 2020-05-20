import firebase from "firebase/app"
import "firebase/firestore"
import firebaseConfig from "./../firebaseConfig.json"
import { addAvatar } from "./webGL"

const urls = ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"]
const configuration = {
  iceServers: [{ urls }],
  iceCandidatePoolSize: 10,
}

let peerConnection = null
let localStream = null
let remoteStream = null
let roomId = null
let bubbleLink = null

export const initializeFirebase = () => {
  firebase.initializeApp(firebaseConfig)
}

export const setStreams = (_localStream, _remoteStream) => {
  localStream = _localStream
  remoteStream = _remoteStream
}

export const getBubbleLink = () => {
  return bubbleLink || "Not connected to a bubble"
}

export const createRoom = () => {
  return new Promise(async (resolve, reject) => {
    const db = firebase.firestore()
    const roomRef = await db.collection("rooms").doc()

    console.log("Create PeerConnection with configuration: ", configuration)
    peerConnection = new RTCPeerConnection(configuration)

    // registerPeerConnectionListeners()

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream)
    })

    const callerCandidatesCollection = roomRef.collection("callerCandidates")

    peerConnection.addEventListener("icecandidate", (event) => {
      if (!event.candidate) {
        console.log("Got final candidate!")
        return
      }
      console.log("Got candidate: ", event.candidate)
      callerCandidatesCollection.add(event.candidate.toJSON())
    })

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    console.log("Created offer:", offer)

    const roomWithOffer = {
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      },
    }
    await roomRef.set(roomWithOffer)
    roomId = roomRef.id
    console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`)

    bubbleLink = location.href + "?id=" + roomRef.id
    document.querySelector("#shareBubble").style.visibility = "visible"
    console.log("bubbleLink:", bubbleLink)

    peerConnection.addEventListener("track", (event) => {
      console.log("Got remote track:", event.streams[0])
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track)
      })
      if (event.track.kind === "video") {
        addAvatar()
      }
    })

    roomRef.onSnapshot(async (snapshot) => {
      const data = snapshot.data()
      if (!peerConnection.currentRemoteDescription && data && data.answer) {
        console.log("Got remote description: ", data.answer)
        const rtcSessionDescription = new RTCSessionDescription(data.answer)
        await peerConnection.setRemoteDescription(rtcSessionDescription)
      }
    })

    roomRef.collection("calleeCandidates").onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          let data = change.doc.data()
          console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`)
          await peerConnection.addIceCandidate(new RTCIceCandidate(data))
        }
      })
    })
    resolve()
  })
}

export const joinRoomById = async (roomId) => {
  return new Promise(async (resolve, reject) => {
    const db = firebase.firestore()
    const roomRef = db.collection("rooms").doc(`${roomId}`)
    const roomSnapshot = await roomRef.get()
    console.log("Got room:", roomSnapshot.exists)

    if (roomSnapshot.exists) {
      console.log("Create PeerConnection with configuration: ", configuration)
      peerConnection = new RTCPeerConnection(configuration)
      // registerPeerConnectionListeners()
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
      })

      const calleeCandidatesCollection = roomRef.collection("calleeCandidates")
      peerConnection.addEventListener("icecandidate", (event) => {
        if (!event.candidate) {
          console.log("Got final candidate!")
          return
        }
        console.log("Got candidate: ", event.candidate)
        calleeCandidatesCollection.add(event.candidate.toJSON())
      })

      peerConnection.addEventListener("track", (event) => {
        console.log("Got remote track:", event.streams[0])
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track)
        })
        if (event.track.kind === "video") {
          addAvatar()
        }
      })

      const offer = roomSnapshot.data().offer
      console.log("Got offer:", offer)
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      )
      const answer = await peerConnection.createAnswer()
      console.log("Created answer:", answer)
      await peerConnection.setLocalDescription(answer)

      const roomWithAnswer = {
        answer: {
          type: answer.type,
          sdp: answer.sdp,
        },
      }
      await roomRef.update(roomWithAnswer)

      roomRef.collection("callerCandidates").onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            let data = change.doc.data()
            console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`)
            await peerConnection.addIceCandidate(new RTCIceCandidate(data))
          }
        })
      })
    }
    resolve()
  })
}

export const hangUp = async (e) => {
  console.log("Hang up")
  const tracks = document.querySelector("#localVideo").srcObject.getTracks()
  tracks.forEach((track) => {
    track.stop()
  })

  if (remoteStream) {
    remoteStream.getTracks().forEach((track) => track.stop())
  }

  if (peerConnection) {
    peerConnection.close()
  }

  document.querySelector("#localVideo").srcObject = null
  document.querySelector("#remoteVideo").srcObject = null

  // Delete room on hangup
  if (roomId) {
    const db = firebase.firestore()
    const roomRef = db.collection("rooms").doc(roomId)
    const calleeCandidates = await roomRef.collection("calleeCandidates").get()
    calleeCandidates.forEach(async (candidate) => {
      await candidate.ref.delete()
    })
    const callerCandidates = await roomRef.collection("callerCandidates").get()
    callerCandidates.forEach(async (candidate) => {
      await candidate.ref.delete()
    })
    await roomRef.delete()
  }
  document.querySelector("#shareBubble").style.visibility = "hidden"
  bubbleLink = null

  document.location.reload(true)
}

// const registerPeerConnectionListeners = () => {
//   peerConnection.addEventListener("icegatheringstatechange", () => {
//     console.log(
//       `ICE gathering state changed: ${peerConnection.iceGatheringState}`
//     )
//   })
//   peerConnection.addEventListener("connectionstatechange", () => {
//     console.log(`Connection state change: ${peerConnection.connectionState}`)
//   })
//   peerConnection.addEventListener("signalingstatechange", () => {
//     console.log(`Signaling state change: ${peerConnection.signalingState}`)
//   })
//   peerConnection.addEventListener("iceconnectionstatechange ", () => {
//     console.log(
//       `ICE connection state change: ${peerConnection.iceConnectionState}`
//     )
//   })
// }
