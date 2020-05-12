import * as THREE from "three"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

let camera, scene, renderer

const avatars = []

const addSkyBox = () => {
  const materialArray = []
  const texture_ft = new THREE.TextureLoader().load("obj/skybox/valley_ft.jpg")
  const texture_bk = new THREE.TextureLoader().load("obj/skybox/valley_bk.jpg")
  const texture_up = new THREE.TextureLoader().load("obj/skybox/valley_up.jpg")
  const texture_dn = new THREE.TextureLoader().load("obj/skybox/valley_dn.jpg")
  const texture_rt = new THREE.TextureLoader().load("obj/skybox/valley_rt.jpg")
  const texture_lf = new THREE.TextureLoader().load("obj/skybox/valley_lf.jpg")

  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }))
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }))
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }))
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }))
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }))
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }))

  for (let i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide

  const skyboxGeo = new THREE.BoxGeometry(10, 10, 10)
  const skybox = new THREE.Mesh(skyboxGeo, materialArray)
  scene.add(skybox)
}

export const initialiseThreeJS = () => {
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    10
  )
  // camera.lookAt(0, 0, 0);
  scene = new THREE.Scene()

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x444444)
  document.body.appendChild(renderer.domElement)

  addSkyBox()

  // const controls = new OrbitControls(camera, renderer.domElement)
  // controls.minDistance = 10
  // controls.maxDistance = 11

  console.log("Threejs initiated, about to animate")
  animate()
}

const positionAvatars = (avatars) => {}

export const addAvatar = () => {
  const video = document.getElementById("remoteVideo")
  const texture = new THREE.VideoTexture(video)
  texture.repeat.set(2, 2)
  console.log("texture.offset", texture.offset)
  texture.offset.set(-0.1, -0.3)
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
  scene.add(object)
}

const animate = () => {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}
