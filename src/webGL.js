import * as THREE from "three"

let camera, scene, renderer, material

const avatars = []

export const initialiseEngine = () => {
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

export const addAvatar = (videoStream) => {
  var video = document.getElementById("video")

  var geometry = new THREE.SphereGeometry(0.2, 0.2, 0.2)
  var texture = new THREE.VideoTexture(video)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.format = THREE.RGBFormat

  var material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  })

  const avatar = new THREE.Mesh(geometry, material)
  avatars.push(avatar)
  avatar.position.x = -1 + 0.5 * avatars.length
  avatar.position.y = 0
  avatar.position.z = -1
  scene.add(avatar)
}

export const animate = () => {
  requestAnimationFrame(animate)

  renderer.render(scene, camera)
}
