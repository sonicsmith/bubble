import * as THREE from "three"

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
  renderer.setClearColor(0xf0f0f0)
  document.body.appendChild(renderer.domElement)

  console.log("Threejs initiated, about to animate")
  animate()
}

export const addAvatar = () => {
  const video = document.getElementById("remoteVideo")
  const texture = new THREE.VideoTexture(video)

  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.format = THREE.RGBFormat

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  })
  const geometry = new THREE.SphereGeometry(0.2, 20, 20)
  const object = new THREE.Mesh(geometry, material)

  object.position.x = 0 //-1 + 0.5 * avatars.length
  object.position.y = 0
  object.position.z = -1

  scene.add(object)
  console.log("Avatar added")
  avatars.push({ object, texture })
}

export const animate = () => {
  requestAnimationFrame(animate)

  renderer.render(scene, camera)
}
