import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { getFaceTrackingOffset } from "./faceTracking"

let camera, scene, renderer

const avatars = []

const addSkyBox = () => {
  const materialArray = []
  const skyboxImages = [
    "valley_ft.jpg",
    "valley_bk.jpg",
    "valley_up.jpg",
    "valley_dn.jpg",
    "valley_rt.jpg",
    "valley_lf.jpg",
  ]

  skyboxImages.forEach((imageName, i) => {
    const map = new THREE.TextureLoader().load(`obj/skybox/${imageName}`)
    materialArray.push(new THREE.MeshBasicMaterial({ map }))
    materialArray[i].side = THREE.BackSide
  })

  const skyboxGeo = new THREE.BoxGeometry(50, 50, 50)
  const skybox = new THREE.Mesh(skyboxGeo, materialArray)
  scene.add(skybox)
}

export const initialiseThreeJS = () => {
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  scene = new THREE.Scene()

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x444444)
  document.body.appendChild(renderer.domElement)

  addSkyBox()

  const light = new THREE.PointLight(0xffffff, 5, 100)
  light.position.set(0, 0, 0)
  scene.add(light)

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener("resize", onWindowResize, false)

  console.log("Threejs initiated, about to start animation thread")
  animate()
}

const repositionAvatars = (avatars) => {
  const visibleCircumference = 0.5 * Math.PI
  const count = avatars.length
  const halfCount = Math.ceil(count / 2)
  const offset = halfCount + (count % 2 === 0 && 0.5) - 1

  const spacing = visibleCircumference / (count + 1)
  for (let i = 0; i < count; i++) {
    avatars[i].rotation.y = i * spacing - offset * spacing
  }
}

export const addAvatar = (videoId) => {
  console.log("Adding Avatar")
  const video = document.getElementById(`remoteVideo-${videoId}`)
  const texture = new THREE.VideoTexture(video)
  texture.repeat.set(2, 2)
  texture.offset.set(-0.2, -0.3) //(-0.3, -0.3)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.format = THREE.RGBFormat

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  })

  const loader = new GLTFLoader()
  loader.load(
    "obj/hoodie/scene.gltf",
    (gltf) => {
      gltf.scene.children[0].position.y = -4.3
      gltf.scene.children[0].position.z = -5.5
      const SCALE = 7.7
      gltf.scene.children[0].scale.x = SCALE
      gltf.scene.children[0].scale.y = SCALE
      gltf.scene.children[0].scale.z = SCALE

      // Create head sphere
      const geometry = new THREE.SphereGeometry(1, 20, 20)
      const headSphere = new THREE.Mesh(geometry, material)
      headSphere.position.z = -6

      const avatar = new THREE.Group()
      avatar.add(gltf.scene.children[0])
      avatar.add(headSphere)
      avatars.push(avatar)

      repositionAvatars(avatars)

      scene.add(avatar)
      console.log("Avatar added")
    },
    undefined,
    console.error
  )
}

let lastOffset
const CAMERA_SENSITIVITY = 0.01

const setCameraMovement = () => {
  const newCameraOffset = getFaceTrackingOffset()
  if (newCameraOffset) {
    if (lastOffset) {
      camera.translateX((lastOffset.x - newCameraOffset.x) * CAMERA_SENSITIVITY)
      camera.translateY((lastOffset.y - newCameraOffset.y) * CAMERA_SENSITIVITY)
      camera.lookAt(0, 0, -7) // TODO: middle spot
    } else {
      // Set default offset (TODO: Do it better)
      camera.translateX(3)
      camera.translateY(2)
    }
    lastOffset = newCameraOffset
  }
}

const animate = () => {
  requestAnimationFrame(animate)

  setCameraMovement()

  renderer.render(scene, camera)
}
