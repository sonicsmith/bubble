import * as THREE from "three"
import { getFaceTracking } from "./faceTracking"

let camera, scene, renderer

const avatars = []

export const initialiseThreeJS = () => {
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    10
  )

  scene = new THREE.Scene()

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)
}

export const addAvatar = () => {
  const video = document.getElementById("localVideo") // avatars.length

  const geometry = new THREE.SphereGeometry(0.2, 10, 10)
  const texture = new THREE.VideoTexture(video)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.format = THREE.RGBFormat

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  })

  const avatar = new THREE.Mesh(geometry, material)

  avatar.position.x = 0 //-1 + 0.5 * avatars.length
  avatar.position.y = 0
  avatar.position.z = -1

  scene.add(avatar)

  avatars.push({ object: avatar, stream: video })
}

export const animate = () => {
  requestAnimationFrame(animate)

  // avatars.forEach(({ object, stream }) => {
  //   const faceTracking = getFaceTracking()
  //   if (faceTracking) {
  //     faceTracking.then((data) => {
  //       // console.log(data.box)
  //       if (data && data.box) {
  //         const x = data.box.x / stream.videoWidth
  //         const y = data.box.y / stream.videoHeight
  //         const width = data.box.width / stream.videoWidth
  //         const height = data.box.height / stream.videoHeight
  //         console.log("{ x, y }", x, y)
  //         object.material.map.offset.x = x //0.4
  //         object.material.map.offset.y = y //-0.1
  //       }
  //     })
  //   }
  // })

  renderer.render(scene, camera)
}
