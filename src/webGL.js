import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
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

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.minDistance = 0.1
  controls.maxDistance = 0.1

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    controls.update()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener("resize", onWindowResize, false)

  console.log("Threejs initiated, about to start animation thread")
  animate()
}

const positionAvatars = (avatars) => {
  const numSpaces = avatars.length + 1
  const totalLength = 12
  const spacingDistance = totalLength / numSpaces
  const startOffset = Math.ceil(avatars.length / 2) - 1

  for (let i = 0; i < avatars.length; i++) {
    avatars[i].object.position.x = (i - startOffset) * spacingDistance
    avatars[i].object.position.y = 0
    avatars[i].object.position.z = -7
    avatars[i].object.lookAt(0, 0, 0)
  }
}

export const addAvatar = () => {
  const video = document.getElementById("remoteVideo")
  const texture = new THREE.VideoTexture(video)
  texture.repeat.set(2, 2)
  texture.offset.set(-0.3, -0.3)
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
      console.log(gltf)

      gltf.scene.children[0].position.y = -1.8
      gltf.scene.children[0].position.z = -5

      gltf.scene.children[0].scale.x = 350
      gltf.scene.children[0].scale.y = 350
      gltf.scene.children[0].scale.z = 350

      // Create head sphere
      const geometry = new THREE.SphereGeometry(1, 20, 20)
      const headSphere = new THREE.Mesh(geometry, material)
      headSphere.position.z = -6
      gltf.scene.add(headSphere)

      scene.add(gltf.scene)
    },
    undefined,
    console.error
  )

  // avatars.push({ object, texture })
  // positionAvatars(avatars)

  console.log("Avatar added")
}

const animate = () => {
  requestAnimationFrame(animate)

  renderer.render(scene, camera)
}
